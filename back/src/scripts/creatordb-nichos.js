#!/usr/bin/env node

/**
 * Script que llama directamente a la API de CreatorDB para obtener nichos
 * URL: https://dev.creatordb.app/v2/topicTable
 */

require('dotenv').config();

async function getCreatorDBNiches() {
 
  const API_KEY = process.env.CREATORDB_API_KEY;
  const BASE_URL = 'https://dev.creatordb.app/v2/topicTable';
  
  if (!API_KEY) {
   
    return;
  }

 
  const platforms = ['youtube', 'instagram', 'tiktok'];
  const allNiches = [];

  try {
    for (const platform of platforms) {
     
      
      const url = `${BASE_URL}?platform=${platform}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'apiId': API_KEY
          }
        });

        if (!response.ok) {
         
          continue;
        }

        const data = await response.json();
        
        if (data.success && data.data && data.data.niches) {
          const niches = Object.entries(data.data.niches).map(([id, niche]) => ({
            id,
            name: niche.name,
            category: niche.category,
            channelCount: niche.channelCount,
            platform,
            type: 'niche'
          }));
          
          allNiches.push(...niches);
         
          
          // Mostrar top 3 de esta plataforma
          const topPlatform = niches.slice(0, 3);
          
          
        } else {
         
        }
      } catch (error) {
       
      }
    }

    if (allNiches.length === 0) {
     
      return;
    }

    // Ordenar todos los nichos por channelCount y tomar top 25
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

   
    
    topNiches.forEach((niche, index) => {
      const rank = (index + 1).toString().padStart(2, '0');
      const channels = niche.channelCount.toLocaleString().padStart(8);
      
     
    });

    // Estadísticas finales
    const platformStats = topNiches.reduce((acc, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

   

   
    Object.entries(platformStats).forEach(([platform, count]) => {
      const percentage = ((count / 25) * 100).toFixed(1);
     
    });

    // Categorías más populares
    const categoryStats = topNiches.reduce((acc, niche) => {
      acc[niche.category] = (acc[niche.category] || 0) + 1;
      return acc;
    }, {});

   
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([category, count]) => {
       
      });

    // JSON exportable
    const exportData = {
      timestamp: new Date().toISOString(),
      total_nichos_analizados: allNiches.length,
      top_25_nichos: topNiches.map(n => ({
        rank: topNiches.indexOf(n) + 1,
        nombre: n.name,
        canales: n.channelCount,
        plataforma: n.platform,
        categoria: n.category,
        id: n.id
      })),
      estadisticas: {
        distribucion_plataformas: platformStats,
        categorias_populares: categoryStats,
        nicho_mas_popular: {
          nombre: topNiches[0]?.name,
          canales: topNiches[0]?.channelCount,
          plataforma: topNiches[0]?.platform,
          categoria: topNiches[0]?.category
        }
      },
      fuente: 'CreatorDB API v2',
      metodo: 'direct_api_call'
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
    .then(() => getCreatorDBNiches())
    .then(() => {
     
      process.exit(0);
    })
    .catch((error) => {
      
      process.exit(1);
    });
}

module.exports = { getCreatorDBNiches }; 