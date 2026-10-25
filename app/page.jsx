"use client";

import { useEffect, useRef, useState } from "react";

const MEDIA = {
  yes: { audio: "/sigma.mp3", image: "/sigma.jpg", alt: "Sigma" },
  no: { audio: "/clown.mp4", image: "/clown.png", alt: "Clown" },
};

export default function Home() {
  const [data, setData] = useState({ yes: 0, no: 0, voted: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    fetch("/api/vote")
      .then((r) => r.json())
      .then((d) => {
        let local = null;
        try {
          local = localStorage.getItem("voted");
        } catch {}
        setData({ yes: d.yes || 0, no: d.no || 0, voted: d.voted || local });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function vote(choice) {
    if (data.voted || busy) return;
    setBusy(true);
    new Audio(MEDIA[choice].audio).play().catch(() => {});

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      const text = await res.text();
      let d = null;
      try {
        d = JSON.parse(text);
      } catch {}

      if (!d || typeof d.yes !== "number") {
        alert("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন");
        return;
      }

      try {
        localStorage.setItem("voted", d.voted || choice);
      } catch {}
      setData({ yes: d.yes, no: d.no, voted: d.voted || choice });
    } finally {
      setBusy(false);
    }
  }

  const total = data.yes + data.no;
  const yesPct = total ? Math.round((data.yes / total) * 100) : 0;
  const noPct = total ? 100 - yesPct : 0;
  const media = data.voted ? MEDIA[data.voted] : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-3xl flex-col items-center gap-7 text-center lg:gap-10">
        <h1 className="text-xl font-extrabold leading-snug sm:text-3xl lg:text-4xl">
          ৬ বছর বয়সী বাচ্চাকে চুমু খাইতে চাওয়ায় তার বাবা অপরদিকে যে চর টা মেরেছে সেটা কি ঠিক হইয়েছে?
        </h1>

        {!data.voted && (
          <div className="flex w-full justify-center gap-4">
            <button
              disabled={loading || busy}
              onClick={() => vote("yes")}
              className="max-w-[220px] flex-1 rounded-2xl bg-green-600 py-4 text-xl font-bold transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:text-2xl"
            >
              হ্যাঁ
            </button>
            <button
              disabled={loading || busy}
              onClick={() => vote("no")}
              className="max-w-[220px] flex-1 rounded-2xl bg-red-600 py-4 text-xl font-bold transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:text-2xl"
            >
              না
            </button>
          </div>
        )}

        {media && (
          <div className="aspect-square w-[75vw] max-w-[320px] animate-reveal overflow-hidden rounded-2xl bg-gray-900 opacity-0 lg:max-w-[380px]">
            <img
              src={media.image}
              alt={media.alt}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {data.voted && (
          <div className="flex w-full flex-col gap-2.5">
            <div className="flex h-12 w-full overflow-hidden rounded-xl bg-gray-700">
              <div
                className="flex items-center justify-center overflow-hidden whitespace-nowrap bg-green-600 font-bold transition-all duration-1000"
                style={{ width: `${yesPct}%` }}
              >
                {yesPct > 8 && `${yesPct}%`}
              </div>
              <div
                className="flex items-center justify-center overflow-hidden whitespace-nowrap bg-red-600 font-bold transition-all duration-1000"
                style={{ width: `${noPct}%` }}
              >
                {noPct > 8 && `${noPct}%`}
              </div>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span>
                হ্যাঁ: {yesPct}% ({data.yes})
              </span>
              <span>
                না: {noPct}% ({data.no})
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}