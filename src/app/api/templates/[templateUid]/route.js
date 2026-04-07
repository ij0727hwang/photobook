import { getSweetBookClient } from '@/lib/sweetbook';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { templateUid } = await params;
    const client = getSweetBookClient();
    const data = await client.getTemplate(templateUid);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 500 }
    );
  }
}
