import { useEffect, useState } from 'react';
import { api, Transaction, Negotiation } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function statusBadge(s: string) {
  const map: Record<string, string> = {
    COMPLETED: 'badge-completed', PENDING: 'badge-pending', APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected', COUNTER_OFFERED: 'badge-counter', CANCELLED: 'badge-rejected',
  };
  return <span className={map[s] || 'badge-pending'}>{s.replace('_', ' ')}</span>;
}

export default function History() {
  const { t } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [tab, setTab] = useState<'tx' | 'neg'>('tx');

  const load = () => {
    api.transactions.getAll().then(setTransactions);
    api.negotiations.getAll().then(setNegotiations);
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t.history}</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('tx')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'tx' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          Transactions ({transactions.length})
        </button>
        <button onClick={() => setTab('neg')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'neg' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          {t.negotiations} ({negotiations.length})
        </button>
      </div>

      {tab === 'tx' && (
        <div className="card">
          {transactions.length === 0 ? <p className="text-gray-500 text-center py-8">{t.noTransactions}</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2">{t.currency}</th><th className="text-right py-2">{t.amount}</th>
                <th className="text-right py-2">{t.youGet}</th><th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Type</th><th className="text-right py-2">{t.status}</th>
                <th className="text-right py-2">{t.date}</th>
              </tr></thead>
              <tbody>{transactions.map(tx => (
                <tr key={tx.id} className="border-b border-gray-800/50">
                  <td className="py-3 text-white">{tx.fromCurrency} &rarr; {tx.toCurrency}</td>
                  <td className="py-3 text-right">{tx.fromAmount.toLocaleString()} {tx.fromCurrency}</td>
                  <td className="py-3 text-right text-cyan-400">{tx.toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {tx.toCurrency}</td>
                  <td className="py-3 text-right text-gray-400">{tx.rate}</td>
                  <td className="py-3 text-right"><span className="text-gray-500 text-xs">{tx.type}</span></td>
                  <td className="py-3 text-right">{statusBadge(tx.status)}</td>
                  <td className="py-3 text-right text-gray-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'neg' && (
        <div className="card">
          {negotiations.length === 0 ? <p className="text-gray-500 text-center py-8">{t.noNegotiations}</p> : (
            <table className="w-full text-sm">
              <thead><tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2">{t.currency}</th><th className="text-right py-2">{t.amount}</th>
                <th className="text-right py-2">{t.marketRate}</th><th className="text-right py-2">{t.requestedRate}</th>
                <th className="text-right py-2">{t.approvedRate}</th><th className="text-right py-2">{t.purpose}</th>
                <th className="text-right py-2">{t.status}</th><th className="text-right py-2">{t.date}</th>
              </tr></thead>
              <tbody>{negotiations.map(neg => (
                <tr key={neg.id} className="border-b border-gray-800/50">
                  <td className="py-3 text-white">{neg.fromCurrency} &rarr; {neg.toCurrency}</td>
                  <td className="py-3 text-right">{neg.amount.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-400">{neg.marketRate}</td>
                  <td className="py-3 text-right text-amber-400">{neg.requestedRate}</td>
                  <td className="py-3 text-right text-emerald-400">{neg.approvedRate || '—'}</td>
                  <td className="py-3 text-right text-gray-500 text-xs">{neg.purpose}</td>
                  <td className="py-3 text-right">{statusBadge(neg.status)}</td>
                  <td className="py-3 text-right text-gray-500 text-xs">{new Date(neg.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
