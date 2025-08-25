const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function resetUserPassword() {
    console.log('🔑 RESETEANDO CONTRASEÑA DE USUARIO...\n');
    
    // Crear cliente admin
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        // Enviar email de reset de contraseña
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            'valentino.bozzer@obel.la'
        );

        if (error) {
            console.log('❌ Error:', error.message);
            
            // Intentar actualizar la contraseña directamente
            console.log('🔄 Intentando establecer contraseña directamente...');
            
            const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                '8e30ccde-d824-4db2-91f9-1f8ea43468da',
                {
                    password: 'ObEl2025!!'  // Contraseña temporal
                }
            );
            
            if (updateError) {
                console.log('❌ Error actualizando contraseña:', updateError.message);
            } else {
                console.log('✅ Contraseña establecida como: ObEl2025!!');
                console.log('📧 Usuario: valentino.bozzer@obel.la');
                console.log('🔑 Contraseña: ObEl2025!!');
                console.log('\n👉 Ahora puedes hacer login con estas credenciales');
            }
        } else {
            console.log('✅ Email de reset enviado exitosamente');
            console.log('📧 Revisa tu email para cambiar la contraseña');
        }

    } catch (error) {
        console.error('💥 Error inesperado:', error.message);
    }
}

resetUserPassword();
