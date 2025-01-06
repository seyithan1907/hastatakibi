import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET(request: Request) {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  return NextResponse.json({ hashedPassword });
} 