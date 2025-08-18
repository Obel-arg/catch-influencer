#!/usr/bin/env node

/**
 * Script alternativo para extraer los 25 mejores nichos usando peticiones HTTP
 * Útil para ejecutar sin dependencias internas del proyecto
 */

const https = require("https");
const http = require("http");

// Configuración
const API_BASE_URL = "http://localhost:5000/api";
const PLATFORMS = ["instagram", "youtube", "tiktok"];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const client = isHttps ? https : http;

    const req = client.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Error parsing JSON: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.abort();
      reject(new Error("Request timeout"));
    });
  });
}

async function extractTopNichesHttp() {
  console.log("🎯 [NICHOS-HTTP] Iniciando extracción de nichos via HTTP...\n");

  try {
    const allNiches = [];

    // Obtener nichos de cada plataforma
    for (const platform of PLATFORMS) {
      console.log(
        `🔍 [NICHOS-HTTP] Obteniendo nichos de ${platform.toUpperCase()}...`
      );

      const url = `${API_BASE_URL}/post-topics/categories?platform=${platform}`;

      try {
        const response = await makeRequest(url);

        if (response.success && response.data && response.data.categories) {
          // Filtrar solo los nichos
          const platformNiches = response.data.categories
            .filter((item) => item.type === "niche")
            .map((niche) => ({
              ...niche,
              platform,
            }));

          allNiches.push(...platformNiches);
          console.log(
            `✅ [NICHOS-HTTP] ${platformNiches.length} nichos encontrados en ${platform}`
          );
        } else {
          console.log(
            `❌ [NICHOS-HTTP] Error en respuesta de ${platform}:`,
            response.error || "Sin datos"
          );
        }
      } catch (error) {
        console.log(
          `❌ [NICHOS-HTTP] Error de conexión con ${platform}:`,
          error.message
        );
      }
    }

    if (allNiches.length === 0) {
      console.log(
        "❌ [NICHOS-HTTP] No se encontraron nichos en ninguna plataforma"
      );
      console.log(
        "💡 Asegúrate de que el servidor esté ejecutándose en http://localhost:5000"
      );
      return;
    }

    // Ordenar y tomar los 25 mejores
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

    console.log("\n🏆 [NICHOS-HTTP] TOP 25 MEJORES NICHOS:\n");
    console.log("=".repeat(80));

    topNiches.forEach((niche, index) => {
      console.log(`${(index + 1).toString().padStart(2, "0")}. ${niche.name}`);
      console.log(`    📊 Canales: ${niche.channelCount.toLocaleString()}`);
      console.log(`    📱 Plataforma: ${niche.platform.toUpperCase()}`);
      console.log(`    🏷️  Categoría: ${niche.category || "Sin categoría"}`);
      console.log(`    🆔 ID: ${niche.id}`);
      console.log("-".repeat(50));
    });

    // Estadísticas
    console.log("\n📋 [NICHOS-HTTP] RESUMEN:");
    console.log(`• Total de nichos analizados: ${allNiches.length}`);
    console.log(`• Top 25 seleccionados`);
    console.log(
      `• Nicho más popular: ${
        topNiches[0]?.name
      } (${topNiches[0]?.channelCount.toLocaleString()} canales)`
    );

    // Distribución por plataforma
    const platformCount = topNiches.reduce((acc, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

    console.log("\n📱 [NICHOS-HTTP] DISTRIBUCIÓN POR PLATAFORMA EN TOP 25:");
    Object.entries(platformCount).forEach(([platform, count]) => {
      console.log(`• ${platform.toUpperCase()}: ${count} nichos`);
    });

    // Export JSON
    const exportData = {
      timestamp: new Date().toISOString(),
      total_analyzed: allNiches.length,
      top_25_niches: topNiches,
      platform_distribution: platformCount,
      most_popular: topNiches[0],
      extraction_method: "http_requests",
    };

    console.log("\n💾 [NICHOS-HTTP] JSON de exportación:");
    console.log(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error("❌ [NICHOS-HTTP] Error fatal:", error.message);
    throw error;
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  extractTopNichesHttp()
    .then(() => {
      console.log("\n✅ [NICHOS-HTTP] Extracción completada exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ [NICHOS-HTTP] Error fatal:", error.message);
      process.exit(1);
    });
}

module.exports = { extractTopNichesHttp };
