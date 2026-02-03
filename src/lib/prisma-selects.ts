import { Prisma } from "@prisma/client";

export const USER_EMAIL_SELECT = {
  id: true,
  email: true,
} as const satisfies Prisma.UserSelect;

export const USER_AUTH_SELECT = {
  id: true,
  email: true,
  password: true,
} as const satisfies Prisma.UserSelect;

export const DRIVER_AUTH_SELECT = {
  cpf: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  userId: true,
  updatedAt: true,
  user: { select: USER_AUTH_SELECT },
} as const satisfies Prisma.DriverSelect;

export const GUARDIAN_AUTH_SELECT = {
  cpf: true,
  name: true,
  kinship: true,
  birthDate: true,
  spouseName: true,
  address: true,
  mobile: true,
  landline: true,
  workAddress: true,
  workPhone: true,
  userId: true,
  updatedAt: true,
  user: { select: USER_AUTH_SELECT },
} as const satisfies Prisma.GuardianSelect;

export const DRIVER_WITH_USER_EMAIL_SELECT = {
  cpf: true,
  name: true,
  email: true,
  userId: true,
  user: { select: USER_EMAIL_SELECT },
} as const satisfies Prisma.DriverSelect;

export const GUARDIAN_WITH_USER_EMAIL_SELECT = {
  cpf: true,
  name: true,
  userId: true,
  user: { select: USER_EMAIL_SELECT },
} as const satisfies Prisma.GuardianSelect;

export const VAN_SYNC_SELECT = {
  id: true,
  model: true,
  color: true,
  year: true,
  plate: true,
  driverCpf: true,
  city: true,
  billingDay: true,
  monthlyFee: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.VanSelect;

export const DRIVER_SYNC_SELECT = {
  cpf: true,
  name: true,
  cnh: true,
  phone: true,
  email: true,
  address: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.DriverSelect;

export const GUARDIAN_SYNC_SELECT = {
  cpf: true,
  name: true,
  kinship: true,
  rg: true,
  birthDate: true,
  spouseName: true,
  address: true,
  mobile: true,
  landline: true,
  workAddress: true,
  workPhone: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.GuardianSelect;

export const SCHOOL_SYNC_SELECT = {
  id: true,
  name: true,
  address: true,
  phone: true,
  contact: true,
  principal: true,
  doorman: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.SchoolSelect;

export const STUDENT_SYNC_SELECT = {
  id: true,
  name: true,
  birthDate: true,
  cpf: true,
  rg: true,
  period: true,
  grade: true,
  guardianCpf: true,
  schoolId: true,
  vanId: true,
  driverCpf: true,
  mobile: true,
  blacklist: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.StudentSelect;

export const STUDENT_SCOPE_SELECT = {
  driverCpf: true,
  guardianCpf: true,
} as const satisfies Prisma.StudentSelect;

export const PAYMENT_SYNC_SELECT = {
  id: true,
  studentId: true,
  vanId: true,
  dueDate: true,
  paidAt: true,
  amount: true,
  discount: true,
  status: true,
  boletoId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.PaymentSelect;

export const PASSWORD_RESET_TOKEN_SELECT = {
  id: true,
  userId: true,
  expiresAt: true,
  usedAt: true,
} as const satisfies Prisma.PasswordResetTokenSelect;
