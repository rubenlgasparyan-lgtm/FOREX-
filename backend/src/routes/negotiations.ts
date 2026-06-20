import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken, async (req: AuthRequest, res) => {
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role);
  const negotiations = await prisma.negotiation.findMany({
    where: isAdmin ? {} : { userId: req.user!.id },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(negotiations);
});

router.post('/', verifyToken, async (req: AuthRequest, res) => {
  const { fromCurrency, toCurrency, amount, requestedRate, purpose } = req.body;
  const rateRecord = await prisma.exchangeRate.findUnique({
    where: { fromCurrency_toCurrency: { fromCurrency, toCurrency } },
  });
  if (!rateRecord) return res.status(404).json({ error: 'Rate not found' });
  const neg = await prisma.negotiation.create({
    data: { userId: req.user!.id, fromCurrency, toCurrency, amount, requestedRate, marketRate: rateRecord.sellRate, purpose },
  });
  return res.status(201).json(neg);
});

router.patch('/:id', verifyToken, requireAdmin, async (req: AuthRequest, res) => {
  const { status, adminNote, approvedRate } = req.body;
  const neg = await prisma.negotiation.update({
    where: { id: req.params.id },
    data: { status, adminNote, approvedRate: approvedRate ? parseFloat(approvedRate) : undefined },
  });
  if (status === 'APPROVED') {
    const rate = approvedRate ? parseFloat(approvedRate) : neg.requestedRate;
    await prisma.transaction.create({
      data: {
        userId: neg.userId, fromCurrency: neg.fromCurrency, toCurrency: neg.toCurrency,
        fromAmount: neg.amount, toAmount: neg.amount * rate, rate,
        status: 'COMPLETED', type: 'NEGOTIATED', negotiationId: neg.id,
      },
    });
  }
  return res.json(neg);
});

export default router;
