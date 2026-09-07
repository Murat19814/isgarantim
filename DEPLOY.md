# İşKalkan — OVH (Debian 12) Sunucu Deploy Rehberi

> Bu sunucuda zaten **blc-tool** (Flask/gunicorn + nginx) çalışıyor.
> Aşağıdaki adımlar isgarantim'i **izole** kurar: ayrı klasör, ayrı port (127.0.0.1:3000),
> ayrı PM2 uygulaması, ayrı nginx bloğu. blc-tool'a **dokunulmaz**.

Sunucu: `root@57.129.73.103` · DB: Neon (Frankfurt).

---

## 0) DNS (domaini aldığın panelde)
`isgarantim.com` için:
- **A** kaydı: `@` → `57.129.73.103`
- **A** kaydı: `www` → `57.129.73.103`  (veya CNAME `www` → `isgarantim.com`)

Yayılması 5 dk – birkaç saat sürebilir. Kontrol: `ping isgarantim.com` → 57.129.73.103 dönmeli.

---

## 1) Node.js 20 + PM2 + git (sunucuda, root)
```bash
apt-get update
apt-get install -y curl git
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm i -g pm2
node -v && npm -v
```

## 2) Projeyi çek
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Murat19814/isgarantim.git
cd isgarantim
npm install
```

## 3) Ortam değişkenleri (.env)
```bash
nano /var/www/isgarantim/.env
```
İçine (Neon bilgilerinle):
```
DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://...neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="https://isgarantim.com"
NEXTAUTH_SECRET="uzun-rastgele-secret"
```
Kaydet: `Ctrl+O`, `Enter`, `Ctrl+X`.

## 4) Veritabanı + build
```bash
cd /var/www/isgarantim
npx prisma migrate deploy
npx prisma db seed   # kategoriler (bir kez)
npm run build
```

## 5) PM2 ile başlat (127.0.0.1:3000)
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # çıktıdaki komutu kopyalayıp çalıştır (boot'ta otomatik başlatma)
pm2 logs isgarantim --lines 30   # hata var mı bak
```

## 6) Nginx bloğu (blc-tool'a dokunmadan)
```bash
cp /var/www/isgarantim/deploy/nginx-isgarantim.conf /etc/nginx/sites-available/isgarantim
ln -s /etc/nginx/sites-available/isgarantim /etc/nginx/sites-enabled/isgarantim
nginx -t
systemctl reload nginx
```

## 7) SSL (Let's Encrypt) — DNS yayıldıktan sonra
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d isgarantim.com -d www.isgarantim.com
```
Sonra `https://isgarantim.com` açılır. 🎉

---

## Güncelleme (sonraki her push'ta)
```bash
cd /var/www/isgarantim
git pull
npm install
npx prisma migrate deploy
npm run build
pm2 restart isgarantim
```

## Sorun giderme
- App açılmıyor: `pm2 logs isgarantim`
- Nginx hatası: `nginx -t` ve `tail -f /var/log/nginx/error.log`
- Port çakışması: `ss -tlnp | grep 3000`
- blc-tool etkilenmez; sadece `isgarantim` PM2 uygulamasını ve `isgarantim` nginx bloğunu yönetiyoruz.
