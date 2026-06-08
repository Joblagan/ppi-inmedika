INSERT INTO "MasterParameter" (id, nama, kategori, "isAktif", "isBaseDenominator", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'TOTAL PASIEN (HARI RAWAT)', 'TINDAKAN', true, true, now(), now()),
  (gen_random_uuid(), 'VENTILATOR (VAP)', 'DEVICE', true, false, now(), now()),
  (gen_random_uuid(), 'VENA SENTRAL (IAD)', 'DEVICE', true, false, now(), now()),
  (gen_random_uuid(), 'INFUS / KATETER PERIFER (PHLEBITIS)', 'DEVICE', true, false, now(), now()),
  (gen_random_uuid(), 'KATETER URINE (ISK)', 'DEVICE', true, false, now(), now()),
  (gen_random_uuid(), 'DAWER KATETER', 'DEVICE', true, false, now(), now()),
  (gen_random_uuid(), 'LUKA OPERASI (IDO)', 'TINDAKAN', true, false, now(), now())
ON CONFLICT (nama) DO NOTHING;
