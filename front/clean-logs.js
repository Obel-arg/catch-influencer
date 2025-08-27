#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patrones a eliminar (debug logs con emojis)
const DEBUG_PATTERNS = [
  /console\.log\(['"`]🚀.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]🔍.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]✅.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]❌.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]🔧.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]🔄.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]🎯.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]📊.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]🧪.*?['"`]\);?\s*$/gm,
  /console\.log\(['"`]📝.*?['"`]\);?\s*$/gm,
];

// Patrones de console.log con objetos/variables (más complejos)
const COMPLEX_PATTERNS = [
  /console\.log\(['"`]🚀.*?['"`],.*?\);?\s*$/gm,
  /console\.log\(['"`]🔍.*?['"`],.*?\);?\s*$/gm,
  /console\.log\(['"`]✅.*?['"`],.*?\);?\s*$/gm,
  /console\.log\(['"`]❌.*?['"`],.*?\);?\s*$/gm,
  /console\.log\(['"`]🔧.*?['"`],.*?\);?\s*$/gm,
];

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Limpiar patrones simples
  DEBUG_PATTERNS.forEach(pattern => {
    const newContent = content.replace(pattern, '// Debug log removed');
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  // Limpiar patrones complejos
  COMPLEX_PATTERNS.forEach(pattern => {
    const newContent = content.replace(pattern, '// Debug log removed');
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Cleaned: ${filePath}`);
  }
}

// Buscar todos los archivos .tsx y .ts
const files = glob.sync('src/**/*.{ts,tsx}', { cwd: __dirname });

console.log(`🧹 Limpiando ${files.length} archivos...`);

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  cleanFile(fullPath);
});

console.log('🎉 Limpieza completada!');
