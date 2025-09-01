import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');

    const db = await getDatabase();
    const collection = db.collection('clipboard_entries');

    if (deleteAll === 'true') {
      // Delete all entries
      const result = await collection.deleteMany({});
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${result.deletedCount} entries` 
      });
    } else if (id) {
      // Delete specific entry
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 });
      }
      
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
      
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
