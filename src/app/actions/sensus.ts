"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type SensusDetailInput = {
  parameterId: string;
  value: number;
};

export async function saveSensusHarian(details: SensusDetailInput[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: "Unauthenticated" };
  }

  const roomId = session.user.roomId;
  if (!roomId) {
    return { error: "User tidak memiliki akses ruangan" };
  }

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const normalizedDate = new Date(`${dateStr}T00:00:00.000Z`);

  try {
    // TRANSAKSI PRISMA UNTUK INSERT/UPDATE MASTER-DETAIL SENSUS
    const result = await prisma.$transaction(async (tx) => {
      // 1. Dapatkan atau buat SensusHarian header
      let sensus = await tx.sensusHarian.findUnique({
        where: {
          date_roomId: {
            roomId: roomId,
            date: normalizedDate,
          },
        },
      });

      if (!sensus) {
        sensus = await tx.sensusHarian.create({
          data: {
            date: normalizedDate,
            roomId: roomId,
            createdById: session.user.id,
          },
        });
      }

      // 2. Bersihkan detail lama (agar data terupdate sempurna tanpa sisa)
      await tx.sensusDetail.deleteMany({
        where: { sensusHarianId: sensus.id }
      });

      // 3. Masukkan detail baru secara massal (createMany)
      const detailData = details.map(d => ({
        sensusHarianId: sensus!.id,
        parameterId: d.parameterId,
        value: d.value
      }));

      if (detailData.length > 0) {
        await tx.sensusDetail.createMany({
          data: detailData
        });
      }

      return sensus;
    });

    revalidatePath("/sensus/input");
    revalidatePath("/");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to save sensus transaction:", error);
    return { error: "Gagal menyimpan data ke database. Silakan coba lagi." };
  }
}

export async function getSensusToday() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.roomId) return null;

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const normalizedDate = new Date(`${dateStr}T00:00:00.000Z`);

  try {
    const sensus = await prisma.sensusHarian.findUnique({
      where: {
        date_roomId: {
          roomId: session.user.roomId,
          date: normalizedDate,
        },
      },
      include: {
        details: true
      }
    });
    
    if (!sensus) return [];

    return sensus.details.map(d => ({
      parameterId: d.parameterId,
      value: d.value
    }));
  } catch (e) {
    return [];
  }
}
