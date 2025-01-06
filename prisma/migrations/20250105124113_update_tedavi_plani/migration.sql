/*
  Warnings:

  - You are about to drop the column `fiyat` on the `TedaviPlani` table. All the data in the column will be lost.
  - You are about to drop the column `islemAdi` on the `TedaviPlani` table. All the data in the column will be lost.
  - You are about to drop the column `islemId` on the `TedaviPlani` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TedaviPlani" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hastaId" INTEGER NOT NULL,
    "disNo" TEXT NOT NULL,
    "islem" TEXT NOT NULL,
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
