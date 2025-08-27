#!/usr/bin/env node

/**
 * Script para obtener el taxonomy completo de HypeAuditor Discovery
 * y guardarlo para uso en el frontend
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Datos hardcodeados para HypeAuditor
const CLIENT_ID = '360838';
const API_TOKEN = process.env.HYPEAUDITOR_API_TOKEN || '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6';

// Función para hacer peticiones GET a HypeAuditor Discovery
function makeHypeAuditorDiscoveryGetRequest(endpoint) {
  const options = {
    hostname: 'hypeauditor.com',
    port: 443,
    path: endpoint,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Id': CLIENT_ID,
      'X-Auth-Token': API_TOKEN
    }
  };

 

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
     

      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
       
        
        try {
          const data = JSON.parse(body);
          
         
          
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`Error ${res.statusCode}: ${JSON.stringify(data)}`));
          }
        } catch (e) {
         
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
     
      reject(e);
    });

    req.end();
  });
}

// Función para procesar y organizar las categorías
function processTaxonomy(taxonomyData) {
 
  
  if (!taxonomyData || !taxonomyData.result) {
   
    return null;
  }

  const categories = [];
  const categoryMap = {};

  // Procesar categorías - el formato es un array, no un objeto
  if (taxonomyData.result.categories && Array.isArray(taxonomyData.result.categories)) {
    taxonomyData.result.categories.forEach((category) => {
      const processedCategory = {
        id: category.id.toString(),
        name: category.title || category.name || `Category ${category.id}`,
        parent_id: category.parent_id || null,
        level: category.level || 0,
        platform: category.platform || 'all'
      };
      
      categories.push(processedCategory);
      categoryMap[category.id.toString()] = processedCategory;
    });
  }

  // Organizar en jerarquía
  const rootCategories = categories.filter(cat => !cat.parent_id);
  const buildHierarchy = (parentId) => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        children: buildHierarchy(cat.id)
      }));
  };

  const hierarchicalCategories = rootCategories.map(cat => ({
    ...cat,
    children: buildHierarchy(cat.id)
  }));

 

  return {
    total: categories.length,
    rootCount: rootCategories.length,
    categories: categories,
    hierarchical: hierarchicalCategories,
    categoryMap: categoryMap
  };
}

// Función para guardar el taxonomy directamente como lista legible
function saveTaxonomyAsText(taxonomyData) {
  const outputDir = path.join(__dirname, '../data');
  
  // Crear directorio si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'hypeauditor-taxonomy-categories.txt');
  
  try {
    let textContent = '# CATEGORÍAS DISPONIBLES EN HYPEAUDITOR TAXONOMY\n';
    textContent += '# =====================================================\n\n';
    
    // Verificar la estructura de datos
    const categories = taxonomyData.result?.categories || [];
    textContent += `Total de categorías encontradas: ${categories.length}\n\n`;
    textContent += 'Formato: ID | Nombre de la categoría\n';
    textContent += '=====================================\n\n';

    // Ordenar categorías por ID para facilitar la búsqueda
    const sortedCategories = categories.sort((a, b) => a.id - b.id);
    
    sortedCategories.forEach((category) => {
      textContent += `${category.id} | ${category.title}\n`;
    });

    textContent += '\n\n# CATEGORÍAS POPULARES SUGERIDAS PARA EL FILTRO:\n';
    textContent += '# =============================================\n\n';
    
    const popularKeywords = ['fashion', 'beauty', 'food', 'gaming', 'music', 'fitness', 'travel', 'tech', 'art', 'lifestyle'];
    
    popularKeywords.forEach(keyword => {
      textContent += `\n## ${keyword.toUpperCase()}:\n`;
      const matchingCategories = sortedCategories.filter(cat => 
        cat.title.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchingCategories.length > 0) {
        matchingCategories.forEach(cat => {
          textContent += `${cat.id} | ${cat.title}\n`;
        });
      } else {
        textContent += 'No hay categorías que coincidan\n';
      }
    });
    
    fs.writeFileSync(outputFile, textContent);
   
    
    // También guardar JSON para referencia
    const jsonFile = path.join(outputDir, 'hypeauditor-taxonomy-raw.json');
    fs.writeFileSync(jsonFile, JSON.stringify(taxonomyData, null, 2));
   
    
    return true;
  } catch (error) {

    return false;
  }
}

// Función principal
async function getTaxonomy() {
 
  
  try {
    // Obtener taxonomy de HypeAuditor
    const taxonomyData = await makeHypeAuditorDiscoveryGetRequest('/api/method/auditor.taxonomy');
    
    // Guardar directamente como texto para revisión
    const saved = saveTaxonomyAsText(taxonomyData);
    
    if (saved) {

      const categories = taxonomyData.result?.categories || [];
     
      
      // Mostrar algunas categorías de ejemplo
     
      categories.slice(0, 10).forEach((cat, index) => {
       
      });
      
     
    }
    
  } catch (error) {
      
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  getTaxonomy();
}

module.exports = { getTaxonomy };
