-- Admin kullanıcısı oluşturma
INSERT INTO "User" (
    "username",
    "password",
    "role",
    "ad",
    "soyad",
    "email",
    "aktif"
) VALUES (
    'seyithan1907',
    '$2b$10$zibPUgpEeLgYVSzLxW2Ueu9ORiDfFGdFgOZx9Sj5KVE9Ahwr9YKTi',
    'admin',
    'Hüseyin Seyithan',
    'Yaşar',
    'seyithan1996@gmail.com',
    true
); 