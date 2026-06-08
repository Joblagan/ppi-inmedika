"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createRoom(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak. Hanya SUPER_ADMIN yang dapat membuat ruangan." };
  }

  const name = formData.get("name") as string;
  
  if (!name || name.trim().length === 0) {
    return { error: "Nama ruangan tidak boleh kosong." };
  }

  const cleanName = name.trim();

  try {
    // Mengecek duplikasi data tanpa peduli huruf besar/kecil (case-insensitive)
    const existingRoom = await prisma.room.findFirst({
      where: { 
        name: { equals: cleanName, mode: "insensitive" } 
      }
    });

    if (existingRoom) {
      if (existingRoom.deletedAt) {
        // Jika sudah ada tapi terhapus, kita restore dan update format tulisannya
        await prisma.room.update({
          where: { id: existingRoom.id },
          data: { deletedAt: null, name: cleanName }
        });
        revalidatePath("/master/ruangan");
        return { success: true };
      }
      return { error: "Ruangan dengan nama ini sudah ada dan aktif." };
    }

    // Menyimpan persis sesuai ketikan user (tanpa toUpperCase)
    await prisma.room.create({
      data: {
        name: cleanName
      }
    });

    revalidatePath("/master/ruangan");
    return { success: true };
  } catch (error) {
    console.error("Gagal membuat ruangan:", error);
    return { error: "Terjadi kesalahan pada database." };
  }
}

export async function updateRoomName(roomId: string, newName: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak." };
  }

  if (!newName || newName.trim().length === 0) {
    return { error: "Nama ruangan tidak boleh kosong." };
  }

  const cleanName = newName.trim();

  try {
    const existing = await prisma.room.findFirst({
      where: { 
        name: { equals: cleanName, mode: "insensitive" } 
      }
    });

    if (existing && existing.id !== roomId) {
      return { error: "Nama ruangan sudah digunakan." };
    }

    await prisma.room.update({
      where: { id: roomId },
      data: { name: cleanName }
    });

    revalidatePath("/master/ruangan");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengupdate nama ruangan:", error);
    return { error: "Terjadi kesalahan database." };
  }
}

export async function toggleDeleteRoom(roomId: string, currentDeletedAt: Date | null) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak." };
  }

  try {
    await prisma.room.update({
      where: { id: roomId },
      data: {
        deletedAt: currentDeletedAt ? null : new Date()
      }
    });

    revalidatePath("/master/ruangan");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengubah status ruangan:", error);
    return { error: "Terjadi kesalahan pada database." };
  }
}