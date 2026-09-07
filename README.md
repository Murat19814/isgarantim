# İşKalkan · isgarantim.com

> **İşin de ödemen de güvende.**
> Profesyonel hizmet & iş bulma platformu. Doğrulanmış ustalardan güvenle hizmet al,
> hizmet ver, iş ara veya iş ilanı yayınla. Ödeme, iş tamamlanana kadar emanette (escrow) bekler.

Bu depo web (Next.js) uygulamasını içerir. Mobil uygulama (React Native + Expo) `mobile/` altında Faz 7'de eklenecektir.

## Teknoloji

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (lacivert / zümrüt / beyaz / altın tasarım sistemi)
- **PostgreSQL** + **Prisma ORM**
- **NextAuth** (kimlik doğrulama — Faz 2)
- Ödeme: lisanslı ödeme kuruluşu **pazaryeri/emanet** altyapısı (iyzico Marketplace / PayTR — Faz 4)

## Renk paleti

| Renk | Kullanım | Kod |
| --- | --- | --- |
| Lacivert (navy) | Ana marka, metin, koyu bölümler | `#0a1730` |
| Zümrüt (emerald) | Aksiyon, güven, butonlar | `#059669` |
| Beyaz | Arka plan | `#ffffff` |
| Altın (gold) | Premium detaylar, vurgular | `#d4af37` |

---

## Kurulum (terminal hazır olduğunda)

> Not: Proje dosyaları elle oluşturuldu. `node_modules` henüz kurulmadı.
> Aşağıdaki komutları proje kökünde çalıştır.

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Ortam değişkenlerini ayarla
copy .env.example .env      # Windows (PowerShell'de: Copy-Item .env.example .env)
# .env içindeki DATABASE_URL ve diğer değerleri doldur

# 3) PostgreSQL veritabanını hazırla (yerelde Postgres kurulu olmalı)
#    Docker ile hızlı başlatma:
#    docker run --name isgarantim-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=isgarantim -p 5432:5432 -d postgres:16

# 4) Şemayı veritabanına uygula
npx prisma migrate dev --name init

# 5) Kategorileri tohumla
npm run db:seed

# 6) Geliştirme sunucusunu başlat
npm run dev
# → http://localhost:3000
```

### Faydalı komutlar

```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Prod derleme (prisma generate + next build)
npm run db:studio    # Prisma Studio (veritabanı arayüzü)
npm run db:migrate   # Yeni migration
npm run test         # Testler (Vitest)
```

---

## Proje yapısı

```
isgarantim/
├─ prisma/
│  ├─ schema.prisma      # Tüm iş varlıkları (kullanıcı, kontör/escrow, teklif, ödeme, CV, iş ilanı...)
│  └─ seed.ts            # Kategori tohumlama
├─ src/
│  ├─ app/               # Next.js App Router sayfaları
│  │  ├─ layout.tsx
│  │  ├─ page.tsx        # Ana sayfa (slogan, kartlar, kategoriler, ustalar, ilanlar)
│  │  └─ (hizmet-al, hizmet-ver, is-ara, is-ilani-ver, giris, kayit...)
│  ├─ components/        # Navbar, Hero, EntryCards, Categories, HowItWorks, ...
│  └─ lib/               # constants, prisma client, utils, mock-data
├─ tailwind.config.ts
└─ .env.example
```

---

## Yol haritası (fazlar)

- [x] **Faz 1 — Temel & Ana sayfa**: Proje iskeleti, tasarım sistemi, ana sayfa (slogan, 4 kart, arama, kategoriler, nasıl çalışır, ustalar, ilanlar), Prisma şeması.
- [ ] **Faz 2 — Üyelik & Roller**: Telefon + e-posta doğrulamalı kayıt/giriş, tek hesapta çoklu rol, rol bazlı kontrol panelleri.
- [ ] **Faz 3 — Hizmet talebi & Kontör**: Çok adımlı talep formu, kontör satın alma, teklif verme, kontör bekletme/kesme/iade mantığı, teklif karşılaştırma.
- [ ] **Faz 4 — Emanet ödeme & Mesajlaşma**: Pazaryeri escrow entegrasyonu, iş tamamlama/3 gün onay/itiraz akışı, platform içi mesajlaşma (dosya/foto, iletişim gizleme).
- [ ] **Faz 5 — CV & İş ilanları**: CV oluşturucu + PDF, firma kurumsal hesap, ilan paketleri/abonelik, aday filtreleme & görüşme daveti.
- [ ] **Faz 6 — Admin paneli**: Kullanıcı, teklif, talep, kontör, ödeme, iade, ilan, firma, CV, şikayet ve anlaşmazlık yönetimi; kategori yönetimi.
- [ ] **Faz 7 — Mobil**: React Native + Expo (Android/iOS), aynı API'ye bağlı.
- [ ] **Faz 8 — Güvenlik & Testler**: Güvenlik denetimi (yetkilendirme, ödeme, veri erişimi), otomatik testler.

---

## Kontör (escrow) mantığı — özet

1. Hizmet veren kontör satın alır (ör. 1 teklif = **100 kontör**).
2. Teklif verildiğinde kontör **beklemeye** alınır (`heldBalance`).
3. İşi **kazanan** kişinin kontörü **kesin kesilir** (`CAPTURE`).
4. **Kazanamayan** diğerlerinin kontörü **otomatik iade** edilir (`REFUND`).

## Ödeme (escrow) mantığı — özet

1. Müşteri hizmet vereni seçer ve ücreti platform üzerinden öder.
2. Ödeme lisanslı kuruluşun **emanet** hesabında bekletilir (`HELD`).
3. Hizmet veren "İşi tamamladım" der, foto/belge yükler.
4. Müşteriye **3 gün** onay süresi verilir; onaylarsa ödeme aktarılır (`RELEASED`).
5. İtiraz açılırsa ödeme **durdurulur** (`DISPUTED`), admin çözer.
```
