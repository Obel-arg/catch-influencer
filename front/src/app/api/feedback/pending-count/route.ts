import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const targetUrl = `${backendUrl}/feedback/pending-count`;
    
    console.log('🔍 [FEEDBACK] Calling backend:', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [FEEDBACK] Backend error:', response.status, errorText);
      return NextResponse.json(
        { error: errorText || 'Error al obtener conteo de feedbacks pendientes' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [FEEDBACK] Error in feedback pending count API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'cause' in error ? error.cause : null;
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: errorMessage,
        backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
        cause: errorDetails
      },
      { status: 500 }
    );
  }
} 