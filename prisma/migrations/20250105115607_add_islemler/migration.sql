-- CreateTable
CREATE TABLE "Islem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "fiyat" REAL NOT NULL,
    "aciklama" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TedaviPlani" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hastaId" INTEGER NOT NULL,
    "disNo" INTEGER NOT NULL,
    "islem" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'BEKLEMEDE',
    "notlar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TedaviPlani_hastaId_fkey" FOREIGN KEY ("hastaId") REFERENCES "Hasta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TedaviPlani_islem_fkey" FOREIGN KEY ("islem") REFERENCES "Islem" ("ad") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TedaviPlani" ("createdAt", "disNo", "durum", "hastaId", "id", "islem", "notlar", "updatedAt") SELECT "createdAt", "disNo", "durum", "hastaId", "id", "islem", "notlar", "updatedAt" FROM "TedaviPlani";
DROP TABLE "TedaviPlani";
ALTER TABLE "new_TedaviPlani" RENAME TO "TedaviPlani";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Islem_ad_key" ON "Islem"("ad");
