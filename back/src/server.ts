import app from './app';
import config from './config/environment';
import { initializeWorkers } from './controllers/admin/admin.controller';

const PORT = config.port;

// Start the server
const server = app.listen(PORT, () => {
  // Inicializar workers del admin panel
  initializeWorkers().catch(console.error);
});

// Export the app and server for serverless deployment
export default app;
export { server };

// Manejo de errores no capturados
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});
