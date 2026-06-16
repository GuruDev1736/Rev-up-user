import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/digilocker/callback`;

  const authUrl = process.env.NEXT_PUBLIC_DIGILOCKER_AUTH_URL
    ? process.env.NEXT_PUBLIC_DIGILOCKER_AUTH_URL.includes("redirect_uri")
      ? process.env.NEXT_PUBLIC_DIGILOCKER_AUTH_URL
      : `${process.env.NEXT_PUBLIC_DIGILOCKER_AUTH_URL}&redirect_uri=${encodeURIComponent(redirectUri)}`
    : `${baseUrl}/api/digilocker/authorize?state=identity&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.json({ authUrl });
}
