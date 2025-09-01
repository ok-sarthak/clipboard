import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    const defaultPasscode = process.env.DEFAULT_PASSCODE || 'admin123';

    if (passcode === defaultPasscode) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying passcode:', error);
    return NextResponse.json({ error: 'Failed to verify passcode' }, { status: 500 });
  }
}
