import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '../src/config/database';

// Setup before all tests
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Ensure database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
});

// Cleanup after each test
afterEach(async () => {
  // Optional: Clean up test data
  // Be careful with this in production-like environments
});

// Cleanup after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
});
