const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');

const startServer = async () => {
  try {
    // Initialize Database
    await connectDB();

    // Start Express Listener
    const server = app.listen(config.PORT, () => {
      console.log(`=========================================`);
      console.log(`⚡ QuickCourt Server is running on port ${config.PORT}`);
      console.log(`📡 API URL: http://localhost:${config.PORT}/api`);
      console.log(`=========================================`);
    });

    const handleShutdown = async () => {
      console.log('\nGracefully shutting down QuickCourt Server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
  } catch (err) {
    console.error('Failed to start QuickCourt server:', err);
    process.exit(1);
  }
};

startServer();
