import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logPasteActivity, getClientIP, generateSessionId } from '@/lib/auditLogger';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection('clipboard_entries');

    const result = await collection.insertOne({
      content,
      createdAt: new Date(),
    });

    // Log the paste activity for audit purposes
    await logPasteActivity({
      content,
      sessionId: generateSessionId(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: getClientIP(request),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error saving clipboard entry:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const collection = db.collection('clipboard_entries');

    // Get total count for pagination info
    const total = await collection.countDocuments({});
    
    // Get entries for current page
    const entries = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ 
      entries,
      pagination: {
        currentPage: page,
        totalPages,
        totalEntries: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching clipboard entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
