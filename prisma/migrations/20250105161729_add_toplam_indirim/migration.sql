/*
  Warnings:

  - You are about to drop the column `indirimli` on the `TedaviPlani` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hasta" ADD COLUMN "toplamIndirim" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TedaviPlani" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hastaId" INTEGER NOT NULL,
    "disNo" TEXT NOT NULL,
    "islem" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'Bekliyor',
    "fiyat" REAL NOT NULL DEFAULT 0,
    "odenen" REAL NOT NULL DEFAULT 0,
    "notlar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TedaviPlani_hastaId_fkey" FOREIGN KEY ("hastaId") REFERENCES "Hasta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TedaviPlani" ("createdAt", "disNo", "durum", "fiyat", "hastaId", "id", "islem", "notlar", "odenen", "updatedAt") SELECT "createdAt", "disNo", "durum", "fiyat", "hastaId", "id", "islem", "notlar", "odenen", "updatedAt" FROM "TedaviPlani";
DROP TABLE "TedaviPlani";
ALTER TABLE "new_TedaviPlani" RENAME TO "TedaviPlani";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
