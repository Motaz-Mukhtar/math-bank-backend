import { PrismaClient } from '@prisma/client';

/**
 * Generate academic number in format: std-xxxxxxxxxx
 * where x is a random digit (0-9)
 */
export const generateAcademicNumber = (): string => {
  const randomDigits = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');
  return `std-${randomDigits}`;
};

/**
 * Find a unique academic number by checking database
 * Retries up to 3 times on collision
 */
export const findUniqueAcademicNumber = async (
  prisma: PrismaClient
): Promise<string> => {
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    const academicNumber = generateAcademicNumber();

    const existing = await prisma.user.findUnique({
      where: { academicNumber },
      select: { id: true },
    });

    if (!existing) {
      return academicNumber;
    }
  }

  throw new Error('Failed to generate unique academic number after 3 attempts');
};
