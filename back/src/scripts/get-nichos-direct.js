#!/usr/bin/env node

/**
 * Script para extraer los 25 mejores nichos usando servicios internos
 * Usa directamente PostTopicsService sin peticiones HTTP
 */

// Usar require para importar el servicio compilado
const path = require('path');

async function extractNichosDirectly() {
  console.log('🎯 [NICHOS-DIRECT] Iniciando extracción directa de nichos...\n');

  try {
    // Importar el servicio dinámicamente
    const { PostTopicsService } = require('../services/post-topics.service');
    const postTopicsService = PostTopicsService.getInstance();

    const platforms = ['instagram', 'youtube', 'tiktok'];
    const allNiches = [];

    for (const platform of platforms) {
      console.log(`🔍 [NICHOS-DIRECT] Obteniendo nichos de ${platform.toUpperCase()}...`);
      
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
          console.log(`✅ [NICHOS-DIRECT] ${platformNiches.length} nichos encontrados en ${platform}`);
          
          // Mostrar algunos ejemplos
          if (platformNiches.length > 0) {
            console.log(`   📝 Ejemplos: ${platformNiches.slice(0, 3).map(n => n.name).join(', ')}`);
          }
        } else {
          console.log(`❌ [NICHOS-DIRECT] Error obteniendo nichos de ${platform}:`, result.error || 'Sin datos');
        }
      } catch (error) {
        console.log(`❌ [NICHOS-DIRECT] Error en ${platform}:`, error.message);
      }
    }

    if (allNiches.length === 0) {
      console.log('❌ [NICHOS-DIRECT] No se encontraron nichos en ninguna plataforma');
      return;
    }

    // Ordenar por channelCount y tomar los 25 mejores
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

    console.log('\n🏆 [NICHOS-DIRECT] TOP 25 MEJORES NICHOS:\n');
    console.log('='.repeat(80));
    
    topNiches.forEach((niche, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${niche.name}`);
      console.log(`    📊 Canales: ${niche.channelCount.toLocaleString()}`);
      console.log(`    📱 Plataforma: ${niche.platform.toUpperCase()}`);
      console.log(`    🏷️  Categoría: ${niche.category || 'Sin categoría'}`);
      console.log(`    🆔 ID: ${niche.id}`);
      console.log('-'.repeat(50));
    });

    // Estadísticas
    console.log('\n📋 [NICHOS-DIRECT] RESUMEN:');
    console.log(`• Total de nichos analizados: ${allNiches.length}`);
    console.log(`• Top 25 seleccionados`);
    console.log(`• Nicho más popular: ${topNiches[0]?.name} (${topNiches[0]?.channelCount.toLocaleString()} canales)`);

    // Distribución por plataforma
    const platformCount = topNiches.reduce((acc, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📱 [NICHOS-DIRECT] DISTRIBUCIÓN POR PLATAFORMA EN TOP 25:');
    Object.entries(platformCount).forEach(([platform, count]) => {
      console.log(`• ${platform.toUpperCase()}: ${count} nichos`);
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

    console.log('\n💾 [NICHOS-DIRECT] Datos exportados:');
    console.log(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error('❌ [NICHOS-DIRECT] Error fatal:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  extractNichosDirectly()
    .then(() => {
      console.log('\n✅ [NICHOS-DIRECT] Extracción completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ [NICHOS-DIRECT] Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { extractNichosDirectly }; 