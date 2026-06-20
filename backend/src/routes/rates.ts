import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_, res) => {
  const rates = await prisma.exchangeRate.findMany({ orderBy: { fromCurrency: 'asc' } });
  return res.json(rates);
});

router.put('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res) => {
  const { buyRate, sellRate } = req.body;
  const rate = await prisma.exchangeRate.update({
    where: { id: req.params.id },
    data: { buyRate: parseFloat(buyRate), sellRate: parseFloat(sellRate), updatedBy: req.user!.id },
  });
  return res.json(rate);
});

export default router;
