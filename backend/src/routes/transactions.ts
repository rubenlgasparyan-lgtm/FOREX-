import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(transactions);
});

router.post('/', verifyToken, async (req: AuthRequest, res) => {
  const { fromCurrency, toCurrency, fromAmount } = req.body;
  const rateRecord = await prisma.exchangeRate.findUnique({
    where: { fromCurrency_toCurrency: { fromCurrency, toCurrency } },
  });
  if (!rateRecord) return res.status(404).json({ error: 'Rate not found' });
  const rate = rateRecord.sellRate;
  const toAmount = fromAmount * rate;
  const tx = await prisma.transaction.create({
    data: { userId: req.user!.id, fromCurrency, toCurrency, fromAmount, toAmount, rate, status: 'COMPLETED', type: 'STANDARD' },
  });
  return res.status(201).json(tx);
});

export default router;
