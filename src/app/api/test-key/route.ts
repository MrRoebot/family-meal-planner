import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
    const regularKey = process.env.FIREBASE_PRIVATE_KEY;
    
    let decodedKey = null;
    let decodeError = null;
    
    if (base64Key) {
      try {
        decodedKey = Buffer.from(base64Key, 'base64').toString('utf8');
      } catch (error) {
        decodeError = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    
    return NextResponse.json({
      success: true,
      environment: {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT_SET',
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT_SET',
        FIREBASE_PRIVATE_KEY: regularKey ? 'SET' : 'NOT_SET',
        FIREBASE_PRIVATE_KEY_BASE64: base64Key ? 'SET' : 'NOT_SET',
      },
      keyTest: {
        hasBase64Key: !!base64Key,
        hasRegularKey: !!regularKey,
        decodedKeyLength: decodedKey ? decodedKey.length : 0,
        decodeError: decodeError,
        decodedKeyPreview: decodedKey ? decodedKey.substring(0, 50) + '...' : null,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
