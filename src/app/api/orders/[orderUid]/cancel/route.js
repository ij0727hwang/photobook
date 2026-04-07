import { getSweetBookClient } from '@/lib/sweetbook';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { orderUid } = await params;
    const body = await request.json();
    const client = getSweetBookClient();
    const data = await client.cancelOrder(orderUid, body.cancelReason);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 500 }
    );
  }
}
