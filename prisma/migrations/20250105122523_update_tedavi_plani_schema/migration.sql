/*
  Warnings:

  - You are about to drop the `Randevu` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fiyat` to the `TedaviPlani` table without a default value. This is not possible if the table is not empty.
  - Added the required column `islemAdi` to the `TedaviPlani` table without a default value. This is not possible if the table is not empty.
  - Added the required column `islemId` to the `TedaviPlani` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Islem_ad_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Randevu";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TedaviPlani" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hastaId" INTEGER NOT NULL,
    "disNo" TEXT NOT NULL,
    "islem" TEXT NOT NULL,
    "islemId" INTEGER NOT NULL,
    "islemAdi" TEXT NOT NULL,
    "fiyat" REAL NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Bekliyor',
    "notlar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TedaviPlani_hastaId_fkey" FOREIGN KEY ("hastaId") REFERENCES "Hasta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TedaviPlani" ("createdAt", "disNo", "durum", "hastaId", "id", "islem", "notlar", "updatedAt") SELECT "createdAt", "disNo", "durum", "hastaId", "id", "islem", "notlar", "updatedAt" FROM "TedaviPlani";
DROP TABLE "TedaviPlani";
ALTER TABLE "new_TedaviPlani" RENAME TO "TedaviPlani";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
