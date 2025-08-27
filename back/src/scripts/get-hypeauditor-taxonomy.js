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
const API_TOKEN = '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6';

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

  console.log(`🔍 [HYPEAUDITOR TAXONOMY] Obteniendo taxonomy desde: ${endpoint}`);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📊 [HYPEAUDITOR TAXONOMY] Status: ${res.statusCode}`);
      console.log(`📋 [HYPEAUDITOR TAXONOMY] Headers:`, res.headers);

      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log('✅ [HYPEAUDITOR TAXONOMY] Petición completada');
        
        try {
          const data = JSON.parse(body);
          
          console.log('📦 [HYPEAUDITOR TAXONOMY] Respuesta recibida:');
          console.log('='.repeat(80));
          console.log(JSON.stringify(data, null, 2));
          console.log('='.repeat(80));
          
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`Error ${res.statusCode}: ${JSON.stringify(data)}`));
          }
        } catch (e) {
          console.log('❌ [HYPEAUDITOR TAXONOMY] Error parsing JSON:', e.message);
          console.log('📄 [HYPEAUDITOR TAXONOMY] Raw response:', body);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ [HYPEAUDITOR TAXONOMY] Error en petición:', e.message);
      reject(e);
    });

    req.end();
  });
}

// Función para procesar y organizar las categorías
function processTaxonomy(taxonomyData) {
  console.log('\n🔄 [HYPEAUDITOR TAXONOMY] Procesando categorías...');
  console.log('🔍 [HYPEAUDITOR TAXONOMY] Estructura de datos recibida:');
  console.log('   • Tiene taxonomyData:', !!taxonomyData);
  console.log('   • Tiene taxonomyData.result:', !!taxonomyData?.result);
  console.log('   • Tiene taxonomyData.result.categories:', !!taxonomyData?.result?.categories);
  console.log('   • Tipo de categories:', typeof taxonomyData?.result?.categories);
  console.log('   • Es array categories:', Array.isArray(taxonomyData?.result?.categories));
  console.log('   • Length de categories:', taxonomyData?.result?.categories?.length);
  
  if (!taxonomyData || !taxonomyData.result) {
    console.log('❌ [HYPEAUDITOR TAXONOMY] No se encontró result en la respuesta');
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

  console.log(`✅ [HYPEAUDITOR TAXONOMY] Procesadas ${categories.length} categorías`);
  console.log(`📊 [HYPEAUDITOR TAXONOMY] ${rootCategories.length} categorías raíz`);

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
    console.log(`💾 [HYPEAUDITOR TAXONOMY] Lista guardada en: ${outputFile}`);
    
    // También guardar JSON para referencia
    const jsonFile = path.join(outputDir, 'hypeauditor-taxonomy-raw.json');
    fs.writeFileSync(jsonFile, JSON.stringify(taxonomyData, null, 2));
    console.log(`💾 [HYPEAUDITOR TAXONOMY] JSON completo en: ${jsonFile}`);
    
    return true;
  } catch (error) {
    console.error('❌ [HYPEAUDITOR TAXONOMY] Error guardando archivo:', error.message);
    return false;
  }
}

// Función principal
async function getTaxonomy() {
  console.log('🚀 [HYPEAUDITOR TAXONOMY] Iniciando obtención de taxonomy...\n');
  
  try {
    // Obtener taxonomy de HypeAuditor
    const taxonomyData = await makeHypeAuditorDiscoveryGetRequest('/api/method/auditor.taxonomy');
    
    // Guardar directamente como texto para revisión
    const saved = saveTaxonomyAsText(taxonomyData);
    
    if (saved) {
      console.log('\n✅ [HYPEAUDITOR TAXONOMY] Taxonomy obtenido y guardado exitosamente!');
      console.log('\n📋 [HYPEAUDITOR TAXONOMY] Resumen:');
      const categories = taxonomyData.result?.categories || [];
      console.log(`   • Total de categorías: ${categories.length}`);
      console.log(`   • Archivo de texto: src/data/hypeauditor-taxonomy-categories.txt`);
      console.log(`   • Archivo JSON completo: src/data/hypeauditor-taxonomy-raw.json`);
      
      // Mostrar algunas categorías de ejemplo
      console.log('\n🔍 [HYPEAUDITOR TAXONOMY] Primeras 10 categorías:');
      categories.slice(0, 10).forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.title} (ID: ${cat.id})`);
      });
      
      console.log('\n📝 [HYPEAUDITOR TAXONOMY] Revisa el archivo .txt para seleccionar las categorías que quieres usar en el filtro.');
    }
    
  } catch (error) {
    console.error('❌ [HYPEAUDITOR TAXONOMY] Error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  getTaxonomy();
}

module.exports = { getTaxonomy };
