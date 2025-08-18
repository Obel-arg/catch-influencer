#!/usr/bin/env ts-node

/**
 * Script para extraer los 25 mejores nichos desde CreatorDB
 * Obtiene las categorías y filtra solo los nichos ordenados por popularidad
 */

import { PostTopicsService } from '../services/post-topics.service';

async function extractTopNiches() {
  console.log('🎯 [NICHOS-EXTRACTOR] Iniciando extracción de los 25 mejores nichos...\n');

  const postTopicsService = PostTopicsService.getInstance();

  try {
    // Obtener categorías de diferentes plataformas
    const platforms = ['instagram', 'youtube', 'tiktok'];
    const allNiches: any[] = [];

    for (const platform of platforms) {
      console.log(`🔍 [NICHOS-EXTRACTOR] Obteniendo nichos de ${platform.toUpperCase()}...`);
      
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
        console.log(`✅ [NICHOS-EXTRACTOR] ${platformNiches.length} nichos encontrados en ${platform}`);
      } else {
        console.log(`❌ [NICHOS-EXTRACTOR] Error obteniendo nichos de ${platform}:`, result.error);
      }
    }

    if (allNiches.length === 0) {
      console.log('❌ [NICHOS-EXTRACTOR] No se encontraron nichos en ninguna plataforma');
      return;
    }

    // Ordenar por channelCount y tomar los 25 mejores
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

    console.log('\n🏆 [NICHOS-EXTRACTOR] TOP 25 MEJORES NICHOS:\n');
    console.log('='.repeat(80));
    
    topNiches.forEach((niche, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${niche.name}`);
      console.log(`    📊 Canales: ${niche.channelCount.toLocaleString()}`);
      console.log(`    📱 Plataforma: ${niche.platform.toUpperCase()}`);
      console.log(`    🏷️  Categoría: ${niche.category}`);
      console.log(`    🆔 ID: ${niche.id}`);
      console.log('-'.repeat(50));
    });

    console.log('\n📋 [NICHOS-EXTRACTOR] RESUMEN:');
    console.log(`• Total de nichos analizados: ${allNiches.length}`);
    console.log(`• Top 25 seleccionados`);
    console.log(`• Nicho más popular: ${topNiches[0]?.name} (${topNiches[0]?.channelCount.toLocaleString()} canales)`);
    
    // Agrupar por plataforma en el top 25
    const platformCount = topNiches.reduce((acc: any, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📱 [NICHOS-EXTRACTOR] DISTRIBUCIÓN POR PLATAFORMA EN TOP 25:');
    Object.entries(platformCount).forEach(([platform, count]) => {
      console.log(`• ${platform.toUpperCase()}: ${count} nichos`);
    });

    // Crear JSON para exportar
    const exportData = {
      timestamp: new Date().toISOString(),
      total_analyzed: allNiches.length,
      top_25_niches: topNiches,
      platform_distribution: platformCount,
      most_popular: topNiches[0]
    };

    console.log('\n💾 [NICHOS-EXTRACTOR] Datos listos para exportar:');
    console.log(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error('❌ [NICHOS-EXTRACTOR] Error durante la extracción:', error);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  extractTopNiches()
    .then(() => {
      console.log('\n✅ [NICHOS-EXTRACTOR] Extracción completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ [NICHOS-EXTRACTOR] Error fatal:', error);
      process.exit(1);
    });
}

export { extractTopNiches }; 