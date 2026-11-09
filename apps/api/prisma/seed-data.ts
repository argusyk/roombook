// Фіксовані сід-дані RoomBook (канон: явні id, умовні імена, жодних реальних ПІБ).
import type { PrismaClient, Role } from "@prisma/client";

export const ROOMS = [
  { id: 1, code: "A-314", name: "Лабораторія програмної інженерії", building: "Корпус A", capacity: 30, hasProjector: true },
  { id: 2, code: "A-214", name: "Комп'ютерний клас", building: "Корпус A", capacity: 24, hasProjector: true },
  { id: 3, code: "B-214", name: "Аудиторія для консультацій", building: "Корпус B", capacity: 12, hasProjector: false },
  { id: 4, code: "B-105", name: "Лекційна аудиторія", building: "Корпус B", capacity: 90, hasProjector: true },
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export const USERS: { id: number; email: string; name: string; role: Role }[] = [
  { id: 1, email: "admin@roombook.test", name: "Адміністратор", role: "admin" },
  ...[1, 2, 3].map((n) => ({
    id: n + 1,
    email: `teacher${n}@roombook.test`,
    name: `Викладач ${n}`,
    role: "teacher" as const,
  })),
  ...Array.from({ length: 16 }, (_, i) => ({
    id: i + 5,
    email: `student${pad(i + 1)}@roombook.test`,
    name: `Студент ${pad(i + 1)}`,
    role: "student" as const,
  })),
  // службовий користувач канарки (розд. 17): лише для тестової бази безпеки
  { id: 9001, email: "canary@roombook.test", name: "Канарка", role: "student" },
];

export const seedIds = {
  rooms: { A314: 1, A214: 2, B214: 3, B105: 4 },
  admin: 1,
  teachers: [2, 3, 4],
  students: USERS.filter((u) => u.role === "student" && u.id < 9000).map((u) => u.id),
  canary: 9001,
} as const;

/** Вставляє (або оновлює) аудиторії й користувачів і вирівнює послідовності id. */
export async function seedBase(db: PrismaClient): Promise<void> {
  for (const room of ROOMS) {
    await db.room.upsert({ where: { id: room.id }, update: room, create: room });
  }
  for (const user of USERS) {
    await db.user.upsert({ where: { id: user.id }, update: user, create: user });
  }
  for (const table of ["Room", "User"]) {
    await db.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"','id'), (SELECT max(id) FROM "${table}"))`,
    );
  }
}
