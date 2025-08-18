import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: 'Debug endpoint working'
  });
} 