import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return new NextResponse("Missing email or password", { status: 400 });
  }

  // Simple demo auth: accept any non-empty credentials
  const res = new NextResponse("OK", { status: 200 });
  res.cookies.set("auth", "1", { httpOnly: true, path: "/" });
  return res;
}


