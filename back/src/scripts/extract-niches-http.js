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
 
  try {
    const allNiches = [];

    // Obtener nichos de cada plataforma
    for (const platform of PLATFORMS) {
     
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
         
        } else {
         
        }
      } catch (error) {
       
      }
    }

    if (allNiches.length === 0) {
     
      return;
    }

    // Ordenar y tomar los 25 mejores
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

    // Export JSON
    const exportData = {
      timestamp: new Date().toISOString(),
      total_analyzed: allNiches.length,
      top_25_niches: topNiches,
      platform_distribution: platformCount,
      most_popular: topNiches[0],
      extraction_method: "http_requests",
    };

   
  } catch (error) {
   
    throw error;
  }
}

// Ejecutar si es el script principal
if (require.main === module) {
  extractTopNichesHttp()
    .then(() => {
     
      process.exit(0);
    })
    .catch((error) => {
      
      process.exit(1);
    });
}

module.exports = { extractTopNichesHttp };
