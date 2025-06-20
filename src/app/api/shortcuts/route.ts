import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "hello world from post",
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers),
    body: await request.json(),
  });
}
