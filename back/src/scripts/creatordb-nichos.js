#!/usr/bin/env node

/**
 * Script que llama directamente a la API de CreatorDB para obtener nichos
 * URL: https://dev.creatordb.app/v2/topicTable
 */

require('dotenv').config();

async function getCreatorDBNiches() {
  console.log('🎯 [CREATORDB-NICHOS] Obteniendo nichos directamente de CreatorDB...\n');

  const API_KEY = process.env.CREATORDB_API_KEY;
  const BASE_URL = 'https://dev.creatordb.app/v2/topicTable';
  
  if (!API_KEY) {
    console.error('❌ CREATORDB_API_KEY no está configurada en las variables de entorno');
    console.log('💡 Configura CREATORDB_API_KEY en tu archivo .env');
    return;
  }

  console.log(`🔑 Usando API Key: ${API_KEY.substring(0, 10)}...`);

  const platforms = ['youtube', 'instagram', 'tiktok'];
  const allNiches = [];

  try {
    for (const platform of platforms) {
      console.log(`\n🔍 Obteniendo nichos de ${platform.toUpperCase()}...`);
      
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
          console.log(`❌ Error HTTP ${response.status} para ${platform}`);
          console.log(`Response: ${await response.text()}`);
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
          console.log(`✅ ${niches.length} nichos obtenidos de ${platform}`);
          console.log(`📊 Quota usada: ${data.quotaUsed}, Total: ${data.quotaUsedTotal}`);
          console.log(`💳 Créditos restantes: ${data.remainingPlanCredit?.toLocaleString()}`);
          
          // Mostrar top 3 de esta plataforma
          const topPlatform = niches.slice(0, 3);
          console.log(`🏆 Top 3 de ${platform}:`);
          topPlatform.forEach((n, i) => {
            console.log(`   ${i+1}. ${n.name} (${n.channelCount.toLocaleString()} canales)`);
          });
          
        } else {
          console.log(`❌ Error en respuesta de ${platform}:`, data.error || 'Sin datos de nichos');
        }
      } catch (error) {
        console.log(`❌ Error de conexión con ${platform}:`, error.message);
      }
    }

    if (allNiches.length === 0) {
      console.log('\n❌ No se obtuvieron nichos de ninguna plataforma');
      return;
    }

    // Ordenar todos los nichos por channelCount y tomar top 25
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

    console.log('\n' + '='.repeat(80));
    console.log('🏆 TOP 25 MEJORES NICHOS DE TODAS LAS PLATAFORMAS');
    console.log('='.repeat(80));
    
    topNiches.forEach((niche, index) => {
      const rank = (index + 1).toString().padStart(2, '0');
      const channels = niche.channelCount.toLocaleString().padStart(8);
      
      console.log(`${rank}. ${niche.name.padEnd(25)} | ${channels} canales | ${niche.platform.toUpperCase().padEnd(9)} | ${niche.category}`);
    });

    // Estadísticas finales
    const platformStats = topNiches.reduce((acc, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 ESTADÍSTICAS FINALES:');
    console.log(`• Total de nichos analizados: ${allNiches.length.toLocaleString()}`);
    console.log(`• Top 25 seleccionados`);
    console.log(`• Nicho más popular: ${topNiches[0]?.name} (${topNiches[0]?.channelCount.toLocaleString()} canales en ${topNiches[0]?.platform.toUpperCase()})`);

    console.log('\n📱 DISTRIBUCIÓN EN TOP 25:');
    Object.entries(platformStats).forEach(([platform, count]) => {
      const percentage = ((count / 25) * 100).toFixed(1);
      console.log(`• ${platform.toUpperCase()}: ${count} nichos (${percentage}%)`);
    });

    // Categorías más populares
    const categoryStats = topNiches.reduce((acc, niche) => {
      acc[niche.category] = (acc[niche.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\n🏷️  CATEGORÍAS MÁS POPULARES EN TOP 25:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([category, count]) => {
        console.log(`• ${category}: ${count} nichos`);
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

    console.log('\n💾 JSON PARA EXPORTAR:');
    console.log(JSON.stringify(exportData, null, 2));

  } catch (error) {
    console.error('❌ Error fatal:', error);
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
      console.log('\n✅ Extracción completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { getCreatorDBNiches }; 