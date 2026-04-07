import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { bookUid } = await params;
    const { searchParams } = new URL(request.url);
    const breakBefore = searchParams.get('breakBefore') || 'page';
    
    const formData = await request.formData();
    const apiFormData = new FormData();
    
    const templateUid = formData.get('templateUid');
    if (templateUid) apiFormData.append('templateUid', templateUid);
    
    const parameters = formData.get('parameters');
    if (parameters) apiFormData.append('parameters', parameters);

    // Forward any image files
    for (const [key, value] of formData.entries()) {
      if (key !== 'templateUid' && key !== 'parameters' && value instanceof Blob) {
        apiFormData.append(key, value, value.name || 'image.jpg');
      }
    }

    const apiKey = process.env.SWEETBOOK_API_KEY;
    const env = process.env.SWEETBOOK_ENV || 'sandbox';
    const baseUrl = env === 'live' 
      ? 'https://api.sweetbook.com/v1' 
      : 'https://api-sandbox.sweetbook.com/v1';

    const response = await fetch(`${baseUrl}/books/${bookUid}/contents?breakBefore=${breakBefore}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: apiFormData,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Contents error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { bookUid } = await params;
    const apiKey = process.env.SWEETBOOK_API_KEY;
    const env = process.env.SWEETBOOK_ENV || 'sandbox';
    const baseUrl = env === 'live' 
      ? 'https://api.sweetbook.com/v1' 
      : 'https://api-sandbox.sweetbook.com/v1';

    const response = await fetch(`${baseUrl}/books/${bookUid}/contents`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
