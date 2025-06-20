import { NextRequest, NextResponse } from "next/server";

const VALID_API_KEY = process.env.API_KEY;

export function validateApiKey(request: NextRequest): NextResponse | undefined {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== VALID_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return undefined;
}
