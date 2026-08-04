import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isVercel = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_BUILDER ||
  process.env.AWS_SERVERLESS ||
  process.env.LAMBDA_TASK_ROOT
);

export const CONFIG = {
  port: 3000,
  jwtSecret: process.env.JWT_SECRET || 'territorio_mix_jwt_secret_key_2026_dev_secure',
  jwtExpiresIn: '24h',
  dbFilePath: isVercel
    ? '/tmp/territorio_mix_db.json'
    : process.env.DB_FILE_PATH
    ? path.resolve(process.env.DB_FILE_PATH)
    : path.resolve('./data/territorio_mix_db.json'),
  appUrl: process.env.APP_URL || 'https://territorio-mix.vercel.app',
  seedAdmin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
  seedUser: {
    email: process.env.USER_EMAIL || '',
    password: process.env.USER_PASSWORD || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'TerritorioMix <notificaciones@territoriomix.org>',
  },
};

