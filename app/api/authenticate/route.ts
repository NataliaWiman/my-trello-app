import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!process.env.AUTH_PASSWORD) {
    return NextResponse.json(
      { authenticated: false, message: "Server error." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { password } = body;

  if (!password) {
    return NextResponse.json(
      { authenticated: false, message: "Password not provided." },
      { status: 400 }
    );
  }

  if (password === process.env.AUTH_PASSWORD) {
    const response = NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );

    response.cookies.set("auth-token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } else {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
