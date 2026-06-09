"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { InfectionType } from "@prisma/client";

export async function createInfection(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  const date = formData.get("date") as string;
  const patientMrn = (formData.get("patientMrn") as string)?.trim();
  const patientName = (formData.get("patientName") as string)?.trim();
  const infectionType = formData.get("infectionType") as InfectionType;
  const description = (formData.get("description") as string)?.trim();
  const roomId = (formData.get("roomId") as string) || session.user.roomId;

  if (!date || !patientMrn || !patientName || !infectionType || !roomId) {
    return { error: "Semua kolom wajib diisi." };
  }

  const normalizedDate = new Date(`${date}T00:00:00.000Z`);

  try {
    await prisma.infectionIncident.create({
      data: {
        date: normalizedDate,
        patientMrn,
        patientName,
        infectionType,
        description: description || null,
        roomId,
        createdById: session.user.id,
      },
    });
    revalidatePath("/infections");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Gagal menyimpan data infeksi." };
  }
}

export async function deleteInfection(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthenticated" };

  try {
    await prisma.infectionIncident.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/infections");
    return { success: true };
  } catch (e) {
    return { error: "Gagal menghapus data." };
  }
}

export async function getInfections({ month, roomId }: { month?: string; roomId?: string } = {}) {
  const now = new Date();
  const [year, monthNumber] = month ? month.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const startDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNumber, 0));

  try {
    const incidents = await prisma.infectionIncident.findMany({
      where: {
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
        ...(roomId ? { roomId } : {}),
      },
      include: { room: true, createdBy: { select: { name: true } } },
      orderBy: { date: "desc" },
    });

    const baseDenominatorResult = await prisma.sensusDetail.aggregate({
      _sum: { value: true },
      where: {
        sensusHarian: {
          date: { gte: startDate, lte: endDate },
          ...(roomId ? { roomId } : {}),
        },
        parameter: {
          isBaseDenominator: true,
          deletedAt: null,
        },
      },
    });

    const totalBaseDenominator = baseDenominatorResult._sum.value ?? 0;
    const ratePer1000 = totalBaseDenominator > 0 ? Math.round((incidents.length / totalBaseDenominator) * 1000) : 0;

    return {
      incidents,
      totalIncidents: incidents.length,
      totalBaseDenominator,
      ratePer1000,
    };
  } catch (e) {
    console.error("Failed to fetch infections:", e);
    return { incidents: [], totalIncidents: 0, totalBaseDenominator: 0, ratePer1000: 0 };
  }
}
