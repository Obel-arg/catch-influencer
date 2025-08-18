import { Pool } from 'pg';
import config from './environment';

const pool = new Pool({
  connectionString: config.supabase.dbUrl,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // tiempo máximo que un cliente puede estar inactivo
  connectionTimeoutMillis: 2000, // tiempo máximo para establecer una conexión
});

// Probar la conexión
pool.connect()
  .then(() => {})
  .catch(err => {
    console.error('❌ Error al conectar a PostgreSQL:', err);
    process.exit(1); // Terminar la aplicación si no podemos conectar a la base de datos
  });

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
});

export default pool; 