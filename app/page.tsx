"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Supabase appends password-recovery credentials to the URL fragment.
    // Preserve both query and fragment while forwarding the public root to the
    // actual PWA entrypoint; otherwise the recovery session is lost and an old
    // locally cached account can appear instead.
    window.location.replace(`/rankforge/index.html${window.location.search}${window.location.hash}`);
  }, []);

  return (
    <main className="rankforge-launch" aria-label="EvoRank wird geöffnet">
      <img className="rankforge-launch__mark" src="/rankforge/icons/evorank-x4-512.png" width="160" height="160" alt="" />
      <strong>EVORANK</strong>
      <span>App wird geöffnet …</span>
      <a href="/rankforge/index.html">Jetzt öffnen</a>
    </main>
  );
}
