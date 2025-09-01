import { getDatabase } from './mongodb';

interface PasteLog {
  content: string;
  contentLength: number;
  timestamp: Date;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface DeleteLog {
  deletedContent: string;
  contentId: string;
  contentLength: number;
  timestamp: Date;
  deleteType: 'single' | 'all';
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface CopyLog {
  copiedContent: string;
  contentId: string;
  contentLength: number;
  timestamp: Date;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface LoginLog {
  loginAttempt: boolean;
  loginSuccess: boolean;
  passcode: string;
  timestamp: Date;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export async function logPasteActivity(data: {
  content: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    const db = await getDatabase();
    const pasteLogsCollection = db.collection('paste_logs');

    const logEntry: PasteLog = {
      content: data.content,
      contentLength: data.content.length,
      timestamp: new Date(),
      sessionId: data.sessionId,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    };

    await pasteLogsCollection.insertOne(logEntry);
    console.log('Paste activity logged successfully');
  } catch (error) {
    console.error('Failed to log paste activity:', error);
    // Don't throw error to prevent breaking the main functionality
  }
}

export async function logDeleteActivity(data: {
  deletedContent: string;
  contentId: string;
  deleteType: 'single' | 'all';
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    const db = await getDatabase();
    const deleteLogsCollection = db.collection('delete_logs');

    const logEntry: DeleteLog = {
      deletedContent: data.deletedContent,
      contentId: data.contentId,
      contentLength: data.deletedContent.length,
      timestamp: new Date(),
      deleteType: data.deleteType,
      sessionId: data.sessionId,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    };

    await deleteLogsCollection.insertOne(logEntry);
    console.log('Delete activity logged successfully');
  } catch (error) {
    console.error('Failed to log delete activity:', error);
    // Don't throw error to prevent breaking the main functionality
  }
}

export async function logCopyActivity(data: {
  copiedContent: string;
  contentId: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    const db = await getDatabase();
    const copyLogsCollection = db.collection('copy_logs');

    const logEntry: CopyLog = {
      copiedContent: data.copiedContent,
      contentId: data.contentId,
      contentLength: data.copiedContent.length,
      timestamp: new Date(),
      sessionId: data.sessionId,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    };

    await copyLogsCollection.insertOne(logEntry);
    console.log('Copy activity logged successfully');
  } catch (error) {
    console.error('Failed to log copy activity:', error);
    // Don't throw error to prevent breaking the main functionality
  }
}

export async function logLoginActivity(data: {
  passcode: string;
  loginSuccess: boolean;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    const db = await getDatabase();
    const loginLogsCollection = db.collection('login_logs');

    const logEntry: LoginLog = {
      loginAttempt: true,
      loginSuccess: data.loginSuccess,
      passcode: data.passcode,
      timestamp: new Date(),
      sessionId: data.sessionId,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
    };

    await loginLogsCollection.insertOne(logEntry);
    console.log('Login activity logged successfully');
  } catch (error) {
    console.error('Failed to log login activity:', error);
    // Don't throw error to prevent breaking the main functionality
  }
}

// Helper function to generate session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

// Helper function to get client IP from request headers
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-remote-addr');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  
  return 'unknown';
}
