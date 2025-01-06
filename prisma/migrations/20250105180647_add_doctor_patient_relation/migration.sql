/*
  Warnings:

  - Added the required column `doktorId` to the `Hasta` table without a default value. This is not possible if the table is not empty.

*/
-- Önce doktor kullanıcısını oluştur
INSERT INTO User (username, password, role, ad, soyad, email, aktif, createdAt, updatedAt)
SELECT 'doktor', '$2b$10$K7L6LxBWyZ4qYz4Z8B6Z4O6Z6Z4O6Z6Z4O6Z6Z4O6Z6Z4O6Z6Z4O', 'doctor', 'Ahmet', 'Yılmaz', 'doktor@example.com', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM User WHERE username = 'doktor');

-- Geçici tablo oluştur
CREATE TABLE "_TempHasta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tcKimlik" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "dogumTarihi" DATETIME NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "adres" TEXT,
    "alinanUcret" REAL NOT NULL DEFAULT 0,
    "toplamIndirim" REAL,
    "doktorId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Verileri geçici tabloya kopyala
INSERT INTO "_TempHasta" 
SELECT 
    h.id, 
    h.tcKimlik, 
    h.ad, 
    h.soyad, 
    h.dogumTarihi, 
    h.telefon, 
    h.email, 
    h.adres, 
    h.alinanUcret, 
    h.toplamIndirim,
    (SELECT id FROM User WHERE username = 'doktor'),
    h.createdAt, 
    h.updatedAt
FROM "Hasta" h;

-- Eski tabloyu sil
DROP TABLE "Hasta";

-- Geçici tabloyu yeniden adlandır
ALTER TABLE "_TempHasta" RENAME TO "Hasta";

-- İndeksleri ekle
CREATE UNIQUE INDEX "Hasta_tcKimlik_key" ON "Hasta"("tcKimlik");
CREATE INDEX "Hasta_doktorId_idx" ON "Hasta"("doktorId");
