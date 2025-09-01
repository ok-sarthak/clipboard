import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logType = searchParams.get('type') || 'all'; // 'paste', 'delete', 'copy', 'login', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    const response: Record<string, unknown> = {};

    // Simple authentication check (you can enhance this)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer admin123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (logType === 'paste' || logType === 'all') {
      const pasteLogsCollection = db.collection('paste_logs');
      const pasteLogs = await pasteLogsCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      response.pasteLogs = pasteLogs;
    }

    if (logType === 'delete' || logType === 'all') {
      const deleteLogsCollection = db.collection('delete_logs');
      const deleteLogs = await deleteLogsCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      response.deleteLogs = deleteLogs;
    }

    if (logType === 'copy' || logType === 'all') {
      const copyLogsCollection = db.collection('copy_logs');
      const copyLogs = await copyLogsCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      response.copyLogs = copyLogs;
    }

    if (logType === 'login' || logType === 'all') {
      const loginLogsCollection = db.collection('login_logs');
      const loginLogs = await loginLogsCollection
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      response.loginLogs = loginLogs;
    }

    // Add summary statistics
    response.summary = {
      totalPasteLogs: await db.collection('paste_logs').countDocuments({}),
      totalDeleteLogs: await db.collection('delete_logs').countDocuments({}),
      totalCopyLogs: await db.collection('copy_logs').countDocuments({}),
      totalLoginLogs: await db.collection('login_logs').countDocuments({}),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
