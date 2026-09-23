import assert from "node:assert/strict";
import test from "node:test";

test("renders EvoRank 10.10 metadata without a development marker", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<title>EVORANK 10\.10<\/title>/i);
  assert.match(html, /Multi-Sport-Training mit getrennten Datenschutzfreigaben, geschützten Top-10-Bestenlisten, 500 Mobilitätsübungen, Backups und Garmin-Dauersynchronisierung/i);
  assert.doesNotMatch(html, /codex-preview/i);
});
