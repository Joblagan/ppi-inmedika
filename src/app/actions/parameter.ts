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
  const targetKepatuhanRaw = data.get("targetKepatuhan") as string;
  const targetKepatuhan = targetKepatuhanRaw ? Number(targetKepatuhanRaw) : null;

  if (!nama || nama.trim() === "" || !kategoriStr) {
    return { error: "Nama dan Kategori wajib diisi." };
  }

  if (targetKepatuhan !== null && (isNaN(targetKepatuhan) || targetKepatuhan < 0 || targetKepatuhan > 100)) {
    return { error: "Target kepatuhan harus antara 0 dan 100." };
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
            isBaseDenominator,
            targetKepatuhan,
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
        isBaseDenominator,
        targetKepatuhan,
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

export async function updateParameter(data: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return { error: "Akses Ditolak" };
  }

  const id = data.get("id") as string;
  const nama = (data.get("nama") as string)?.trim();
  const kategoriStr = data.get("kategori") as string;
  const isBaseDenominator = data.get("isBaseDenominator") === "true";
  const targetKepatuhanRaw = data.get("targetKepatuhan") as string;
  const targetKepatuhan = targetKepatuhanRaw ? Number(targetKepatuhanRaw) : null;

  if (!id || !nama || !kategoriStr) {
    return { error: "Semua kolom wajib diisi." };
  }

  if (targetKepatuhan !== null && (isNaN(targetKepatuhan) || targetKepatuhan < 0 || targetKepatuhan > 100)) {
    return { error: "Target kepatuhan harus antara 0 dan 100." };
  }

  const existing = await prisma.masterParameter.findFirst({
    where: {
      nama: { equals: nama, mode: "insensitive" },
    },
  });

  if (existing && existing.id !== id) {
    return { error: "Nama parameter sudah digunakan." };
  }

  try {
    await prisma.masterParameter.update({
      where: { id },
      data: {
        nama,
        kategori: kategoriStr as ParameterCategory,
        isBaseDenominator,
        targetKepatuhan,
      },
    });
    revalidatePath("/master/parameter");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengupdate parameter:", error);
    return { error: "Gagal memperbarui parameter." };
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