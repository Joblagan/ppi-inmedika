"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createIcraBangunan(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const projectGroup = formData.get("projectGroup") as string;
  const riskGroup = formData.get("riskGroup") as string;
  const kelasKewaspadaan = formData.get("kelasKewaspadaan") as string;
  const description = formData.get("description") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;

  if (!projectGroup || !riskGroup || !kelasKewaspadaan || !startDateStr || !endDateStr) {
    return { error: "Semua kolom wajib diisi." };
  }

  const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
  const endDate = new Date(`${endDateStr}T00:00:00.000Z`);

  if (endDate < startDate) {
    return { error: "Tanggal selesai tidak boleh lebih awal dari tanggal mulai." };
  }

  try {
    const newIcra = await prisma.icraBangunan.create({
      data: {
        projectGroup,
        riskGroup,
        kelasKewaspadaan,
        description: description || null,
        startDate,
        endDate,
        createdById: session.user.id,
      },
    });

    await prisma.auditTrail.create({
      data: {
        modelName: "IcraBangunan",
        recordId: newIcra.id,
        action: "CREATE",
        newValue: JSON.parse(JSON.stringify(newIcra)),
        userId: session.user.id,
      }
    });

    revalidatePath("/icra/bangunan");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Gagal menyimpan data ICRA Bangunan." };
  }
}

export async function createIcraProgram(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const tahun = parseInt(formData.get("tahun") as string, 10);
  const jenisRisiko = formData.get("jenisRisiko") as string;
  const probabilitas = parseInt(formData.get("probabilitas") as string, 10);
  const dampak = parseInt(formData.get("dampak") as string, 10);
  const sistemYangAda = parseInt(formData.get("sistemYangAda") as string, 10);
  const tujuan = formData.get("tujuan") as string;
  const strategi = formData.get("strategi") as string;

  if (isNaN(tahun) || !jenisRisiko || isNaN(probabilitas) || isNaN(dampak) || isNaN(sistemYangAda)) {
    return { error: "Kolom yang wajib harus diisi dengan benar." };
  }

  const skorPrioritas = probabilitas * dampak * sistemYangAda;

  try {
    const newIcra = await prisma.icraProgram.create({
      data: {
        tahun,
        jenisRisiko,
        probabilitas,
        dampak,
        sistemYangAda,
        skorPrioritas,
        tujuan: tujuan || null,
        strategi: strategi || null,
        createdById: session.user.id,
      },
    });

    await prisma.auditTrail.create({
      data: {
        modelName: "IcraProgram",
        recordId: newIcra.id,
        action: "CREATE",
        newValue: JSON.parse(JSON.stringify(newIcra)),
        userId: session.user.id,
      }
    });

    revalidatePath("/icra/program");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Gagal menyimpan data ICRA Program." };
  }
}

export async function deleteIcraBangunan(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  try {
    const oldRecord = await prisma.icraBangunan.findUnique({ where: { id } });
    if (!oldRecord) return { error: "Data tidak ditemukan." };

    await prisma.icraBangunan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditTrail.create({
      data: {
        modelName: "IcraBangunan",
        recordId: id,
        action: "DELETE",
        oldValue: JSON.parse(JSON.stringify(oldRecord)),
        userId: session.user.id,
      }
    });

    revalidatePath("/icra/bangunan");
    return { success: true };
  } catch (e) {
    return { error: "Gagal menghapus data." };
  }
}

export async function deleteIcraProgram(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  try {
    const oldRecord = await prisma.icraProgram.findUnique({ where: { id } });
    if (!oldRecord) return { error: "Data tidak ditemukan." };

    await prisma.icraProgram.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.auditTrail.create({
      data: {
        modelName: "IcraProgram",
        recordId: id,
        action: "DELETE",
        oldValue: JSON.parse(JSON.stringify(oldRecord)),
        userId: session.user.id,
      }
    });

    revalidatePath("/icra/program");
    return { success: true };
  } catch (e) {
    return { error: "Gagal menghapus data." };
  }
}
