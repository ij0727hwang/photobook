import { getSweetBookClient } from '@/lib/sweetbook';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const client = getSweetBookClient();
    const data = await client.getTemplates({
      bookSpecUid: searchParams.get('bookSpecUid'),
      templateKind: searchParams.get('templateKind'),
      category: searchParams.get('category'),
      theme: searchParams.get('theme'),
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
