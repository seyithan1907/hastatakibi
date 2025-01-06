import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const hasta = await prisma.hasta.findUnique({
      where: { id }
    });

    if (!hasta) {
      return NextResponse.json(
        { error: "Hasta bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(hasta);
  } catch (error) {
    console.error("Hasta detayları getirilirken hata:", error);
    return NextResponse.json(
      { error: "Hasta detayları getirilemedi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Önce hastaya ait tedavi planlarını sil
    await prisma.tedaviPlani.deleteMany({
      where: { hastaId: id }
    });

    // Sonra hastayı sil
    const hasta = await prisma.hasta.delete({
      where: { id }
    });

    return NextResponse.json(hasta);
  } catch (error) {
    console.error("Hasta silinirken hata:", error);
    return NextResponse.json(
      { error: "Hasta silinemedi" },
      { status: 500 }
    );
  }
} 