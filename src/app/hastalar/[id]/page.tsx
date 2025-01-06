import { Suspense } from "react";
import HastaDetayClient from "./HastaDetayClient";

export default async function HastaDetay({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  return (
    <Suspense fallback={<div className="text-center p-6">Yükleniyor...</div>}>
      <HastaDetayClient id={id} />
    </Suspense>
  );
} 