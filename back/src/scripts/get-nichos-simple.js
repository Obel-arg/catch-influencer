#!/usr/bin/env node

/**
 * Script simple para extraer nichos usando fetch
 * Funciona con el servidor corriendo en localhost:5000
 */

const fetch = require("node-fetch").default || require("node-fetch");

async function getTopNiches() {

  const API_BASE = "http://localhost:5001/api";
  const platforms = ["instagram", "youtube", "tiktok"];
  const allNiches = [];

  try {
    for (const platform of platforms) {
     

      const url = `${API_BASE}/post-topics/categories?platform=${platform}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
         
          continue;
        }

        const data = await response.json();

        if (data.success && data.data && data.data.categories) {
          // Filtrar solo nichos
          const niches = data.data.categories
            .filter((item) => item.type === "niche")
            .map((niche) => ({ ...niche, platform }));

          allNiches.push(...niches);
         
        } else {
         
        }
      } catch (error) {
       
      }
    }

    if (allNiches.length === 0) {
     
      return;
    }

    // Top 25 nichos
    const topNiches = allNiches
      .sort((a, b) => b.channelCount - a.channelCount)
      .slice(0, 25);

   

    topNiches.forEach((niche, i) => {
      const rank = (i + 1).toString().padStart(2, "0");
     
    });

    // Resumen
    const platformStats = topNiches.reduce((acc, niche) => {
      acc[niche.platform] = (acc[niche.platform] || 0) + 1;
      return acc;
    }, {});



   
    Object.entries(platformStats).forEach(([platform, count]) => {
     
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

   
  } catch (error) {
   
  }
}

// Instalar node-fetch si no está disponible
async function checkAndInstallFetch() {
  try {
    require("node-fetch");
  } catch (error) {
   
    const { execSync } = require("child_process");
    execSync("npm install node-fetch", { stdio: "inherit" });
  }
}

// Ejecutar
if (require.main === module) {
  checkAndInstallFetch()
    .then(() => getTopNiches())
    .then(() => {
     
      process.exit(0);
    })
    .catch((error) => {
     
      process.exit(1);
    });
}

module.exports = { getTopNiches };
