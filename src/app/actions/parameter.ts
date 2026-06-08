"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ParameterCategory } from "@prisma/client";

export async function getActiveParameters() {
  try {
    return await prisma.masterParameter.findMany({
      where: {
        isAktif: true,
        deletedAt: null
      },
      orderBy: [
        { kategori: 'desc' }, // TINDAKAN first usually
        { nama: 'asc' }
      ]
    });
  } catch (error) {
    console.error("Failed to fetch parameters:", error);
    return [];
  }
}

export async function createParameter(data: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak" };
  }

  const nama = data.get("nama") as string;
  const kategoriStr = data.get("kategori") as string;
  const isBaseDenominator = data.get("isBaseDenominator") === "true";

  if (!nama || nama.trim() === "" || !kategoriStr) {
    return { error: "Nama dan Kategori wajib diisi." };
  }

  const cleanName = nama.trim();

  try {
    // Diganti menggunakan findFirst dengan mode insensitive agar tidak perlu toUpperCase()
    const existing = await prisma.masterParameter.findFirst({
      where: { 
        nama: { equals: cleanName, mode: "insensitive" } 
      }
    });

    if (existing) {
      if (existing.deletedAt) {
        await prisma.masterParameter.update({
          where: { id: existing.id },
          data: { 
            deletedAt: null, 
            isAktif: true,
            nama: cleanName, // Update dengan tulisan yang baru diketik
            kategori: kategoriStr as ParameterCategory,
            isBaseDenominator
          }
        });
        revalidatePath("/master/parameter");
        return { success: true };
      }
      return { error: "Parameter dengan nama ini sudah ada." };
    }

    // Simpan aslinya
    await prisma.masterParameter.create({
      data: {
        nama: cleanName,
        kategori: kategoriStr as ParameterCategory,
        isBaseDenominator
      }
    });

    revalidatePath("/master/parameter");
    return { success: true };
  } catch (error) {
    console.error("Gagal menambah parameter:", error);
    return { error: "Terjadi kesalahan pada database." };
  }
}

export async function toggleParameterStatus(id: string, currentAktif: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak" };
  }

  try {
    await prisma.masterParameter.update({
      where: { id },
      data: { isAktif: !currentAktif }
    });
    revalidatePath("/master/parameter");
    return { success: true };
  } catch (error) {
    return { error: "Gagal merubah status" };
  }
}

export async function deleteParameter(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak" };
  }

  try {
    await prisma.masterParameter.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    revalidatePath("/master/parameter");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus parameter" };
  }
}