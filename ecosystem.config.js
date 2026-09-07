// PM2 süreç yöneticisi — İşKalkan (isgarantim.com)
// Uygulamayı SADECE 127.0.0.1:3000'e bağlar (dışarı kapalı; sadece nginx erişir).
// Kullanım (sunucuda): cd /var/www/isgarantim && pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "isgarantim",
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      cwd: "/var/www/isgarantim",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
