import { withApiAuth } from "@/lib/with-api-auth";
import { NextRequest, NextResponse } from "next/server";

async function handler(request: NextRequest) {
  return NextResponse.json({
    message: "hello world from post",
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(request.headers),
    body: await request.json(),
  });
}

export const POST = withApiAuth(handler);
