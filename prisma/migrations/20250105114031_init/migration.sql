-- CreateTable
CREATE TABLE "Hasta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tcKimlik" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "dogumTarihi" DATETIME NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "adres" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Randevu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hastaId" INTEGER NOT NULL,
    "tarih" DATETIME NOT NULL,
    "notlar" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'BEKLEMEDE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Randevu_hastaId_fkey" FOREIGN KEY ("hastaId") REFERENCES "Hasta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Hasta_tcKimlik_key" ON "Hasta"("tcKimlik");
