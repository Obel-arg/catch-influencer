#!/usr/bin/env ts-node

/**
 * Script para extraer los 25 mejores nichos desde CreatorDB
 * Obtiene las categorías y filtra solo los nichos ordenados por popularidad
 */

import { PostTopicsService } from '../services/post-topics.service';

async function extractTopNiches() {

  const postTopicsService = PostTopicsService.getInstance();

  try {
    // Obtener categorías de diferentes plataformas
    const platforms = ['instagram', 'youtube', 'tiktok'];
    const allNiches: any[] = [];

    for (const platform of platforms) {
     
      
      const result = await postTopicsService.getTopicNicheCategories(platform);
      
      if (result.success && result.data.categories) {
        // Filtrar solo los nichos (no topics)
        const platformNiches = result.data.categories
          .filter((item: any) => item.type === 'niche')
          .map((niche: any) => ({
            ...niche,
            platform
          }));
        
        allNiches.push(...platformNiches);
       
      } else {
       
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

   
    
    // Agrupar por plataforma en el top 25
    const platformCount = topNiches.reduce((acc: any, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

   
    Object.entries(platformCount).forEach(([platform, count]) => {
     
    });

    // Crear JSON para exportar
    const exportData = {
      timestamp: new Date().toISOString(),
      total_analyzed: allNiches.length,
      top_25_niches: topNiches,
      platform_distribution: platformCount,
      most_popular: topNiches[0]
    };

   

  } catch (error) {
   
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  extractTopNiches()
    .then(() => {
     
      process.exit(0);
    })
    .catch((error) => {
      
      process.exit(1);
    });
}

export { extractTopNiches }; 