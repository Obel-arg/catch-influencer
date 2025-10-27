#!/usr/bin/env node

/**
 * Script específico para obtener los TOP 50 nichos de Instagram
 * Llamada directa a CreatorDB API
 */

require('dotenv').config();

async function getInstagramTop50Niches() {
 
  const API_KEY = process.env.CREATORDB_API_KEY;
  const BASE_URL = 'https://dev.creatordb.app/v2/topicTable';
  
  if (!API_KEY) {
   
    return;
  }

 

  try {
   
    
    const url = `${BASE_URL}?platform=instagram`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'apiId': API_KEY
      }
    });

    if (!response.ok) {
     
      return;
    }

    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.niches) {
     
      return;
    }

    // Convertir a array y ordenar por channelCount
    const instagramNiches = Object.entries(data.data.niches)
      .map(([id, niche]) => ({
        id,
        name: niche.name,
        category: niche.category,
        channelCount: niche.channelCount,
        platform: 'instagram',
        type: 'niche'
      }))
      .sort((a, b) => b.channelCount - a.channelCount);

   

    // Tomar los primeros 50
    const top50 = instagramNiches.slice(0, 50);

   
    
    top50.forEach((niche, index) => {
      const rank = (index + 1).toString().padStart(2, '0');
      const channels = niche.channelCount.toLocaleString().padStart(10);
      const name = niche.name.padEnd(20);
      
     
    });

    // Estadísticas por categorías
    const categoryStats = top50.reduce((acc, niche) => {
      acc[niche.category] = (acc[niche.category] || 0) + 1;
      return acc;
    }, {});

   
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        const percentage = ((count / 50) * 100).toFixed(1);
       
      });

    // Análisis de rangos de popularidad
    const ranges = {
      'Mega (>300k)': top50.filter(n => n.channelCount > 300000).length,
      'Alto (200k-300k)': top50.filter(n => n.channelCount >= 200000 && n.channelCount <= 300000).length,
      'Medio (100k-200k)': top50.filter(n => n.channelCount >= 100000 && n.channelCount < 200000).length,
      'Moderado (<100k)': top50.filter(n => n.channelCount < 100000).length
    };

   
    Object.entries(ranges).forEach(([range, count]) => {
      if (count > 0) {
       
      }
    });

    // Recomendaciones para frontend

    
    const topGenerales = top50.filter(n => 
      ['love', 'viral', 'fyp', 'trending', 'explore', 'instagood'].includes(n.name)
    );
    
    const topTematicos = top50.filter(n => 
      ['travel', 'music', 'fashion', 'art', 'photography', 'beauty', 'fitness', 'food'].includes(n.name)
    );
    
    const topEstacionales = top50.filter(n => 
      ['christmas', 'summer', 'halloween', 'valentine'].includes(n.name)
    );

   

    if (topEstacionales.length > 0) {
     
    }

    // JSON para usar en el frontend
    const frontendData = {
      timestamp: new Date().toISOString(),
      platform: 'instagram',
      total_nichos_disponibles: instagramNiches.length,
      top_50_nichos: top50.map((n, index) => ({
        rank: index + 1,
        id: n.id,
        name: n.name,
        display_name: n.name.charAt(0).toUpperCase() + n.name.slice(1), // Para mostrar capitalizado
        channelCount: n.channelCount,
        category: n.category,
        popularity_level: n.channelCount > 300000 ? 'mega' : 
                         n.channelCount > 200000 ? 'alto' : 
                         n.channelCount > 100000 ? 'medio' : 'moderado'
      })),
      categorias_disponibles: Object.keys(categoryStats),
      recomendaciones_frontend: {
        nichos_generales: topGenerales.slice(0, 10).map(n => ({
          name: n.name,
          display_name: n.name.charAt(0).toUpperCase() + n.name.slice(1),
          channelCount: n.channelCount
        })),
        nichos_tematicos: topTematicos.slice(0, 10).map(n => ({
          name: n.name,
          display_name: n.name.charAt(0).toUpperCase() + n.name.slice(1),
          channelCount: n.channelCount
        })),
        nichos_estacionales: topEstacionales.map(n => ({
          name: n.name,
          display_name: n.name.charAt(0).toUpperCase() + n.name.slice(1),
          channelCount: n.channelCount
        }))
      },
      fuente: 'CreatorDB API v2',
      para_frontend: true
    };

   

  } catch (error) {
   
    throw error;
  }
}

// Verificar fetch disponible
async function ensureFetch() {
  if (typeof fetch === 'undefined') {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  }
}

// Ejecutar script
if (require.main === module) {
  ensureFetch()
    .then(() => getInstagramTop50Niches())
    .then(() => {
     
      process.exit(0);
    })
    .catch((error) => {
     
      process.exit(1);
    });
}

module.exports = { getInstagramTop50Niches }; 
