#!/usr/bin/env bash
# İşKalkan tek komutluk güvenli deploy.
# Kullanım: sunucuda  ->  cd /var/www/isgarantim && bash deploy.sh
# Neden: next build her seferinde yeni BUILD_ID üretir; eski next-server süreci
# ayakta kalırsa silinmiş chunk'ları servis eder -> stilsiz/bayat sayfa.
# Bu script build BİTTİKTEN sonra eski süreci zorla öldürüp taze başlatır.

set -euo pipefail
cd /var/www/isgarantim

echo ">>> [1/4] Kod cekiliyor (git pull --rebase)..."
git checkout -- package-lock.json 2>/dev/null || true
git pull --rebase

echo ">>> [2/4] Production build (prisma generate && next build)..."
npm run build

echo ">>> [3/4] Eski surecler zorla durduruluyor (PM2 daemon dahil)..."
pkill -9 -f "next-server"   2>/dev/null || true
pkill -9 -f "npm run start" 2>/dev/null || true
pkill -9 -f "PM2 v"         2>/dev/null || true
sleep 2

echo ">>> [4/4] Taze baslatiliyor (fork mode)..."
pm2 start npm --name isgarantim -- run start
pm2 save

sleep 6
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/nasil-calisir || echo "000")
echo ">>> Yerel kontrol (/nasil-calisir): HTTP $CODE"
echo ">>> Bitti. Tarayicida Ctrl+Shift+R yap."
