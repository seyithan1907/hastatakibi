-- Hasta tablosu
CREATE TABLE "Hasta" (
    "id" SERIAL PRIMARY KEY,
    "tcKimlik" TEXT UNIQUE NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "dogumTarihi" TIMESTAMP NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "adres" TEXT,
    "alinanUcret" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "toplamIndirim" DOUBLE PRECISION,
    "doktorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- TedaviPlani tablosu
CREATE TABLE "TedaviPlani" (
    "id" SERIAL PRIMARY KEY,
    "hastaId" INTEGER NOT NULL,
    "disNo" TEXT NOT NULL,
    "islem" TEXT NOT NULL,
    "durum" TEXT DEFAULT 'Bekliyor' NOT NULL,
    "fiyat" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "odenen" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "notlar" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("hastaId") REFERENCES "Hasta"("id") ON DELETE CASCADE
);

-- Islem tablosu
CREATE TABLE "Islem" (
    "id" SERIAL PRIMARY KEY,
    "ad" TEXT NOT NULL,
    "fiyat" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "aktif" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Odeme tablosu
CREATE TABLE "Odeme" (
    "id" SERIAL PRIMARY KEY,
    "hastaId" INTEGER NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    "tip" TEXT NOT NULL,
    "tarih" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "notlar" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("hastaId") REFERENCES "Hasta"("id") ON DELETE CASCADE
);

-- User tablosu
CREATE TABLE "User" (
    "id" SERIAL PRIMARY KEY,
    "username" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "aktif" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Foreign key constraint for Hasta -> User
ALTER TABLE "Hasta" ADD FOREIGN KEY ("doktorId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Trigger'lar
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hasta_updated_at
    BEFORE UPDATE ON "Hasta"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tedavi_plani_updated_at
    BEFORE UPDATE ON "TedaviPlani"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_islem_updated_at
    BEFORE UPDATE ON "Islem"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_odeme_updated_at
    BEFORE UPDATE ON "Odeme"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at(); 