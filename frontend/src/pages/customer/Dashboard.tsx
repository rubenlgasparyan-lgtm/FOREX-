import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ExchangeRate, Transaction } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import RateCard from '../../components/RateCard';

export default function Dashboard() {
  const { user, t } = useAuth();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.rates.getAll().then(setRates).catch(console.error);
    api.transactions.getAll().then(r => setTransactions(r.slice(0, 5))).catch(console.error);
    const iv = setInterval(() => api.rates.getAll().then(setRates).catch(console.error), 5000);
    return () => clearInterval(iv);
  }, []);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { COMPLETED: 'badge-completed', PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };
    return <span className={map[s] || 'badge-pending'}>{s}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.welcome}, {user?.firstName}!</h1>
          <p className="text-gray-500 text-sm mt-1">Arcarius Currency Exchange Platform</p>
        </div>
        <Link to="/exchange" className="btn-primary">{t.exchange} &rarr;</Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">{t.liveRates}</h2>
        <RateCard rates={rates} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{t.recentTransactions}</h2>
          <Link to="/history" className="text-cyan-400 hover:text-cyan-300 text-sm">{t.history} &rarr;</Link>
        </div>
        <div className="card">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noTransactions}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2">{t.currency}</th>
                  <th className="text-right py-2">{t.amount}</th>
                  <th className="text-right py-2">{t.youGet}</th>
                  <th className="text-right py-2">{t.status}</th>
                  <th className="text-right py-2">{t.date}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-800/50">
                    <td className="py-3 text-white">{tx.fromCurrency} &rarr; {tx.toCurrency}</td>
                    <td className="py-3 text-right text-gray-300">{tx.fromAmount.toLocaleString()} {tx.fromCurrency}</td>
                    <td className="py-3 text-right text-cyan-400">{tx.toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tx.toCurrency}</td>
                    <td className="py-3 text-right">{statusBadge(tx.status)}</td>
                    <td className="py-3 text-right text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
