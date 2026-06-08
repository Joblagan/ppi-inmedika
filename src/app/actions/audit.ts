"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AuditType } from "@prisma/client";

export async function createAudit(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const date = formData.get("date") as string;
  const auditType = formData.get("auditType") as AuditType;
  const peluang = parseInt(formData.get("peluang") as string, 10);
  const tindakanBenar = parseInt(formData.get("tindakanBenar") as string, 10);
  const notes = (formData.get("notes") as string)?.trim();
  const roomId = (formData.get("roomId") as string) || session.user.roomId;

  if (!date || !auditType || isNaN(peluang) || isNaN(tindakanBenar) || !roomId) {
    return { error: "Semua kolom wajib diisi." };
  }
  if (tindakanBenar > peluang) {
    return { error: "Tindakan benar tidak bisa melebihi jumlah peluang." };
  }

  const normalizedDate = new Date(`${date}T00:00:00.000Z`);

  try {
    await prisma.auditKepatuhan.create({
      data: {
        date: normalizedDate,
        auditType,
        peluang,
        tindakanBenar,
        notes: notes || null,
        roomId,
        createdById: session.user.id,
      },
    });
    revalidatePath("/audit");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Gagal menyimpan data audit." };
  }
}

export async function getAudits({ month, year }: { month?: number; year?: number } = {}) {
  const now = new Date();
  const m = month ?? now.getMonth();
  const y = year ?? now.getFullYear();

  const startDate = new Date(Date.UTC(y, m, 1));
  const endDate = new Date(Date.UTC(y, m + 1, 0));

  try {
    return await prisma.auditKepatuhan.findMany({
      where: {
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
      },
      include: { room: true, createdBy: { select: { name: true } } },
      orderBy: { date: "desc" },
    });
  } catch (e) {
    return [];
  }
}

export async function deleteAudit(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  try {
    await prisma.auditKepatuhan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/audit");
    return { success: true };
  } catch (e) {
    return { error: "Gagal menghapus data." };
  }
}
