import express from 'express';
import authRoutes from '../server/routes/authRoutes.ts';
import recordsRoutes from '../server/routes/recordsRoutes.ts';
import adminRoutes from '../server/routes/adminRoutes.ts';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
