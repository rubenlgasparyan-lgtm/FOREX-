import { Router } from 'express';
import prisma from '../prisma';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(verifyToken, requireAdmin);

router.get('/dashboard', async (_, res) => {
  const [totalUsers, pendingNegotiations, totalTransactions, recentTransactions] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.negotiation.count({ where: { status: 'PENDING' } }),
    prisma.transaction.count(),
    prisma.transaction.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true } } } }),
  ]);
  const volumeAgg = await prisma.transaction.aggregate({ _sum: { fromAmount: true } });
  return res.json({ totalUsers, pendingNegotiations, totalTransactions, totalVolume: volumeAgg._sum.fromAmount || 0, recentTransactions });
});

router.get('/users', async (_, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(users);
});

export default router;
