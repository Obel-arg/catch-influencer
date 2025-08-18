import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // URL del backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const targetUrl = `${backendUrl}/campaign-insights/model/info`;
    
    console.log('🔄 Proxying model info request to:', targetUrl);
    
    // Hacer la llamada al backend
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    console.log('✅ Backend model info response:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 