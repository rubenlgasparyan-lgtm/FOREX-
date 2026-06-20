import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import ratesRoutes from './routes/rates';
import transactionsRoutes from './routes/transactions';
import negotiationsRoutes from './routes/negotiations';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/negotiations', negotiationsRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Arcarius API running on port ${PORT}`));
