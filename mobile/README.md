# İşKalkan — Mobil Uygulama (Expo)

React Native + Expo ile geliştirilen mobil istemci. Canlı API'ye
(`https://isgarantim.com`) bağlanır ve iş ilanlarını listeler.

## Kurulum

```bash
cd mobile
npm install
npx expo start
```

Telefonunda **Expo Go** uygulamasını açıp terminaldeki QR kodu okut.

## Yapılandırma

API adresi `app.json` → `expo.extra.apiBaseUrl` içinde tanımlıdır.

- **Canlı:** `https://isgarantim.com` (varsayılan)
- **Yerel geliştirme:** Bilgisayarının LAN IP'sini yaz, ör.
  `http://192.168.1.20:3000` (telefon `localhost`'a erişemez).

## Mevcut ekranlar

- İş ilanları listesi + arama + yenileme (canlı API'den)

## Yol haritası (sonraki adımlar)

- [ ] Giriş / kayıt (NextAuth credentials → token akışı)
- [ ] İlan detayı + başvuru
- [ ] CV görüntüleme/düzenleme
- [ ] Hizmet talebi oluşturma + emanet takibi
- [ ] Push bildirimleri (expo-notifications)
- [ ] EAS Build ile mağaza paketleri (App Store / Play)

## Notlar

- `mobile/node_modules` ve `mobile/.expo` git'e dahil değildir (kök `.gitignore`).
