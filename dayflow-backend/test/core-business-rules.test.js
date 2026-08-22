const test = require('node:test');
const assert = require('node:assert/strict');
const { AttendanceService } = require('../dist/attendance/attendance.service.js');
const { LeaveService } = require('../dist/leave/leave.service.js');

const employee = {
  id: 'user-employee-1',
  employeeId: 'EMP001',
  email: 'employee@example.com',
  role: 'EMPLOYEE',
};

const hrUser = {
  id: 'user-hr-1',
  employeeId: 'HR001',
  email: 'hr@example.com',
  role: 'HR',
};

const employeeRecord = {
  id: employee.id,
  employeeId: employee.employeeId,
  firstName: 'Asha',
  lastName: 'Rao',
};

const leaveDates = {
  startDate: new Date('2026-09-10T00:00:00.000Z'),
  endDate: new Date('2026-09-12T00:00:00.000Z'),
};

function createLeaveRecord(overrides = {}) {
  // This record mirrors only the fields LeaveService serializes from Prisma.
  return {
    id: 'leave-1',
    employeeId: employee.id,
    ...leaveDates,
    type: 'PAID',
    status: 'PENDING',
    reason: 'Family event',
    approverId: null,
    approverComment: null,
    createdAt: new Date('2026-08-22T08:00:00.000Z'),
    updatedAt: new Date('2026-08-22T08:00:00.000Z'),
    employee: employeeRecord,
    approver: null,
    ...overrides,
  };
}

test('leave submission rejects an end date before the start date', async () => {
  const prisma = {
    leaveRequest: { findFirst: async () => null },
  };
  const service = new LeaveService(prisma);

  await assert.rejects(
    service.create(employee, {
      startDate: '2026-09-12',
      endDate: '2026-09-10',
      type: 'PAID',
    }),
    (error) => error.message === 'The leave end date cannot precede the start date.',
  );
});

test('leave submission rejects an identical pending request', async () => {
  const prisma = {
    leaveRequest: { findFirst: async () => ({ id: 'existing-leave' }) },
  };
  const service = new LeaveService(prisma);

  await assert.rejects(
    service.create(employee, {
      startDate: '2026-09-10',
      endDate: '2026-09-12',
      type: 'PAID',
    }),
    (error) => error.message === 'An identical pending leave request already exists.',
  );
});

test('leave approval updates the request and writes an audit event', async () => {
  const auditRows = [];
  const updated = createLeaveRecord({
    status: 'APPROVED',
    approverId: hrUser.id,
    approver: { firstName: 'Hari', lastName: 'Menon' },
  });
  const prisma = {
    $transaction: async (callback) => callback({
      leaveRequest: {
        findUnique: async () => createLeaveRecord(),
        update: async () => updated,
      },
      auditLog: {
        create: async ({ data }) => auditRows.push(data),
      },
    }),
  };
  const service = new LeaveService(prisma);

  const result = await service.decide('leave-1', hrUser, { decision: 'APPROVE', comment: 'Approved.' });

  assert.equal(result.status, 'APPROVED');
  assert.equal(auditRows.length, 1);
  assert.equal(auditRows[0].action, 'LEAVE_APPROVED');
  assert.equal(auditRows[0].metadata.previousStatus, 'PENDING');
});

test('attendance rejects a second check-in for the same day', async () => {
  const prisma = {
    attendance: {
      findUnique: async () => ({ id: 'attendance-1', checkIn: new Date() }),
    },
  };
  const service = new AttendanceService(prisma);

  await assert.rejects(
    service.checkIn(employee),
    (error) => error.message === 'You have already checked in today.',
  );
});

test('audit log service queries logs correctly with pagination envelope', async () => {
  const { AuditService } = require('../dist/audit/audit.service.js');
  const sampleLog = {
    id: 'log-1',
    action: 'LEAVE_APPROVED',
    entity: 'LeaveRequest',
    metadata: { leaveRequestId: 'leave-1' },
    createdAt: new Date('2026-08-22T10:00:00.000Z'),
    actor: { id: 'hr-1', employeeId: 'HR001', firstName: 'Aditi', lastName: 'Sharma', role: 'HR' },
  };

  const prisma = {
    auditLog: {
      findMany: async () => [sampleLog],
      count: async () => 1,
    },
  };

  const service = new AuditService(prisma);
  const result = await service.findAll({ search: 'Leave' });

  assert.equal(result.total, 1);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].action, 'LEAVE_APPROVED');
  assert.equal(result.items[0].actor.fullName, 'Aditi Sharma');
});

test('employee update by admin records audit log event', async () => {
  const { EmployeeService } = require('../dist/employee/employee.service.js');
  const auditRows = [];
  const updatedUser = {
    id: 'emp-1',
    employeeId: 'EMP001',
    email: 'emp1@dayflow.local',
    firstName: 'Rohan',
    lastName: 'Desai',
    phone: '1234567890',
    address: '123 Main St',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    role: 'EMPLOYEE',
    isActive: true,
    profilePictureUrl: null,
    createdAt: new Date(),
    documents: [],
    salaryStructures: [],
  };

  const prisma = {
    $transaction: async (callback) =>
      callback({
        user: { update: async () => updatedUser },
        auditLog: { create: async ({ data }) => auditRows.push(data) },
      }),
  };

  const service = new EmployeeService(prisma);
  const result = await service.updateByAdmin('emp-1', { department: 'Engineering' }, hrUser);

  assert.equal(result.id, 'emp-1');
  assert.equal(auditRows.length, 1);
  assert.equal(auditRows[0].action, 'EMPLOYEE_UPDATED');
  assert.equal(auditRows[0].entity, 'User');
});
