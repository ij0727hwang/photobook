import { getSweetBookClient } from '@/lib/sweetbook';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { bookUid } = await params;
    const client = getSweetBookClient();
    const data = await client.getBook(bookUid);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { bookUid } = await params;
    const client = getSweetBookClient();
    const data = await client.deleteBook(bookUid);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 500 }
    );
  }
}
