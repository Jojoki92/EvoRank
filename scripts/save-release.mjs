import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--publish')) throw new Error('Usage: node scripts/save-release.mjs [--publish]');
const publish = args.includes('--publish');
const version = fs.readFileSync(path.join(projectRoot, 'public/rankforge/version.txt'), 'utf8').split(/\r?\n/)[0].trim();
const release = /^EvoRank (X\d+\.\d+)$/.exec(version)?.[1];
if (!release) throw new Error('Unknown app version');
const config = JSON.parse(fs.readFileSync(path.join(projectRoot, 'packaging/release-targets.json'), 'utf8'));
if (config.format !== 'extracted' || config.createZipByDefault !== false) throw new Error('Expected extracted delivery configuration');
if (config.groupByRelease !== true) throw new Error('Each release needs its own version folder');
if (!path.isAbsolute(config.extractedRoot)) throw new Error('Delivery root must be absolute');
const major = release.split('.')[0].toLowerCase();
const destination = safeChild(safeChild(config.extractedRoot, major), release);
const deliveryRoot = path.join(projectRoot, 'delivery');
const readyRoot = path.join(deliveryRoot, '.ready');
const recordPath = path.join(deliveryRoot, `EVORANK-${release}-READY.json`);
if (JSON.stringify(config.artifacts) !== JSON.stringify(['WINDOWS','NETLIFY'])) throw new Error('Expected Windows and Netlify delivery; source stays in Git');
const artifactNames = config.artifacts.map(kind => `EVORANK-${release}-${kind}`);

function safeChild(root, relative) {
  if (!relative || path.isAbsolute(relative)) throw new Error('Expected a relative child path');
  const result = path.resolve(root, relative);
  const actual = path.relative(path.resolve(root), result);
  if (!actual || actual === '..' || actual.startsWith(`..${path.sep}`) || path.isAbsolute(actual)) {
    throw new Error(`Path leaves its expected directory: ${relative}`);
  }
  return result;
}

function regularFile(file) {
  if (!fs.lstatSync(file).isFile()) throw new Error(`Expected a regular file: ${file}`);
}

function hash(file) {
  regularFile(file);
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function copyOne(source, target) {
  regularFile(source);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
}

function filesIn(root) {
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Links are not part of release packages: ${file}`);
    if (entry.isDirectory()) files.push(...filesIn(file));
    else if (entry.isFile()) files.push(file);
    else throw new Error(`Unexpected file type: ${file}`);
  }
  return files.sort();
}

function stageTree(source, target) {
  for (const file of filesIn(source)) copyOne(file, safeChild(target, path.relative(source, file)));
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

function assertNoLinks(file) {
  // Reject redirected destination directories, including existing ancestors.
  for (let current = file; ; current = path.dirname(current)) {
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error(`Linked delivery path is not allowed: ${current}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (path.dirname(current) === current) break;
  }
}

if (!publish) {
  // Prepare entirely within the workspace; external copying is a separate step.
  const stageRoot = safeChild(readyRoot, `${release}-${randomUUID()}`);
  fs.mkdirSync(stageRoot, { recursive: true });
  const webRoot = path.join(projectRoot, 'public/rankforge');
  const windowsRoot = safeChild(stageRoot, artifactNames[0]);
  stageTree(webRoot, path.join(windowsRoot, 'website'));
  stageTree(path.join(projectRoot, 'packaging/windows'), windowsRoot);
  // One current guide. Developer history stays in the existing Git checkout.
  copyOne(path.join(projectRoot, `EVORANK-${release}-ANLEITUNG.md`),
    safeChild(windowsRoot, `EVORANK-${release}-ANLEITUNG.md`));
  const legalReview=path.join(projectRoot,'docs',`EVORANK-${release}-RECHTSCHECK.md`);
  if(fs.existsSync(legalReview))copyOne(legalReview,safeChild(windowsRoot,'RECHTSCHECK.md'));
  stageTree(webRoot, safeChild(stageRoot, artifactNames[1]));
  const files = filesIn(stageRoot).map(file => ({
    Path: path.relative(stageRoot, file), Bytes: fs.statSync(file).size, SHA256: hash(file)
  }));
  writeJson(recordPath, { Release: release, Format: 'extracted', StageRoot: stageRoot, Destination: destination, Artifacts: artifactNames, Files: files });
  console.log(`Prepared ${release}: ${files.length} files. Destination: ${destination}\nManifest: ${recordPath}`);
} else {
  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  const stageRoot = safeChild(readyRoot, path.relative(readyRoot, record.StageRoot));
  if (record.Release !== release || record.Destination !== destination || record.Format !== 'extracted') throw new Error('Ready manifest does not match this delivery');
  if (!Array.isArray(record.Files) || !record.Files.length) throw new Error('Empty release manifest');
  const seen = new Set();
  // Preflight every source and existing target before the first external write.
  for (const file of record.Files) {
    const first = file.Path.split(/[\\/]/)[0];
    if (!artifactNames.includes(first)) throw new Error('Unexpected artifact directory');
    const source = safeChild(stageRoot, file.Path);
    const target = safeChild(destination, file.Path);
    if (seen.has(target.toLowerCase())) throw new Error(`Duplicate destination: ${target}`);
    seen.add(target.toLowerCase());
    assertNoLinks(source);
    assertNoLinks(target);
    if (hash(source) !== file.SHA256 || fs.statSync(source).size !== file.Bytes) throw new Error(`Prepared file changed: ${file.Path}`);
    if (fs.existsSync(target) && hash(target) !== file.SHA256) throw new Error(`Different existing file; refusing overwrite: ${target}`);
  }
  for (const name of artifactNames) {
    if (!record.Files.some(file => file.Path.split(/[\\/]/)[0] === name)) throw new Error(`Missing artifact: ${name}`);
  }
  for (const file of record.Files) {
    const target = safeChild(destination, file.Path);
    assertNoLinks(target);
    if (!fs.existsSync(target)) copyOne(safeChild(stageRoot, file.Path), target);
    if (hash(target) !== file.SHA256) throw new Error(`Copy verification failed: ${target}`);
  }
  const receipt = { Release: release, Format: 'extracted', Destination: destination, VerifiedFiles: record.Files.length, CreatedZip: false, WindowsFolder: safeChild(destination, artifactNames[0]), SavedAt: new Date().toISOString() };
  writeJson(path.join(deliveryRoot, `EVORANK-${release}-SAVED.json`), receipt);
  console.log(JSON.stringify(receipt, null, 2));
}
