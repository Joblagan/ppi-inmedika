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
  const detailsStr = formData.get("details") as string;
  let details = null;
  
  if (detailsStr) {
    try {
      details = JSON.parse(detailsStr);
    } catch (e) {
      console.error("Gagal parse details JSON");
    }
  }

  if (!date || !auditType || isNaN(peluang) || isNaN(tindakanBenar) || !roomId) {
    return { error: "Semua kolom wajib diisi." };
  }
  if (tindakanBenar > peluang) {
    return { error: "Tindakan benar tidak bisa melebihi jumlah peluang." };
  }

  const normalizedDate = new Date(`${date}T00:00:00.000Z`);

  try {
    const newAudit = await prisma.auditKepatuhan.create({
      data: {
        date: normalizedDate,
        auditType,
        peluang,
        tindakanBenar,
        details,
        notes: notes || null,
        roomId,
        createdById: session.user.id,
      },
    });

    await prisma.auditTrail.create({
      data: {
        modelName: "AuditKepatuhan",
        recordId: newAudit.id,
        action: "CREATE",
        newValue: JSON.parse(JSON.stringify(newAudit)),
        userId: session.user.id,
      }
    });

    revalidatePath("/audit");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Gagal menyimpan data audit." };
  }
}

export async function getAudits({ month, roomId }: { month?: string; roomId?: string } = {}) {
  const now = new Date();
  const [year, monthNumber] = month ? month.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNumber, 0));

  try {
    const audits = await prisma.auditKepatuhan.findMany({
      where: {
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
        ...(roomId ? { roomId } : {}),
      },
      include: { room: true, createdBy: { select: { name: true } } },
      orderBy: { date: "desc" },
    });

    const totalPeluang = audits.reduce((sum, audit) => sum + audit.peluang, 0);
    const totalBenar = audits.reduce((sum, audit) => sum + audit.tindakanBenar, 0);
    const kepatuhanRate = totalPeluang > 0 ? Math.round((totalBenar / totalPeluang) * 100) : 0;

    return { audits, totalPeluang, totalBenar, kepatuhanRate };
  } catch (e) {
    console.error("Failed to fetch audits:", e);
    return { audits: [], totalPeluang: 0, totalBenar: 0, kepatuhanRate: 0 };
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
