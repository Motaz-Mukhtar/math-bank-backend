import request from 'supertest';
import app from '../../src/app';

/**
 * Test user credentials
 */
export const testUsers = {
  admin: {
    email: 'admin@mathbank.test',
    password: 'Admin@123456',
    fullName: 'Test Admin',
    role: 'ADMIN' as const,
  },
  student: {
    email: 'student@mathbank.test',
    password: 'Student@123456',
    fullName: 'Test Student',
    role: 'STUDENT' as const,
  },
  parent: {
    email: 'parent@mathbank.test',
    password: 'Parent@123456',
    fullName: 'Test Parent',
    role: 'PARENT' as const,
  },
};

/**
 * Register a test user
 */
export async function registerUser(userData: {
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'STUDENT' | 'PARENT';
  phone?: string;
  childAcademicNumber?: string;
}) {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);
  
  return response;
}

/**
 * Login and get access token
 */
export async function loginUser(email: string, password: string): Promise<string> {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  
  if (response.status !== 200) {
    throw new Error(`Login failed: ${response.body.error || 'Unknown error'}`);
  }
  
  return response.body.data.accessToken;
}

/**
 * Get admin token (assumes admin exists and is verified)
 */
export async function getAdminToken(): Promise<string> {
  try {
    return await loginUser(testUsers.admin.email, testUsers.admin.password);
  } catch (error) {
    // If admin doesn't exist, you might need to create one manually
    throw new Error('Admin user not found. Please create admin user first.');
  }
}

/**
 * Get student token (assumes student exists and is verified)
 */
export async function getStudentToken(): Promise<string> {
  try {
    return await loginUser(testUsers.student.email, testUsers.student.password);
  } catch (error) {
    throw new Error('Student user not found. Please create student user first.');
  }
}

/**
 * Get parent token (assumes parent exists and is verified)
 */
export async function getParentToken(): Promise<string> {
  try {
    return await loginUser(testUsers.parent.email, testUsers.parent.password);
  } catch (error) {
    throw new Error('Parent user not found. Please create parent user first.');
  }
}

/**
 * Create authorization header
 */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
