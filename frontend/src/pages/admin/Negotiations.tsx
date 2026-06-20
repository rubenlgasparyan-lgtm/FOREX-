import { useEffect, useState } from 'react';
import { api, Negotiation } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected', COUNTER_OFFERED: 'badge-counter' };
  return <span className={map[s] || 'badge-pending'}>{s.replace('_', ' ')}</span>;
}

export default function Negotiations() {
  const { t } = useAuth();
  const [negs, setNegs] = useState<Negotiation[]>([]);
  const [countering, setCountering] = useState<Record<string, { rate: string; note: string }>>({});
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('PENDING');

  const load = () => api.negotiations.getAll().then(setNegs);
  useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv); }, []);

  const act = async (id: string, status: string, approvedRate?: number, adminNote?: string) => {
    await api.negotiations.update(id, { status, approvedRate, adminNote });
    load();
    setCountering(c => { const n = { ...c }; delete n[id]; return n; });
  };

  const displayed = negs.filter(n => filter === 'ALL' || n.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t.negotiations}</h1>
        <div className="flex gap-2">
          {(['PENDING', 'ALL'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {displayed.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">{t.noNegotiations}</div>
        ) : displayed.map(neg => {
          const co = countering[neg.id];
          const diff = ((neg.requestedRate - neg.marketRate) / neg.marketRate * 100).toFixed(2);
          const favorable = neg.requestedRate < neg.marketRate;
          return (
            <div key={neg.id} className="card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{neg.user?.firstName} {neg.user?.lastName}</span>
                    <span className="text-gray-500 text-sm">{neg.user?.email}</span>
                    <StatusBadge s={neg.status} />
                  </div>
                  <div className="text-gray-500 text-xs mt-1">{new Date(neg.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{neg.amount.toLocaleString()} {neg.fromCurrency}</div>
                  <div className="text-gray-500 text-sm">&rarr; {neg.toCurrency}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-gray-800/50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-gray-500 text-xs mb-1">{t.marketRate}</div>
                  <div className="text-cyan-400 font-semibold">{neg.marketRate}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs mb-1">{t.requestedRate}</div>
                  <div className={`font-semibold ${favorable ? 'text-emerald-400' : 'text-amber-400'}`}>{neg.requestedRate}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs mb-1">Difference</div>
                  <div className={`font-semibold text-sm ${favorable ? 'text-emerald-400' : 'text-red-400'}`}>{favorable ? '' : '+'}{diff}%</div>
                </div>
              </div>

              {neg.purpose && <div className="text-sm"><span className="text-gray-500">{t.purpose}: </span><span className="text-gray-300">{neg.purpose}</span></div>}
              {neg.adminNote && <div className="text-sm"><span className="text-gray-500">{t.adminNote}: </span><span className="text-gray-300">{neg.adminNote}</span></div>}
              {neg.approvedRate && <div className="text-sm"><span className="text-gray-500">{t.approvedRate}: </span><span className="text-emerald-400 font-semibold">{neg.approvedRate}</span></div>}

              {neg.status === 'PENDING' && (
                <div className="space-y-3 border-t border-gray-800 pt-4">
                  {co ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">{t.approvedRate}</label>
                          <input type="number" value={co.rate} onChange={e => setCountering(c => ({ ...c, [neg.id]: { ...c[neg.id], rate: e.target.value } }))} className="input text-sm py-2" step="0.01" />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">{t.adminNote}</label>
                          <input type="text" value={co.note} onChange={e => setCountering(c => ({ ...c, [neg.id]: { ...c[neg.id], note: e.target.value } }))} className="input text-sm py-2" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => act(neg.id, 'COUNTER_OFFERED', parseFloat(co.rate), co.note)} className="btn-secondary text-sm py-2">Send Counter Offer</button>
                        <button onClick={() => act(neg.id, 'APPROVED', parseFloat(co.rate), co.note)} className="btn-success text-sm py-2">{t.approve} at {co.rate}</button>
                        <button onClick={() => setCountering(c => { const n = { ...c }; delete n[neg.id]; return n; })} className="text-gray-500 hover:text-white text-sm">{t.cancel}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => act(neg.id, 'APPROVED')} className="btn-success text-sm py-2">{t.approve} at {neg.requestedRate}</button>
                      <button onClick={() => setCountering(c => ({ ...c, [neg.id]: { rate: neg.marketRate.toString(), note: '' } }))} className="btn-secondary text-sm py-2">{t.counterOffer}</button>
                      <button onClick={() => act(neg.id, 'REJECTED', undefined, 'Rate not acceptable')} className="btn-danger text-sm py-2">{t.reject}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
