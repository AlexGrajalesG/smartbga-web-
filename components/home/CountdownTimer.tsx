"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

function msUntilMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return Math.max(0, end.getTime() - now.getTime());
}

function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    h: pad(Math.floor(totalSeconds / 3600)),
    m: pad(Math.floor((totalSeconds % 3600) / 60)),
    s: pad(totalSeconds % 60),
  };
}

/** Cuenta regresiva hasta medianoche — comunica que las ofertas flash terminan hoy. */
export default function CountdownTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    setRemaining(msUntilMidnight());
    const interval = setInterval(() => setRemaining(msUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (remaining === null) {
    return (
      <div className="flex items-center gap-3 bg-[#6a0008] text-white px-5 py-2.5 rounded-full shadow-lg shadow-[#6a0008]/20">
        <Timer size={18} />
        <span className="text-sm font-semibold tracking-wider">Termina en: <span className="font-mono font-bold">--:--:--</span></span>
      </div>
    );
  }

  const { h, m, s } = formatMs(remaining);

  return (
    <div className="flex items-center gap-3 bg-[#6a0008] text-white px-5 py-2.5 rounded-full shadow-lg shadow-[#6a0008]/20">
      <Timer size={18} />
      <span className="text-sm font-semibold tracking-wider">
        Termina en: <span className="font-mono font-bold tabular-nums">{h}:{m}:{s}</span>
      </span>
    </div>
  );
}
