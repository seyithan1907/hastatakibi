import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const hastaId = parseInt(id);
    const body = await request.json();

    process.stdout.write(`Request body: ${JSON.stringify(body)}\n`);

    // İndirimli fiyatı kontrol et (null olabilir)
    const toplamIndirim = body.toplamIndirim === null ? null : parseFloat(body.toplamIndirim.toString());
    process.stdout.write(`İşlenmiş toplamIndirim: ${toplamIndirim}\n`);

    if (toplamIndirim !== null && (isNaN(toplamIndirim) || toplamIndirim < 0)) {
      return new Response(
        JSON.stringify({ error: 'Geçersiz indirimli fiyat' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    process.stdout.write(`Prisma update öncesi: ${JSON.stringify({ hastaId, toplamIndirim })}\n`);

    let hasta;
    try {
      // Hastayı güncelle
      hasta = await prisma.hasta.update({
        where: {
          id: hastaId,
        },
        data: {
          toplamIndirim: toplamIndirim,
        },
      });
      process.stdout.write(`Güncellenen hasta: ${JSON.stringify(hasta)}\n`);
    } catch (prismaError) {
      process.stdout.write(`Prisma hatası: ${prismaError instanceof Error ? prismaError.message : 'Bilinmeyen hata'}\n`);
      if (prismaError instanceof Error) {
        process.stdout.write(`Stack trace: ${prismaError.stack}\n`);
      }
      throw prismaError;
    }
    
    return new Response(
      JSON.stringify({ data: hasta }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Ana hata yakalama bloğu
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const errorStack = error instanceof Error ? error.stack : '';
    
    process.stdout.write(`Genel hata: ${errorMessage}\n`);
    if (errorStack) {
      process.stdout.write(`Stack trace: ${errorStack}\n`);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'İndirimli fiyat güncellenemedi', 
        details: errorMessage
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 