import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryMonth = searchParams.get("month") ? parseInt(searchParams.get("month") as string) : new Date().getMonth() + 1;
  const queryYear = searchParams.get("year") ? parseInt(searchParams.get("year") as string) : new Date().getFullYear();
  const roomId = searchParams.get("roomId");

  const monthStart = new Date(Date.UTC(queryYear, queryMonth - 1, 1));
  const monthEnd = new Date(Date.UTC(queryYear, queryMonth, 0));

  const roomFilter = roomId ? { roomId } : {};

  const [infections, audits, sensus] = await Promise.all([
    prisma.infectionIncident.findMany({
      where: { deletedAt: null, date: { gte: monthStart, lte: monthEnd }, ...roomFilter },
      include: { room: true }
    }),
    prisma.auditKepatuhan.findMany({
      where: { deletedAt: null, date: { gte: monthStart, lte: monthEnd }, ...roomFilter },
      include: { room: true }
    }),
    prisma.sensusHarian.findMany({
      where: { deletedAt: null, date: { gte: monthStart, lte: monthEnd }, ...roomFilter, status: 'APPROVED' },
      include: { room: true, details: { include: { parameter: true } } }
    }),
  ]);

  const wb = XLSX.utils.book_new();

  // Sheet 1: Insiden HAIs
  const haisData = infections.map(i => ({
    Tanggal: i.date.toLocaleDateString('id-ID'),
    Ruangan: i.room?.name || '-',
    "No RM": i.patientMrn,
    "Nama Pasien": i.patientName,
    "Jenis Infeksi": i.infectionType,
    Keterangan: i.description || '-'
  }));
  const haisWs = XLSX.utils.json_to_sheet(haisData.length ? haisData : [{ "Message": "Tidak ada data insiden" }]);
  XLSX.utils.book_append_sheet(wb, haisWs, "Insiden HAIs");

  // Sheet 2: Kepatuhan Audit
  const auditData = audits.map(a => ({
    Tanggal: a.date.toLocaleDateString('id-ID'),
    Ruangan: a.room?.name || '-',
    "Jenis Audit": a.auditType,
    "Peluang (Denominator)": a.peluang,
    "Tindakan Benar (Numerator)": a.tindakanBenar,
    "Tingkat Kepatuhan (%)": a.peluang > 0 ? Math.round((a.tindakanBenar / a.peluang) * 100) : 0,
    Catatan: a.notes || '-'
  }));
  const auditWs = XLSX.utils.json_to_sheet(auditData.length ? auditData : [{ "Message": "Tidak ada data audit" }]);
  XLSX.utils.book_append_sheet(wb, auditWs, "Audit Kepatuhan");

  // Sheet 3: Rekap Sensus Harian
  const sensusData = sensus.flatMap(s => 
    s.details.map(d => ({
      Tanggal: s.date.toLocaleDateString('id-ID'),
      Ruangan: s.room?.name || '-',
      Parameter: d.parameter.nama,
      "Jumlah (Value)": d.value
    }))
  );
  const sensusWs = XLSX.utils.json_to_sheet(sensusData.length ? sensusData : [{ "Message": "Tidak ada data sensus" }]);
  XLSX.utils.book_append_sheet(wb, sensusWs, "Sensus Harian");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const response = new NextResponse(buf);
  response.headers.set("Content-Disposition", `attachment; filename="Laporan_PPI_${queryMonth}_${queryYear}.xlsx"`);
  response.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

  return response;
}
