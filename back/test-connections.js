#!/usr/bin/env node

/**
 * Script de prueba de conexiones para catch-influencers
 * Ejecuta: node test-connections.js
 */

const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = process.env.API_PREFIX || '/api';

console.log('🔧 PROBANDO CONEXIONES DEL BACKEND...\n');

// Función para hacer peticiones HTTP
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${API_PREFIX}${path}`;
    console.log(`📡 Probando: ${url}`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout después de 10 segundos'));
    });
  });
}

async function runTests() {
  const tests = [
    {
      name: '🏥 Health Check',
      path: '/health'
    },
    {
      name: '🔌 Test de Conexiones Completo',
      path: '/debug/connections'
    },
    {
      name: '📊 Test Supabase Específico',
      path: '/debug/connections/supabase'
    },
    {
      name: '🗄️ Test Database Específico',
      path: '/debug/connections/database'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n${test.name}`);
      console.log('=' .repeat(50));
      
      const result = await makeRequest(test.path);
      
      if (result.status === 200) {
        console.log('✅ ÉXITO');
        
        // Mostrar información relevante según el endpoint
        if (test.path === '/health') {
          console.log(`   Status: ${result.data.status}`);
          console.log(`   Uptime: ${Math.floor(result.data.uptime)}s`);
          console.log(`   Environment: ${result.data.environment}`);
        } else if (test.path === '/debug/connections') {
          console.log(`   Status General: ${result.data.status}`);
          console.log(`   Resumen: ${result.data.message}`);
          console.log(`   Éxitos: ${result.data.summary.success}`);
          console.log(`   Advertencias: ${result.data.summary.warnings}`);
          console.log(`   Errores: ${result.data.summary.errors}`);
          
          // Mostrar detalles de conexiones con problemas
          const problemConnections = result.data.connections.filter(
            conn => conn.status !== 'ok'
          );
          
          if (problemConnections.length > 0) {
            console.log('\n   ⚠️ CONEXIONES CON PROBLEMAS:');
            problemConnections.forEach(conn => {
              console.log(`   - ${conn.service}: ${conn.message}`);
            });
          }
        } else {
          console.log(`   Status: ${result.data.status}`);
          console.log(`   Message: ${result.data.message}`);
        }
        
      } else {
        console.log(`❌ ERROR (${result.status})`);
        if (result.data.message) {
          console.log(`   Error: ${result.data.message}`);
        }
      }
      
    } catch (error) {
      console.log('❌ ERROR DE CONEXIÓN');
      console.log(`   ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('   👉 ¿Está corriendo el servidor backend?');
        console.log(`   👉 Verifica que esté en: ${BACKEND_URL}`);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎯 PRUEBAS COMPLETADAS');
  console.log('='.repeat(50));
  console.log('\n📝 NOTAS:');
  console.log('• Si ves errores de conexión, asegúrate de que el backend esté corriendo');
  console.log('• Si hay errores de Supabase, verifica las variables de entorno');
  console.log('• Advertencias son normales si no tienes todas las APIs configuradas');
  console.log(`\n🌐 Backend URL: ${BACKEND_URL}${API_PREFIX}`);
}

// Ejecutar tests
runTests().catch(console.error);
