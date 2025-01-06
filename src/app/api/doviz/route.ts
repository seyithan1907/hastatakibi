import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/TRY");
    const data = await response.json();
    
    // USD ve EUR kurlarını hesapla (1 TL kaç dolar/euro ediyor)
    const rates = {
      USD: 1 / data.rates.USD,
      EUR: 1 / data.rates.EUR,
    };

    return NextResponse.json(rates);
  } catch (error) {
    console.error("Döviz kurları alınırken hata:", error);
    return NextResponse.json(
      { error: "Döviz kurları alınamadı" },
      { status: 500 }
    );
  }
} 