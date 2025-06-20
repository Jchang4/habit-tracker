import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "hello world",
    timestamp: new Date().toISOString(),
    headers: headers(),
  });
}

export async function POST() {
  return NextResponse.json({
    message: "hello world from post",
    timestamp: new Date().toISOString(),
    headers: headers(),
  });
}

export async function DELETE() {
  return NextResponse.json({
    message: "hello world from delete",
    timestamp: new Date().toISOString(),
    headers: headers(),
  });
}
