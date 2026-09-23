"""Build verified, ordinary topic ZIPs under 30 MB for the X5.7 AI handover.

No dependencies beyond Python's standard library. Does not upload, modify app
files or delete anything. All git-tracked working-tree files must match HEAD.
The current app snapshot is augmented only by curated design references.
"""

import argparse
import hashlib
import json
import re
import subprocess
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

LIMIT = 30_000_000
PAYLOAD_LIMIT = 28_000_000
ROOT = "EVORANK-UEBERGABE-X5.7"
GUIDES = "docs/uebergabe-x5.7/"
BASE_APP_COMMIT = "983cefb"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(repo, *args):
    return subprocess.check_output(["git", "-C", str(repo), *args])


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def topic(path):
    if path.startswith(("db/", "drizzle/", "worker/", "examples/", "public/rankforge/netlify/")) or path in {
        "netlify.env.example", "public/rankforge/netlify.toml",
        "public/rankforge/cloud-config.js", "public/rankforge/garmin-connect-config.js",
    }:
        return "03-CLOUD-BACKEND"
    if path.startswith(("public/rankforge/native/", "public/rankforge/splash/", "public/rankforge/icons/")) or path in {
        "public/rankforge/apple-touch-icon.png", "public/rankforge/INSTALLATION-iPHONE.txt",
        "public/rankforge/assets/evorank-alarm-x4.5.wav",
    }:
        return "04-IPHONE-DYNAMIC-ISLAND"
    if path.startswith("docs/brand-") or (
        path.startswith("public/rankforge/assets/") and
        Path(path).suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".ico"}
    ):
        return "05-GRAFIKEN-UND-ABZEICHEN"
    if path.startswith(("docs/", "public/rankforge/docs/", "public/rankforge/licenses/", "dev-tools/")) or (
        "/" not in path and path not in {"README.md", "AGENTS.md", "CONTINUE-HERE-X5.7.md", "EVORANK-X5.7-ANLEITUNG.md"}
        and Path(path).suffix.lower() in {".md", ".txt", ".json"}
        and path not in {"package.json", "package-lock.json", "tsconfig.json"}
    ):
        return "06-DOKUMENTATION-HISTORIE"
    return "02-APP-QUELLCODE"


