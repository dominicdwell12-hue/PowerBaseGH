// Single shared Prisma client instance. Reusing one instance across the
// app avoids exhausting MySQL connections (a common mistake when each
// module creates its own PrismaClient).

const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
