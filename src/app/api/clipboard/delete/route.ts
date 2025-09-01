import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logDeleteActivity, getClientIP, generateSessionId } from '@/lib/auditLogger';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');

    const db = await getDatabase();
    const collection = db.collection('clipboard_entries');

    const sessionId = generateSessionId();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = getClientIP(request);

    if (deleteAll === 'true') {
      // Get all entries before deleting for logging
      const allEntries = await collection.find({}).toArray();
      
      // Delete all entries
      const result = await collection.deleteMany({});

      // Log each deleted entry
      for (const entry of allEntries) {
        await logDeleteActivity({
          deletedContent: entry.content,
          contentId: entry._id.toString(),
          deleteType: 'all',
          sessionId,
          userAgent,
          ipAddress,
        });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} entries` 
      });
    } else if (id) {
      // Delete specific entry
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 });
      }
      
      // Get the entry before deleting for logging
      const entryToDelete = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!entryToDelete) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }

      // Log the delete activity
      await logDeleteActivity({
        deletedContent: entryToDelete.content,
        contentId: id,
        deleteType: 'single',
        sessionId,
        userAgent,
        ipAddress,
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Entry deleted successfully' 
      });
    } else {
      return NextResponse.json({ error: 'Missing id or deleteAll parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting clipboard entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
