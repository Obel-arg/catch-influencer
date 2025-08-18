#!/usr/bin/env node

/**
 * Script simple para extraer nichos usando fetch
 * Funciona con el servidor corriendo en localhost:5000
 */

const fetch = require("node-fetch").default || require("node-fetch");

async function getTopNiches() {
  console.log("🎯 [NICHOS-SIMPLE] Iniciando extracción de nichos...\n");

  const API_BASE = "http://localhost:5000/api";
  const platforms = ["instagram", "youtube", "tiktok"];
  const allNiches = [];

  try {
    for (const platform of platforms) {
      console.log(`🔍 Obteniendo nichos de ${platform.toUpperCase()}...`);

      const url = `${API_BASE}/post-topics/categories?platform=${platform}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.log(`❌ Error HTTP ${response.status} para ${platform}`);
          continue;
        }

        const data = await response.json();

        if (data.success && data.data && data.data.categories) {
          // Filtrar solo nichos
          const niches = data.data.categories
            .filter((item) => item.type === "niche")
            .map((niche) => ({ ...niche, platform }));

          allNiches.push(...niches);
          console.log(`✅ ${niches.length} nichos encontrados en ${platform}`);
        } else {
          console.log(`⚠️  Sin datos para ${platform}`);
        }
      } catch (error) {
        console.log(`❌ Error con ${platform}:`, error.message);
      }
    }

    if (allNiches.length === 0) {
      console.log("\n❌ No se encontraron nichos. Verificaciones:");
      console.log("1. ¿Está el servidor corriendo en localhost:5000?");
      console.log("2. ¿Tienes configurada la API key de CreatorDB?");
      return;
    }

    // Top 25 nichos
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

    console.log("\n🏆 TOP 25 MEJORES NICHOS:\n");
    console.log("═".repeat(80));

    topNiches.forEach((niche, i) => {
      const rank = (i + 1).toString().padStart(2, "0");
      console.log(`${rank}. ${niche.name}`);
      console.log(`    📊 ${niche.channelCount.toLocaleString()} canales`);
      console.log(`    📱 ${niche.platform.toUpperCase()}`);
      console.log(`    🏷️  ${niche.category || "Sin categoría"}`);
      console.log("─".repeat(50));
    });

    // Resumen
    const platformStats = topNiches.reduce((acc, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});

    console.log("\n📊 RESUMEN:");
    console.log(`• Total nichos analizados: ${allNiches.length}`);
    console.log(`• Top 25 mostrados`);
    console.log(
      `• Nicho #1: ${
        topNiches[0]?.name
      } (${topNiches[0]?.channelCount.toLocaleString()} canales)`
    );

    console.log("\n📱 DISTRIBUCIÓN POR PLATAFORMA:");
    Object.entries(platformStats).forEach(([platform, count]) => {
      console.log(`• ${platform.toUpperCase()}: ${count} nichos`);
    });

    // JSON para exportar
    const exportData = {
      fecha: new Date().toISOString(),
      total_analizados: allNiches.length,
      top_25: topNiches.map((n) => ({
        nombre: n.name,
        canales: n.channelCount,
        plataforma: n.platform,
        categoria: n.category,
        id: n.id,
      })),
      distribucion_plataformas: platformStats,
      nicho_mas_popular: {
        nombre: topNiches[0]?.name,
        canales: topNiches[0]?.channelCount,
        plataforma: topNiches[0]?.platform,
      },
    };

    console.log("\n💾 JSON EXPORTADO:");
    console.log(JSON.stringify(exportData, null, 2));
  } catch (error) {
    console.error("❌ Error fatal:", error.message);
  }
}

// Instalar node-fetch si no está disponible
async function checkAndInstallFetch() {
  try {
    require("node-fetch");
  } catch (error) {
    console.log("📦 Instalando node-fetch...");
    const { execSync } = require("child_process");
    execSync("npm install node-fetch", { stdio: "inherit" });
  }
}

// Ejecutar
if (require.main === module) {
  checkAndInstallFetch()
    .then(() => getTopNiches())
    .then(() => {
      console.log("\n✅ Extracción completada exitosamente");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error:", error.message);
      process.exit(1);
    });
}

module.exports = { getTopNiches };
