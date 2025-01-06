-- CreateTable
CREATE TABLE "Odeme" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hastaId" INTEGER NOT NULL,
    "miktar" REAL NOT NULL,
    "tip" TEXT NOT NULL,
    "tarih" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notlar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Odeme_hastaId_fkey" FOREIGN KEY ("hastaId") REFERENCES "Hasta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hasta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tcKimlik" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "dogumTarihi" DATETIME NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "adres" TEXT,
    "alinanUcret" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Hasta" ("ad", "adres", "createdAt", "dogumTarihi", "email", "id", "soyad", "tcKimlik", "telefon", "updatedAt") SELECT "ad", "adres", "createdAt", "dogumTarihi", "email", "id", "soyad", "tcKimlik", "telefon", "updatedAt" FROM "Hasta";
DROP TABLE "Hasta";
ALTER TABLE "new_Hasta" RENAME TO "Hasta";
CREATE UNIQUE INDEX "Hasta_tcKimlik_key" ON "Hasta"("tcKimlik");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
