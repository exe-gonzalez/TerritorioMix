import express from 'express';
import authRoutes from '../server/routes/authRoutes';
import recordsRoutes from '../server/routes/recordsRoutes';
import adminRoutes from '../server/routes/adminRoutes';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Handle routes with both /api prefix and without /api prefix for Vercel Serverless Function rewrites
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/records', recordsRoutes);
app.use('/records', recordsRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.get(['/api/health', '/health'], (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global error handling middleware for Vercel Serverless Function
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Vercel API Serverless Error:', err);
  res.status(500).json({ error: err?.message || 'Error interno del servidor.' });
});

export default app;
