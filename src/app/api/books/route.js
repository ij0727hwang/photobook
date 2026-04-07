import { getSweetBookClient } from '@/lib/sweetbook';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const client = getSweetBookClient();
    const idempotencyKey = request.headers.get('Idempotency-Key') || `book-${Date.now()}`;
    const data = await client.createBook(body, idempotencyKey);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message, data: error.data },
      { status: error.status || 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = getSweetBookClient();
    const data = await client.getBooks({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 500 }
    );
  }
}
