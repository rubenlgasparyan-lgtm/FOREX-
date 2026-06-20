import { ExchangeRate } from '../api/client';

interface Props { rates: ExchangeRate[]; compact?: boolean; }

const MAJOR = ['USD', 'EUR', 'RUB', 'GBP'];

export default function RateCard({ rates, compact }: Props) {
  const filtered = rates.filter(r => MAJOR.includes(r.fromCurrency) && r.toCurrency === 'AMD');

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2">Currency</th>
              <th className="text-right py-2">Buy</th>
              <th className="text-right py-2">Sell</th>
              {!compact && <th className="text-right py-2">Updated</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {r.fromCurrency[0]}
                    </div>
                    <span className="font-medium text-white">{r.fromCurrency}</span>
                    <span className="text-gray-500">/ AMD</span>
                  </div>
                </td>
                <td className="text-right py-3 text-emerald-400 font-medium">{r.buyRate.toFixed(2)}</td>
                <td className="text-right py-3 text-amber-400 font-medium">{r.sellRate.toFixed(2)}</td>
                {!compact && <td className="text-right py-3 text-gray-500 text-xs">{new Date(r.updatedAt).toLocaleTimeString()}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
