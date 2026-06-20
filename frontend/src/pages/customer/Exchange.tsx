import { useEffect, useState } from 'react';
import { api, ExchangeRate } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CURRENCIES = ['USD', 'EUR', 'RUB', 'GBP', 'AMD'];

export default function Exchange() {
  const { t } = useAuth();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('AMD');
  const [amount, setAmount] = useState('');
  const [negotiate, setNegotiate] = useState(false);
  const [requestedRate, setRequestedRate] = useState('');
  const [purpose, setPurpose] = useState('other');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.rates.getAll().then(setRates);
  }, []);

  const currentRate = rates.find(r => r.fromCurrency === from && r.toCurrency === to);
  const calcResult = currentRate && amount ? (parseFloat(amount) * currentRate.sellRate).toFixed(2) : null;

  const handleExchange = async () => {
    if (!amount || !from || !to) return;
    setLoading(true); setError(''); setSuccess('');
    try {
      if (negotiate) {
        await api.negotiations.create({ fromCurrency: from, toCurrency: to, amount: parseFloat(amount), requestedRate: parseFloat(requestedRate), purpose });
        setSuccess('Negotiation request submitted! You will be notified when reviewed.');
      } else {
        await api.transactions.create({ fromCurrency: from, toCurrency: to, fromAmount: parseFloat(amount) });
        setSuccess('Exchange completed successfully!');
      }
      setAmount('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const purposes = [
    { value: 'import_export', label: t.purposes.import_export },
    { value: 'real_estate', label: t.purposes.real_estate },
    { value: 'transfer', label: t.purposes.transfer },
    { value: 'tourism', label: t.purposes.tourism },
    { value: 'other', label: t.purposes.other },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">{t.exchange}</h1>

      {success && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-4 mb-6">{success}</div>}
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 mb-6">{error}</div>}

      <div className="card space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">{t.from}</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className="input">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm block mb-1.5">{t.to}</label>
            <select value={to} onChange={e => setTo(e.target.value)} className="input">
              {CURRENCIES.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm block mb-1.5">{t.amount}</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input text-lg" placeholder="0.00" min="0" />
        </div>

        {currentRate && (
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t.marketRate}</span>
              <span className="text-cyan-400 font-medium">{currentRate.sellRate}</span>
            </div>
            {calcResult && (
              <div className="flex justify-between">
                <span className="text-gray-400">{t.youGet}</span>
                <span className="text-white text-xl font-semibold">{parseFloat(calcResult).toLocaleString()} {to}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setNegotiate(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${!negotiate ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t.exchangeNow}
          </button>
          <button onClick={() => setNegotiate(true)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${negotiate ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t.negotiateRate}
          </button>
        </div>

        {negotiate && (
          <div className="space-y-4 border-t border-gray-800 pt-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">{t.requestedRate}</label>
              <input type="number" value={requestedRate} onChange={e => setRequestedRate(e.target.value)} className="input" placeholder={currentRate?.sellRate.toString()} step="0.01" />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1.5">{t.purpose}</label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)} className="input">
                {purposes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <p className="text-gray-500 text-xs">Your negotiation request will be reviewed by an Arcarius trader who will approve, reject, or provide a counter-offer.</p>
          </div>
        )}

        <button onClick={handleExchange} disabled={loading || !amount || !currentRate || (negotiate && !requestedRate)} className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${negotiate ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-gray-900'}`}>
          {loading ? '...' : negotiate ? t.submit : t.exchangeNow}
        </button>
      </div>
    </div>
  );
}
