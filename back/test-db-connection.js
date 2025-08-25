const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔧 PROBANDO CONEXIÓN A CATCH-INFLUENCERS...\n');

async function testConnection() {
    const results = [];
    
    // 1. Verificar variables de entorno
    console.log('📋 VERIFICANDO VARIABLES DE ENTORNO...');
    const requiredVars = {
          'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
        'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY,
        'SUPABASE_DB_URL': process.env.SUPABASE_DB_URL
    };

    for (const [key, value] of Object.entries(requiredVars)) {
        if (value) {
            console.log(`✅ ${key}: Configurada`);
        } else {
            console.log(`❌ ${key}: FALTA`);
            results.push(`ERROR: ${key} no está configurada`);
        }
    }

    if (!requiredVars.SUPABASE_URL || !requiredVars.SUPABASE_ANON_KEY) {
        console.log('\n❌ No se pueden hacer tests sin las variables básicas de Supabase');
        return;
    }

    console.log('\n🔌 PROBANDO CONEXIÓN A SUPABASE...');
    
    // 2. Test conexión Supabase
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        console.log('📡 Conectando a:', process.env.SUPABASE_URL);
        
        // Test 1: Verificar que podemos hacer una consulta básica
        const { data: healthData, error: healthError } = await supabase
            .from('organizations')
            .select('id')
            .limit(1);

        if (healthError) {
            console.log(`❌ Error de conexión: ${healthError.message}`);
            results.push(`ERROR Supabase: ${healthError.message}`);
        } else {
            console.log('✅ Conexión a Supabase exitosa');
            console.log(`📊 Organizaciones encontradas: ${healthData?.length || 0}`);
        }

    } catch (error) {
        console.log(`❌ Error inesperado: ${error.message}`);
        results.push(`ERROR: ${error.message}`);
    }

    // 3. Test conexión admin si existe
    if (process.env.SUPABASE_SERVICE_KEY) {
        console.log('\n🔑 PROBANDO CONEXIÓN ADMIN...');
        try {
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            const { data: adminData, error: adminError } = await supabaseAdmin
                .from('organizations')
                .select('id')
                .limit(1);

            if (adminError) {
                console.log(`❌ Error admin: ${adminError.message}`);
                results.push(`ERROR Admin: ${adminError.message}`);
            } else {
                console.log('✅ Conexión admin exitosa');
            }

        } catch (error) {
            console.log(`❌ Error admin inesperado: ${error.message}`);
            results.push(`ERROR Admin: ${error.message}`);
        }
    }

    // 4. Test estructura de la base de datos
    console.log('\n🏗️ VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS...');
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Verificar algunas tablas principales
        const tablesToCheck = ['organizations', 'influencers', 'campaigns'];
        
        for (const table of tablesToCheck) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);

                if (error) {
                    console.log(`❌ Tabla '${table}': ${error.message}`);
                    results.push(`ERROR Tabla ${table}: ${error.message}`);
                } else {
                    console.log(`✅ Tabla '${table}': Accesible`);
                }
            } catch (error) {
                console.log(`❌ Tabla '${table}': Error inesperado`);
            }
        }

    } catch (error) {
        console.log(`❌ Error verificando estructura: ${error.message}`);
    }

    // 5. Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('🎯 RESUMEN DE LA PRUEBA');
    console.log('='.repeat(50));

    if (results.length === 0) {
        console.log('✅ ¡TODO PERFECTO! La base de datos está lista para usar');
        console.log('🚀 Puedes iniciar tu aplicación sin problemas');
    } else {
        console.log('❌ SE ENCONTRARON PROBLEMAS:');
        results.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result}`);
        });
        console.log('\n🔧 Revisa las variables de entorno y credenciales');
    }

    console.log('\n📊 INFORMACIÓN DEL PROYECTO:');
    console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`   Proyecto: catch-influencers`);
    console.log(`   Estado: ${results.length === 0 ? 'LISTO' : 'NECESITA CORRECCIÓN'}`);
}

// Ejecutar el test
testConnection().catch(error => {
    console.error('\n💥 ERROR CRÍTICO:', error.message);
    process.exit(1);
});
