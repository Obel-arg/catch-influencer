#!/usr/bin/env node

/**
 * Script para analizar las categorías compartidas entre plataformas
 * en el taxonomy de HypeAuditor
 */

const fs = require('fs');
const path = require('path');

// Leer el archivo del taxonomy
const taxonomyFile = path.join(__dirname, '../data/hypeauditor-taxonomy-raw.json');
const taxonomyData = JSON.parse(fs.readFileSync(taxonomyFile, 'utf8'));


// Extraer categorías por plataforma
const platforms = {
  instagram: taxonomyData.result.ig.categories || [],
  youtube: taxonomyData.result.yt.categories || [],
  tiktok: taxonomyData.result.tt.categories || []
};

// Crear maps por título para encontrar coincidencias
const categoryMaps = {
  instagram: new Map(),
  youtube: new Map(), 
  tiktok: new Map()
};

// Llenar los maps
platforms.instagram.forEach(cat => {
  categoryMaps.instagram.set(cat.title.toLowerCase().trim(), cat);
});

platforms.youtube.forEach(cat => {
  categoryMaps.youtube.set(cat.title.toLowerCase().trim(), cat);
});

platforms.tiktok.forEach(cat => {
  categoryMaps.tiktok.set(cat.title.toLowerCase().trim(), cat);
});

// Encontrar categorías compartidas entre todas las plataformas
const sharedCategories = [];
const sharedBetweenTwo = [];

for (const [title, igCat] of categoryMaps.instagram) {
  const inYoutube = categoryMaps.youtube.has(title);
  const inTiktok = categoryMaps.tiktok.has(title);
  
  if (inYoutube && inTiktok) {
    // Compartida en las 3 plataformas
    sharedCategories.push({
      title: igCat.title,
      instagram_id: igCat.id,
      youtube_id: categoryMaps.youtube.get(title).id,
      tiktok_id: categoryMaps.tiktok.get(title).id
    });
  } else if (inYoutube || inTiktok) {
    // Compartida en 2 plataformas
    const platforms = ['Instagram'];
    const ids = { instagram: igCat.id };
    
    if (inYoutube) {
      platforms.push('YouTube');
      ids.youtube = categoryMaps.youtube.get(title).id;
    }
    if (inTiktok) {
      platforms.push('TikTok');
      ids.tiktok = categoryMaps.tiktok.get(title).id;
    }
    
    sharedBetweenTwo.push({
      title: igCat.title,
      platforms: platforms,
      ids: ids
    });
  }
}

s

if (sharedCategories.length > 0) {  
  sharedCategories.forEach((cat, index) => {
   
  });

}


if (sharedBetweenTwo.length > 0) {

  sharedBetweenTwo.slice(0, 15).forEach((cat, index) => {
   
  });
  
  if (sharedBetweenTwo.length > 15) {
   
  }

}

// Guardar resultados en archivos
const outputDir = path.join(__dirname, '../data');

// Categorías compartidas en las 3 plataformas
const sharedAllFile = path.join(outputDir, 'hypeauditor-shared-all-platforms.json');
fs.writeFileSync(sharedAllFile, JSON.stringify(sharedCategories, null, 2));

// Categorías compartidas en 2 plataformas
const sharedTwoFile = path.join(outputDir, 'hypeauditor-shared-two-platforms.json');
fs.writeFileSync(sharedTwoFile, JSON.stringify(sharedBetweenTwo, null, 2));

// Crear archivo de texto legible
let textContent = '# CATEGORÍAS COMPARTIDAS EN HYPEAUDITOR TAXONOMY\n';
textContent += '# ===============================================\n\n';

textContent += `## CATEGORÍAS COMPARTIDAS EN LAS 3 PLATAFORMAS (${sharedCategories.length})\n`;
textContent += '## Estas son las mejores para implementar en el filtro\n\n';

sharedCategories.forEach((cat, index) => {
  textContent += `${index + 1}. ${cat.title}\n`;
  textContent += `   Instagram ID: ${cat.instagram_id}\n`;
  textContent += `   YouTube ID: ${cat.youtube_id}\n`;
  textContent += `   TikTok ID: ${cat.tiktok_id}\n\n`;
});

textContent += `\n## CATEGORÍAS COMPARTIDAS EN 2 PLATAFORMAS (${sharedBetweenTwo.length})\n`;
textContent += '## Alternativas si necesitamos más opciones\n\n';

sharedBetweenTwo.slice(0, 20).forEach((cat, index) => {
  textContent += `${index + 1}. ${cat.title}\n`;
  textContent += `   Plataformas: ${cat.platforms.join(', ')}\n`;
  Object.entries(cat.ids).forEach(([platform, id]) => {
    textContent += `   ${platform}: ${id}\n`;
  });
  textContent += '\n';
});

const textFile = path.join(outputDir, 'hypeauditor-shared-categories.txt');
fs.writeFileSync(textFile, textContent);

  









