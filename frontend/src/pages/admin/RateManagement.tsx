import { useEffect, useState } from 'react';
import { api, ExchangeRate } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function RateManagement() {
  const { t } = useAuth();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [editing, setEditing] = useState<Record<string, { buyRate: string; sellRate: string }>>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => { api.rates.getAll().then(setRates); }, []);

  const startEdit = (r: ExchangeRate) => setEditing(e => ({ ...e, [r.id]: { buyRate: r.buyRate.toString(), sellRate: r.sellRate.toString() } }));

  const save = async (r: ExchangeRate) => {
    const ed = editing[r.id];
    if (!ed) return;
    await api.rates.update(r.id, parseFloat(ed.buyRate), parseFloat(ed.sellRate));
    const updated = await api.rates.getAll();
    setRates(updated);
    setEditing(e => { const n = { ...e }; delete n[r.id]; return n; });
    setSaved(r.id);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t.rates}</h1>
      <div className="card">
        <table className="w-full text-sm">
          <thead><tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2">{t.currency}</th>
            <th className="text-right py-2">{t.buyRate}</th>
            <th className="text-right py-2">{t.sellRate}</th>
            <th className="text-right py-2">Updated</th>
            <th className="text-right py-2">Actions</th>
          </tr></thead>
          <tbody>{rates.map(r => {
            const ed = editing[r.id];
            return (
              <tr key={r.id} className="border-b border-gray-800/50">
                <td className="py-3">
                  <span className="font-medium text-white">{r.fromCurrency}</span>
                  <span className="text-gray-500"> / {r.toCurrency}</span>
                </td>
                <td className="py-3 text-right">
                  {ed ? <input type="number" value={ed.buyRate} onChange={e => setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], buyRate: e.target.value } }))} className="input w-28 text-right text-sm py-1" step="0.01" /> : <span className="text-emerald-400">{r.buyRate}</span>}
                </td>
                <td className="py-3 text-right">
                  {ed ? <input type="number" value={ed.sellRate} onChange={e => setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], sellRate: e.target.value } }))} className="input w-28 text-right text-sm py-1" step="0.01" /> : <span className="text-amber-400">{r.sellRate}</span>}
                </td>
                <td className="py-3 text-right text-gray-500 text-xs">{new Date(r.updatedAt).toLocaleString()}</td>
                <td className="py-3 text-right">
                  {saved === r.id ? <span className="text-emerald-400 text-xs">Saved!</span> : ed ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => save(r)} className="btn-success text-xs py-1 px-3">{t.save}</button>
                      <button onClick={() => setEditing(e => { const n = { ...e }; delete n[r.id]; return n; })} className="text-gray-500 hover:text-white text-xs">{t.cancel}</button>
                    </div>
                  ) : (
                    <button onClick={() => startEdit(r)} className="text-cyan-400 hover:text-cyan-300 text-xs">Edit</button>
                  )}
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
