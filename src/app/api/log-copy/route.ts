import { NextRequest, NextResponse } from 'next/server';
import { logCopyActivity, getClientIP, generateSessionId } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    const { contentId, content } = await request.json();

    if (!contentId || !content) {
      return NextResponse.json({ error: 'Missing contentId or content' }, { status: 400 });
    }

    // Log the copy activity
    await logCopyActivity({
      copiedContent: content,
      contentId,
      sessionId: generateSessionId(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: getClientIP(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging copy activity:', error);
    return NextResponse.json({ error: 'Failed to log copy activity' }, { status: 500 });
  }
}
