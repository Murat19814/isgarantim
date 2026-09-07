module.exports = {
  apps: [
    {
      name: "isgarantim",
      script: "npm",
      args: "run start",
      cwd: "/var/www/isgarantim",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
