import { NextResponse } from 'next/server';

export async function GET(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .filter(Boolean)
      .map((cookie) => cookie.split('=').map((part) => part.trim()))
  );

  const status = cookies.digilockerStatus || 'PENDING';
  const verified = status === 'VERIFIED';
  const verifiedAt = cookies.digilockerVerifiedAt ? decodeURIComponent(cookies.digilockerVerifiedAt) : null;

  return NextResponse.json({ verified, status, verifiedAt });
}
