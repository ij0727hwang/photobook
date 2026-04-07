import { getSweetBookClient } from '@/lib/sweetbook';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { bookUid } = await params;
    const client = getSweetBookClient();
    const data = await client.finalizeBook(bookUid);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message, data: error.data },
      { status: error.status || 500 }
    );
  }
}
