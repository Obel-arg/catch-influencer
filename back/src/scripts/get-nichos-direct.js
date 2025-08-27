#!/usr/bin/env node

/**
 * Script para extraer los 25 mejores nichos usando servicios internos
 * Usa directamente PostTopicsService sin peticiones HTTP
 */

// Usar require para importar el servicio compilado
const path = require('path');

async function extractNichosDirectly() {


  try {
    // Importar el servicio dinámicamente
    const { PostTopicsService } = require('../services/post-topics.service');
    const postTopicsService = PostTopicsService.getInstance();

    const platforms = ['instagram', 'youtube', 'tiktok'];
    const allNiches = [];

    for (const platform of platforms) {
     
      
      try {
        const result = await postTopicsService.getTopicNicheCategories(platform);
        
        if (result.success && result.data && result.data.categories) {
          // Filtrar solo los nichos (no topics)
          const platformNiches = result.data.categories
            .filter(item => item.type === 'niche')
            .map(niche => ({
              ...niche,
              platform
            }));
          
          allNiches.push(...platformNiches);
         
          
          // Mostrar algunos ejemplos
          if (platformNiches.length > 0) {
           
          }
        } else {
         
        }
      } catch (error) {
       
      }
    }

    if (allNiches.length === 0) {
     
      return;
    }

    // Ordenar por channelCount y tomar los 25 mejores
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

   
    
    topNiches.forEach((niche, index) => {
     
    });

    // Estadísticas
   

    // Distribución por plataforma
    const platformCount = topNiches.reduce((acc, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

   
    Object.entries(platformCount).forEach(([platform, count]) => {
     
    });

    // Export JSON simplificado
    const exportData = {
      timestamp: new Date().toISOString(),
      total_analyzed: allNiches.length,
      top_25_niches: topNiches.map(niche => ({
        name: niche.name,
        channelCount: niche.channelCount,
        platform: niche.platform,
        category: niche.category,
        id: niche.id
      })),
      platform_distribution: platformCount,
      most_popular: {
        name: topNiches[0]?.name,
        channelCount: topNiches[0]?.channelCount,
        platform: topNiches[0]?.platform
      },
      extraction_method: 'direct_services'
    };


   

  } catch (error) {
   
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  extractNichosDirectly()
    .then(() => {
     
      process.exit(0);
    })
    .catch((error) => {
      
      process.exit(1);
    });
}

module.exports = { extractNichosDirectly }; 