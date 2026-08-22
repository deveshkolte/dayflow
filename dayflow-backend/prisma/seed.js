require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient, LeaveType, LeaveStatus, Role } = require('@prisma/client');

// The seed creates only the minimum identities and leave records needed for the core demo.
const prisma = new PrismaClient();

async function main() {
  const seedPassword = process.env.SEED_PASSWORD;

  if (!seedPassword || seedPassword.length < 8) {
    throw new Error('Set SEED_PASSWORD to at least 8 characters before running the seed.');
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const verifiedAt = new Date();

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dayflow.local' },
    update: { passwordHash, emailVerifiedAt: verifiedAt, role: Role.ADMIN, isActive: true },
    create: {
      employeeId: 'ADM001',
      email: 'admin@dayflow.local',
      passwordHash,
      role: Role.ADMIN,
      firstName: 'Vikram',
      lastName: 'Reddy',
      jobTitle: 'HR Administrator',
      department: 'People Operations',
      emailVerifiedAt: verifiedAt,
    },
  });

  await prisma.user.upsert({
    where: { email: 'hr@dayflow.local' },
    update: { passwordHash, emailVerifiedAt: verifiedAt, role: Role.HR, isActive: true },
    create: {
      employeeId: 'HR001',
      email: 'hr@dayflow.local',
      passwordHash,
      role: Role.HR,
      firstName: 'Aditi',
      lastName: 'Sharma',
      jobTitle: 'HR Officer',
      department: 'People Operations',
      emailVerifiedAt: verifiedAt,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@dayflow.local' },
    update: { passwordHash, emailVerifiedAt: verifiedAt, role: Role.EMPLOYEE, isActive: true },
    create: {
      employeeId: 'EMP001',
      email: 'employee@dayflow.local',
      passwordHash,
      role: Role.EMPLOYEE,
      firstName: 'Rohan',
      lastName: 'Desai',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      emailVerifiedAt: verifiedAt,
    },
  });

  const existingRequest = await prisma.leaveRequest.findFirst({
    where: { employeeId: employee.id, type: LeaveType.PAID, status: LeaveStatus.PENDING },
  });

  if (!existingRequest) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        startDate: new Date('2026-08-25T00:00:00.000Z'),
        endDate: new Date('2026-08-27T00:00:00.000Z'),
        type: LeaveType.PAID,
        reason: 'Family commitment',
      },
    });
  }

  console.log(`Seeded admin ${admin.email}, HR account, employee account, and a pending leave request.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
