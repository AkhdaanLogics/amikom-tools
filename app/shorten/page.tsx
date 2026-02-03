"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase";

export default function ShortenPage() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    if (!url) return alert("URL tidak boleh kosong");

    setLoading(true);

    // Get user session token
    const supabase = createBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const res = await fetch("/api/shorten", {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    const nextShortUrl = data?.shortUrl
      ? data.shortUrl
      : data?.slug
        ? `${window.location.origin}/${data.slug}`
        : "";
    setShortUrl(nextShortUrl);
    setLoading(false);
  };

  const onCopy = async () => {
    if (!shortUrl) return;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.3),_transparent_55%)]" />
        <div className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
          <div className="grid w-full gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-purple-100">
                <Link2 size={14} /> URL Shortener
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold">
                Pendekkan link dalam hitungan detik
              </h1>
              <p className="mt-4 text-purple-100">
                Link aktif selama 7 hari. Pantau klik dan bagikan dengan lebih
                rapi.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-purple-100">
                Tips: gunakan link lengkap (https://) agar hasil lebih akurat.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <label className="text-sm text-purple-100">URL asli</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                <input
                  className="w-full bg-transparent text-sm text-white placeholder:text-purple-200/60 focus:outline-none"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-purple-500/20 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Shorten URL"}
              </button>

              {shortUrl && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-purple-200">
                    Hasil
                  </p>
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    <a
                      href={shortUrl}
                      target="_blank"
                      className="text-sm text-purple-100 hover:text-white break-all"
                    >
                      {shortUrl}
                    </a>
                    <button
                      onClick={onCopy}
                      className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
