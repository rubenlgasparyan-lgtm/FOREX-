import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, AdminDashboard as ADash } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { t } = useAuth();
  const [data, setData] = useState<ADash | null>(null);

  useEffect(() => { api.admin.dashboard().then(setData); }, []);

  const stats = data ? [
    { label: t.totalUsers, value: data.totalUsers, color: 'text-cyan-400' },
    { label: t.pendingNeg, value: data.pendingNegotiations, color: 'text-amber-400' },
    { label: t.totalTx, value: data.totalTransactions, color: 'text-emerald-400' },
    { label: t.totalVolume, value: `${data.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-purple-400' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin {t.dashboard}</h1>
        <div className="flex gap-3">
          <Link to="/admin/rates" className="btn-primary text-sm">{t.rates}</Link>
          <Link to="/admin/negotiations" className="btn-secondary text-sm">{t.negotiations}</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {data?.recentTransactions && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">{t.recentTransactions}</h2>
          <div className="card">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2">Customer</th><th className="text-left py-2">{t.currency}</th>
                <th className="text-right py-2">{t.amount}</th><th className="text-right py-2">{t.status}</th>
                <th className="text-right py-2">{t.date}</th>
              </tr></thead>
              <tbody>{data.recentTransactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-gray-800/50">
                  <td className="py-3 text-gray-300">{tx.user?.firstName} {tx.user?.lastName}</td>
                  <td className="py-3 text-white">{tx.fromCurrency} &rarr; {tx.toCurrency}</td>
                  <td className="py-3 text-right">{tx.fromAmount.toLocaleString()} {tx.fromCurrency}</td>
                  <td className="py-3 text-right"><span className="badge-completed">{tx.status}</span></td>
                  <td className="py-3 text-right text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
