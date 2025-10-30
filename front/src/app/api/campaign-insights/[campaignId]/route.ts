import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;

    // 🔐 Extraer el token de autorización
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token de autorización requerido'
        },
        { status: 401 }
      );
    }

    // URL del backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const targetUrl = `${backendUrl}/campaign-insights/${campaignId}`;

    console.log('🔍 [INSIGHTS] Calling backend:', targetUrl);

    // Hacer la llamada al backend con el token
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend error: ${response.status} - ${errorText}` 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ [INSIGHTS] Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'cause' in error ? error.cause : null;
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: errorMessage,
        backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
        cause: errorDetails
      },
      { status: 500 }
    );
  }
} 