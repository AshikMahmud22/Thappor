import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const KEY = "poll:votes";

async function read() {
  const h = (await redis.hgetall(KEY)) || {};
  return { yes: Number(h.yes) || 0, no: Number(h.no) || 0 };
}

export async function GET(req) {
  try {
    const votes = await read();
    const voted = req.cookies.get("voted")?.value || null;
    return NextResponse.json({ ...votes, voted });
  } catch (e) {
    console.error("GET error:", e);
    return NextResponse.json({ yes: 0, no: 0, voted: null }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const existing = req.cookies.get("voted")?.value;
    if (existing) {
      const votes = await read();
      return NextResponse.json(
        { ...votes, voted: existing, error: "already voted" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const choice = body?.choice;
    if (choice !== "yes" && choice !== "no") {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    await redis.hincrby(KEY, choice, 1);
    const votes = await read();

    const res = NextResponse.json({ ...votes, voted: choice });
    res.cookies.set("voted", choice, {
      maxAge: 60 * 60 * 24 * 365 * 10,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("POST error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}