def scan_secret_patterns(entries):
    """Block high-confidence credential formats, never print matched values."""
    patterns = {
        "private-key": rb"-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----\s+[A-Za-z0-9+/=\r\n]{60,}",
        "supabase-secret": rb"\bsb_secret_[A-Za-z0-9_-]{20,}",
        "github-pat": rb"\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})",
        "stripe-live-secret": rb"\bsk_live_[A-Za-z0-9]{20,}",
        "aws-access-key": rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
    }
    hits = []
    for entry in entries:
        if entry["kind"] != "project":
            continue
        path, data = entry["source"], entry["data"]
        if Path(path).name.startswith(".env") or Path(path).suffix.lower() in {".pem", ".p12", ".pfx", ".key"}:
            hits.append({"file": path, "pattern": "credential-file"})
        if b"\x00" in data[:8192]:
            continue
        for label, pattern in patterns.items():
            if re.search(pattern, data):
                hits.append({"file": path, "pattern": label})
        # Public anon JWTs can be expected; privileged service_role JWTs cannot.
        for match in re.finditer(rb"\beyJ[A-Za-z0-9_-]+\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+", data):
            import base64
            try:
                payload = match.group(1)
                payload += b"=" * (-len(payload) % 4)
                claims = json.loads(base64.urlsafe_b64decode(payload))
                if claims.get("role") == "service_role":
                    hits.append({"file": path, "pattern": "service-role-jwt"})
            except (ValueError, UnicodeDecodeError):
                pass
    if hits:
        raise RuntimeError("Credential pattern check requires review: " + json.dumps(hits))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path, help="New empty staging directory")
    parser.add_argument("--masters", required=True, type=Path, help="Directory containing the 36 imagegen masters")
    parser.add_argument("--reference-dir", type=Path, help="Defaults to output/designs in the repository")
    args = parser.parse_args()
    repo = Path(__file__).resolve().parent.parent
    output = args.output.resolve()
    if output.exists():
        raise RuntimeError(f"Refusing to overwrite existing output: {output}")
    if git(repo, "diff", "HEAD", "--name-only").strip():
        raise RuntimeError("Tracked working-tree changes exist; save the intended snapshot in Git first.")
    files = sorted(p for p in git(repo, "ls-files", "-z").decode("utf-8").split("\0") if p)
    commit = git(repo, "rev-parse", "HEAD").decode().strip()
    created = datetime.now(timezone.utc).isoformat()
    entries = []
    paths = set()

    def add(group, rel, data, kind, source):
        parts = PurePosixPath(rel)
        if parts.is_absolute() or ".." in parts.parts or "\\" in rel:
            raise RuntimeError(f"Unsafe archive path: {rel}")
        archive_path = ROOT + "/" + rel
        if archive_path in paths:
            raise RuntimeError(f"Duplicate archive path: {archive_path}")
        if len(data) > PAYLOAD_LIMIT:
            raise RuntimeError(f"Individual file too large: {source}")
        paths.add(archive_path)
        entries.append(dict(group=group, path=archive_path, data=data, kind=kind, source=source, bytes=len(data), sha256=sha(data)))

    for rel in files:
        src = repo / rel
        if src.is_symlink() or not src.is_file() or not src.resolve().is_relative_to(repo):
            raise RuntimeError(f"Not a regular repository file: {rel}")
        add(topic(rel), "projekt/" + rel, src.read_bytes(), "project", rel)
    for guide in sorted((repo / GUIDES).glob("*.md")):
        add("01-KI-UEBERGABE", "00-UEBERGABE/" + guide.name, guide.read_bytes(), "handover", GUIDES + guide.name)
    log = git(repo, "log", "--date=iso-strict", "--format=%h | %ad | %s")
    add("01-KI-UEBERGABE", "00-UEBERGABE/GIT-VERLAUF.txt", log, "git-log", "git log (commit summaries, not git objects)")

    export = json.loads((repo / "docs/EVORANK-X5.7-ICON-EXPORT.json").read_text(encoding="utf-8-sig"))
    if len(export["icons"]) != 36:
        raise RuntimeError("Expected exactly 36 icon masters")
    master_map = []
    for icon in export["icons"]:
        src = args.masters / icon["generatedMaster"]
        data = src.read_bytes()
        if len(data) != icon["masterBytes"]:
            raise RuntimeError(f"Master size differs from export record: {icon['file']}")
        target = "design-master/ranks-x5.7/" + icon["file"]
        add("07-DESIGN-MASTER", target, data, "design-master", icon["generatedMaster"])
        master_map.append({"file": target, "generatedName": icon["generatedMaster"], "bytes": len(data), "sha256": sha(data),
                           "appExport": "projekt/public/rankforge/assets/ranks-x5.7/" + icon["file"], "appExportSha256": icon["sha256"]})
    add("01-KI-UEBERGABE", "00-UEBERGABE/DESIGN-MASTER-ZUORDNUNG.json", json_bytes(master_map), "master-map", "X5.7 export manifest")
    reference_dir = args.reference_dir or repo / "output/designs"
    for name in ["evorank-kompetenzfarben-entwurf.png", "evorank-kompetenzfarben-prompt.txt"]:
        add("07-DESIGN-MASTER", "design-master/referenzen/" + name, (reference_dir / name).read_bytes(), "design-reference", "output/designs/" + name)

    scan_secret_patterns(entries)
    project_entries = [e for e in entries if e["kind"] == "project"]
    assert sorted(e["source"] for e in project_entries) == files
    groups = defaultdict(list)
    for entry in entries:
        groups[entry["group"]].append(entry)
    archives = []
    for group, members in sorted(groups.items()):
        chunks, chunk, size = [], [], 0
        for member in sorted(members, key=lambda e: e["path"]):
            if chunk and size + member["bytes"] > PAYLOAD_LIMIT:
                chunks.append(chunk)
                chunk, size = [], 0
            chunk.append(member)
            size += member["bytes"]
        if chunk:
            chunks.append(chunk)
        for i, chunk in enumerate(chunks, 1):
            suffix = f"-TEIL-{i:02d}" if len(chunks) > 1 else ""
            name = f"EVORANK-X5.7-{group}{suffix}.zip"
            for member in chunk:
                member["archive"] = name
            archives.append({"name": name, "entries": chunk})

    manifest = {
        "release": "X5.7", "appCommit": BASE_APP_COMMIT, "snapshotCommit": commit,
        "createdUtc": created, "maxZipBytesExclusive": LIMIT,
        "trackedProjectFiles": len(files), "trackedProjectBytes": sum(e["bytes"] for e in project_entries),
        "files": [{k: e[k] for k in ["path", "archive", "kind", "source", "bytes", "sha256"]} for e in entries],
        "note": "Manifest does not hash itself. Includes every tracked project file and only named curated extras. No git objects, dependency installations, private media or account data.",
        "credentialPatternCheck": "Known high-confidence patterns checked; this is not a full security audit. Existing browser publishable key retained.",
    }
    manifest_data = json_bytes(manifest)
    first = next(a for a in archives if "01-KI-UEBERGABE" in a["name"])
    manifest_path = ROOT + "/00-UEBERGABE/DATEI-MANIFEST.json"
    first["entries"].append({"path": manifest_path, "data": manifest_data, "bytes": len(manifest_data), "sha256": sha(manifest_data)})

    output.mkdir(parents=True)
    result = []
    verified = set()
    for archive in archives:
        target = output / archive["name"]
        expected = {e["path"]: e for e in archive["entries"]}
        unpacked = sum(e["bytes"] for e in archive["entries"])
        if unpacked >= LIMIT:
            raise RuntimeError("Uncompressed archive contents exceeded strict size limit")
        with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            for member in archive["entries"]:
                z.writestr(member["path"], member["data"])
        zip_bytes = target.stat().st_size
        if zip_bytes >= LIMIT:
            raise RuntimeError(f"Archive too large: {target.name}: {zip_bytes}")
        with zipfile.ZipFile(target) as z:
            if z.testzip() is not None or set(z.namelist()) != set(expected):
                raise RuntimeError(f"ZIP integrity failed: {target.name}")
            for member in z.infolist():
                if member.filename in verified:
                    raise RuntimeError(f"Duplicated entry between archives: {member.filename}")
                data = z.read(member)
                e = expected[member.filename]
                if len(data) != e["bytes"] or sha(data) != e["sha256"]:
                    raise RuntimeError(f"Hash verification failed: {member.filename}")
                verified.add(member.filename)
        result.append({"file": target.name, "bytes": zip_bytes, "MB_decimal": round(zip_bytes / 1_000_000, 3),
                       "unpackedBytes": unpacked, "files": len(expected), "sha256": sha(target.read_bytes())})
    assert verified == paths | {manifest_path}
    report = {
        "release": "X5.7", "appCommit": BASE_APP_COMMIT, "snapshotCommit": commit,
        "createdUtc": created, "archives": result, "zipCount": len(result),
        "totalZipBytes": sum(a["bytes"] for a in result), "strictLimitBytes": LIMIT,
        "everyZipBelowLimit": all(a["bytes"] < LIMIT for a in result),
        "everyUnpackedPartBelowLimit": all(a["unpackedBytes"] < LIMIT for a in result),
        "verifiedEntries": len(verified), "trackedProjectFiles": len(files),
        "allTrackedProjectFilesIncluded": True, "crcAndSha256Verified": True,
    }
    (output / "PAKET-PRUEFBERICHT.json").write_bytes(json_bytes(report))
    lines = ["# EvoRank X5.7 – KI-Übergabe", "", "Zuerst die ZIP 01-KI-UEBERGABE lesen; danach alle ZIPs in denselben leeren Ordner entpacken.",
             "Einstieg: EVORANK-UEBERGABE-X5.7/00-UEBERGABE/00-START-HIER.md", "", "Alle Dateien gehören zusammen. Keine ZIP erreicht 30.000.000 Bytes.", "",
             "| ZIP | Größe (MB, dezimal) |", "| --- | ---: |"]
    lines.extend(f"| {a['file']} | {a['MB_decimal']:.3f} |" for a in result)
    lines += ["", f"Vollständiger versionierter Projektstand: {len(files)} Dateien. Snapshot: {commit}.",
              "App unverändert X5.7. Keine privaten Kontodaten oder Server-Secrets mitgeliefert; bestehender öffentlicher Browser-Key enthalten.",
              "Cloud-Einrichtung, echte iPhone-/Xcode-Prüfungen und rechtliche Betreiber-/Rechtenachweise bleiben wie dokumentiert offen.",
              "CRC und SHA-256 für alle ZIP-Inhalte geprüft. Details in PAKET-PRUEFBERICHT.json und im Dateimanifest der ersten ZIP.", ""]
    (output / "START-HIER.md").write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
