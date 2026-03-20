import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Demo1234!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', name: 'Demo User', passwordHash },
  });
  console.log('Created user:', user.email);

  const tasks = [
    { title: 'Set up project structure', status: 'COMPLETED', priority: 'HIGH', description: 'Initialize the monorepo and configure all dependencies.' },
    { title: 'Design database schema', status: 'COMPLETED', priority: 'HIGH', description: 'Create ERD and write Prisma schema for users and tasks.' },
    { title: 'Implement authentication API', status: 'IN_PROGRESS', priority: 'HIGH', description: 'JWT-based auth with access and refresh tokens.' },
    { title: 'Build task CRUD endpoints', status: 'IN_PROGRESS', priority: 'MEDIUM', description: 'Full REST API for task management with pagination.' },
    { title: 'Create Next.js frontend', status: 'PENDING', priority: 'MEDIUM', description: 'Build responsive dashboard with Next.js App Router.' },
    { title: 'Write unit tests', status: 'PENDING', priority: 'LOW', description: 'Add Jest tests for services and controllers.' },
    { title: 'Set up CI/CD pipeline', status: 'PENDING', priority: 'LOW', description: 'GitHub Actions workflow for automated deployment.' },
    { title: 'Write API documentation', status: 'PENDING', priority: 'MEDIUM', description: 'OpenAPI/Swagger docs for all endpoints.' },
  ];

  for (const task of tasks) {
    await prisma.task.create({ data: { ...task, userId: user.id } });
  }

  console.log('Created', tasks.length, 'tasks');
  console.log('\nDone! Login: demo@example.com / Demo1234!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
