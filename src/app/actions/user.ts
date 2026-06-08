"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      where: { deletedAt: null },
      include: { room: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    return [];
  }
}

export async function getRooms() {
  try {
    return await prisma.room.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    });
  } catch (e) {
    return [];
  }
}

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak" };
  }

  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const roomId = (formData.get("roomId") as string) || null;

  if (!name || !username || !password || !role) {
    return { error: "Semua kolom wajib diisi." };
  }
  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }
  if (role === "USER_RUANGAN" && !roomId) {
    return { error: "Perawat (USER_RUANGAN) wajib dipilihkan ruangan." };
  }

  const existing = await prisma.user.findFirst({ where: { username } });
  if (existing) return { error: "Username sudah digunakan." };

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        role,
        roomId: role === "USER_RUANGAN" ? roomId : null,
      },
    });
    revalidatePath("/users");
    return { success: true };
  } catch (e) {
    return { error: "Gagal membuat akun." };
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak" };
  }
  if (newPassword.length < 6) return { error: "Password minimal 6 karakter." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    revalidatePath("/users");
    return { success: true };
  } catch (e) {
    return { error: "Gagal mereset password." };
  }
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak" };
  }
  // Jangan hapus diri sendiri
  if (session.user.id === userId) {
    return { error: "Tidak bisa menghapus akun sendiri." };
  }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/users");
    return { success: true };
  } catch (e) {
    return { error: "Gagal menghapus akun." };
  }
}
