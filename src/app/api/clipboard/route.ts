import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

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

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Error saving clipboard entry:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection('clipboard_entries');

    const entries = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching clipboard entries:', error);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
