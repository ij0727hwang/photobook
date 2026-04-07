import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { bookUid } = await params;
    const formData = await request.formData();
    
    const apiFormData = new FormData();
    
    // Handle single file upload from frontend (field name 'file')
    const singleFile = formData.get('file');
    if (singleFile && singleFile instanceof Blob) {
      // Extract original filename, ensure proper extension
      let fileName = singleFile.name || 'photo.jpg';
      
      // Read the first few bytes to detect actual format
      const arrBuf = await singleFile.arrayBuffer();
      const bytes = new Uint8Array(arrBuf.slice(0, 4));
      
      // Detect actual image format from magic bytes
      let detectedExt = '.jpg'; // default
      if (bytes[0] === 0x89 && bytes[1] === 0x50) {
        detectedExt = '.png';
      } else if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
        detectedExt = '.jpg';
      } else if (bytes[0] === 0x47 && bytes[1] === 0x49) {
        detectedExt = '.gif';
      } else if (bytes[0] === 0x52 && bytes[1] === 0x49) {
        detectedExt = '.webp';
      } else if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
        detectedExt = '.bmp';
      }
      
      // Ensure the filename extension matches the actual format
      const baseName = fileName.replace(/\.[^.]+$/, '');
      fileName = baseName + detectedExt;
      
      // Determine correct mime type
      const mimeMap = {
        '.jpg': 'image/jpeg',
        '.png': 'image/png', 
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
      };
      const mimeType = mimeMap[detectedExt] || 'image/jpeg';
      
      // Re-create blob with correct type and proper filename
      const correctedBlob = new Blob([arrBuf], { type: mimeType });
      apiFormData.append('file', correctedBlob, fileName);
    }

    const apiKey = process.env.SWEETBOOK_API_KEY;
    const env = process.env.SWEETBOOK_ENV || 'sandbox';
    const baseUrl = env === 'live' 
      ? 'https://api.sweetbook.com/v1' 
      : 'https://api-sandbox.sweetbook.com/v1';

    const response = await fetch(`${baseUrl}/books/${bookUid}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: apiFormData,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { bookUid } = await params;
    const apiKey = process.env.SWEETBOOK_API_KEY;
    const env = process.env.SWEETBOOK_ENV || 'sandbox';
    const baseUrl = env === 'live' 
      ? 'https://api.sweetbook.com/v1' 
      : 'https://api-sandbox.sweetbook.com/v1';

    const response = await fetch(`${baseUrl}/books/${bookUid}/photos`, {
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
