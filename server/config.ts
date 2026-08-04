import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isVercel = Boolean(process.env.VERCEL);
const defaultDbPath = isVercel ? '/tmp/territorio_mix_db.json' : './data/territorio_mix_db.json';

export const CONFIG = {
  port: 3000,
  jwtSecret: process.env.JWT_SECRET || 'territorio_mix_jwt_secret_key_2026_dev_secure',
  jwtExpiresIn: 86400, // 24 hours in seconds
  dbFilePath: path.resolve(process.env.DB_FILE_PATH || defaultDbPath),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
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
