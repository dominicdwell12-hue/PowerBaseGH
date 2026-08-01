const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/database');

const server = app.listen(env.port, () => {
  console.log(`PowerBase Gh API running on port ${env.port} [${env.nodeEnv}]`);
});

// Graceful shutdown — close DB connections cleanly on termination signals
// (important on hosting platforms that send SIGTERM before restarts).
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server closed. Database disconnected.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
