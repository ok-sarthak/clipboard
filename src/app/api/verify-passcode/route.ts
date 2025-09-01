import { NextRequest, NextResponse } from 'next/server';
import { logLoginActivity, getClientIP, generateSessionId } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();

    const defaultPasscode = process.env.DEFAULT_PASSCODE || 'admin123';
    const loginSuccess = passcode === defaultPasscode;

    // Log the login attempt for audit purposes
    await logLoginActivity({
      passcode,
      loginSuccess,
      sessionId: generateSessionId(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: getClientIP(request),
    });

    if (loginSuccess) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying passcode:', error);
    return NextResponse.json({ error: 'Failed to verify passcode' }, { status: 500 });
  }
}
