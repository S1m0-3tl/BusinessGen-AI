import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  LineChart,
  Loader2,
  PieChart,
  Play,
  Sparkles,
  Target,
  Terminal,
  WalletCards,
} from 'lucide-react';
import api from '../api';

const terminalSteps = [
  'Initializing venture workspace...',
  'Reading founder constraints...',
  'Querying market memory and feedback loops...',
  'Drafting positioning, SWOT, BMC, and financial model...',
  'Preparing investor-grade blueprint...',
];

const HistorySkeleton = () => (
  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 animate-pulse">
    <div className="h-4 w-3/4 rounded bg-slate-800" />
    <div className="mt-3 h-3 w-1/2 rounded bg-slate-800" />
  </div>
);

const normalizeBlueprint = (item) => {
  if (!item) return null;
  const analysis = item.analysis && typeof item.analysis === 'object' ? item.analysis : item;
  return {
    ...analysis,
    id: item.id ?? analysis.id,
    name: item.name ?? analysis.name,
    slogan: item.slogan ?? analysis.slogan,
    description: item.description ?? analysis.description,
  };
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const currencyRates = {
  USD: { label: 'US Dollar', symbol: '$', perUsd: 1 },
  MAD: { label: 'Moroccan Dirham', symbol: 'MAD', perUsd: 10.05 },
  EUR: { label: 'Euro', symbol: 'EUR', perUsd: 0.92 },
  GBP: { label: 'British Pound', symbol: 'GBP', perUsd: 0.79 },
  CAD: { label: 'Canadian Dollar', symbol: 'CAD', perUsd: 1.37 },
};

const supportedCurrencies = Object.keys(currencyRates);

const normalizeCurrency = (currency) => {
  const code = String(currency || 'USD').toUpperCase();
  return currencyRates[code] ? code : 'USD';
};

const convertMoney = (value, targetCurrency = 'USD', baseCurrency = 'USD') => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  const from = normalizeCurrency(baseCurrency);
  const to = normalizeCurrency(targetCurrency);
  return (amount / currencyRates[from].perUsd) * currencyRates[to].perUsd;
};

const convertProjection = (projection, targetCurrency, baseCurrency) => (
  asArray(projection).map((row) => ({
    ...row,
    revenue: convertMoney(row.revenue, targetCurrency, baseCurrency),
    costs: convertMoney(row.costs, targetCurrency, baseCurrency),
    profit: convertMoney(row.profit, targetCurrency, baseCurrency),
  }))
);

const formatMoney = (value, currency = 'USD', baseCurrency = currency) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value || '0';
  const target = normalizeCurrency(currency);
  const converted = convertMoney(amount, target, baseCurrency);
  return `${currencyRates[target].symbol} ${Number(converted).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
};

const titleize = (key) => key.replaceAll('_', ' ');

const ChartToggle = ({ value, options, onChange }) => (
  <div className="flex rounded-lg border border-slate-800 bg-slate-950/70 p-1">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={`flex h-8 min-w-10 items-center justify-center rounded-md px-2 text-xs font-black transition ${
          value === option.value ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-slate-200'
        }`}
        title={option.label}
      >
        <option.icon size={15} />
      </button>
    ))}
  </div>
);

const SectionCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 ${className}`}>
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-blue-300" />}
      <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
    </div>
    {children}
  </div>
);

const ScoreBars = ({ scores }) => {
  const entries = Object.entries(scores || {});
  if (!entries.length) return null;

  return (
    <div className="space-y-3">
      {entries.map(([label, value]) => {
        const percent = Math.max(0, Math.min(100, Number(value) || 0));
        return (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold capitalize text-slate-300">{titleize(label)}</span>
              <span className="text-slate-500">{percent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-950">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RadarScoreChart = ({ scores }) => {
  const entries = Object.entries(scores || {});
  if (entries.length < 3) return <ScoreBars scores={scores} />;

  const size = 230;
  const center = size / 2;
  const radius = 78;
  const axis = entries.map(([, value], index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / entries.length;
    return {
      value,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      labelX: center + Math.cos(angle) * (radius + 28),
      labelY: center + Math.sin(angle) * (radius + 28),
      angle,
    };
  });
  const points = entries.map(([label, value], index) => {
    const percent = Math.max(0, Math.min(100, Number(value) || 0)) / 100;
    return {
      label,
      value,
      x: center + Math.cos(axis[index].angle) * radius * percent,
      y: center + Math.sin(axis[index].angle) * radius * percent,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-64 w-full max-w-72">
      {[0.35, 0.7, 1].map((scale) => (
        <polygon
          key={scale}
          points={axis.map((point) => `${center + (point.x - center) * scale},${center + (point.y - center) * scale}`).join(' ')}
          fill="none"
          stroke="#1e293b"
        />
      ))}
      {axis.map((point, index) => (
        <g key={entries[index][0]}>
          <line x1={center} y1={center} x2={point.x} y2={point.y} stroke="#1e293b" />
          <text x={point.labelX} y={point.labelY} textAnchor="middle" className="fill-slate-400 text-[9px] font-bold capitalize">
            {titleize(entries[index][0])}
          </text>
        </g>
      ))}
      <polygon points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="#60a5fa55" stroke="#60a5fa" strokeWidth="3" />
      {points.map((point) => <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="#60a5fa" />)}
    </svg>
  );
};

const CostChart = ({ costs, currency, baseCurrency }) => {
  const items = asArray(costs);
  if (!items.length) return null;
  const max = Math.max(...items.map((item) => Number(item.amount) || 0), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const amount = Number(item.amount) || 0;
        return (
          <div key={`${item.category}-${item.amount}`}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-300">{item.category}</span>
              <span className="text-slate-500">{formatMoney(amount, currency, baseCurrency)}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-950">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(amount / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CostDonut = ({ costs, currency, baseCurrency }) => {
  const items = asArray(costs);
  if (!items.length) return null;
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 1;
  const colors = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#a78bfa', '#22d3ee'];
  const segments = items.reduce((current, item) => {
    const amount = Number(item.amount) || 0;
    const share = amount / total;
    const dashLength = share * 263.89;
    const previousOffset = current.at(-1)?.nextOffset || 0;
    return [
      ...current,
      {
        item,
        dashLength,
        offset: previousOffset,
        nextOffset: previousOffset + dashLength,
      },
    ];
  }, []);

  return (
    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[11rem_1fr]">
      <svg viewBox="0 0 120 120" className="h-44 w-44">
        <circle cx="60" cy="60" r="42" fill="none" stroke="#0f172a" strokeWidth="18" />
        {segments.map(({ item, dashLength, offset }, index) => (
            <circle
              key={item.category}
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke={colors[index % colors.length]}
              strokeDasharray={`${dashLength} ${263.89 - dashLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              strokeWidth="18"
              transform="rotate(-90 60 60)"
            />
        ))}
        <text x="60" y="56" textAnchor="middle" className="fill-white text-[12px] font-black">Total</text>
        <text x="60" y="72" textAnchor="middle" className="fill-slate-400 text-[9px] font-bold">
          {formatMoney(total, currency, baseCurrency)}
        </text>
      </svg>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.category} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 font-bold text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              {item.category}
            </span>
            <span className="text-slate-500">{formatMoney(item.amount, currency, baseCurrency)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectionChart = ({ projection, currency }) => {
  const rows = asArray(projection);
  if (!rows.length) return null;

  const width = 520;
  const height = 220;
  const padding = 28;
  const values = rows.flatMap((row) => [Number(row.revenue) || 0, Number(row.costs) || 0, Number(row.profit) || 0]);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const range = max - min || 1;
  const xFor = (index) => padding + (index * (width - padding * 2)) / Math.max(rows.length - 1, 1);
  const yFor = (value) => height - padding - (((Number(value) || 0) - min) / range) * (height - padding * 2);
  const pathFor = (key) => rows.map((row, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(row[key])}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full overflow-visible">
        <line x1={padding} x2={width - padding} y1={yFor(0)} y2={yFor(0)} stroke="#334155" strokeDasharray="4 6" />
        <path d={pathFor('revenue')} fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" />
        <path d={pathFor('costs')} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
        <path d={pathFor('profit')} fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
        {rows.map((row, index) => (
          <g key={row.month || index}>
            <text x={xFor(index)} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
              {row.month || `M${index + 1}`}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
        <span className="text-blue-300">Revenue</span>
        <span className="text-amber-300">Costs</span>
        <span className="text-emerald-300">Profit</span>
        <span className="text-slate-500">Base: {currency}</span>
      </div>
    </div>
  );
};

const ProjectionBars = ({ projection, currency }) => {
  const rows = asArray(projection);
  if (!rows.length) return null;
  const max = Math.max(
    ...rows.flatMap((row) => [Number(row.revenue) || 0, Number(row.costs) || 0, Number(row.profit) || 0].map(Math.abs)),
    1,
  );

  return (
    <div>
      <div className="flex h-64 items-end gap-3 overflow-x-auto pb-2">
        {rows.map((row, index) => (
          <div key={row.month || index} className="flex min-w-16 flex-1 flex-col items-center gap-2">
            <div className="flex h-48 items-end gap-1">
              {[
                ['revenue', 'bg-blue-400'],
                ['costs', 'bg-amber-400'],
                ['profit', 'bg-emerald-400'],
              ].map(([key, color]) => (
                <div
                  key={key}
                  className={`w-3 rounded-t ${color}`}
                  style={{ height: `${Math.max(6, (Math.abs(Number(row[key]) || 0) / max) * 100)}%` }}
                  title={`${titleize(key)}: ${formatMoney(row[key], currency, currency)}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500">{row.month || `M${index + 1}`}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-bold">
        <span className="text-blue-300">Revenue</span>
        <span className="text-amber-300">Costs</span>
        <span className="text-emerald-300">Profit</span>
        <span className="text-slate-500">Base: {currency}</span>
      </div>
    </div>
  );
};

const CompetitorChart = ({ competitors }) => {
  const items = asArray(competitors);
  if (!items.length) return null;

  return (
    <div className="space-y-4">
      {items.map((competitor) => (
        <div key={competitor.name}>
          <p className="text-sm font-bold text-white">{competitor.name}</p>
          <div className="mt-2 grid grid-cols-[6rem_1fr_2rem] items-center gap-2 text-xs text-slate-500">
            <span>Price</span>
            <div className="h-2 rounded-full bg-slate-950">
              <div className="h-full rounded-full bg-rose-400" style={{ width: `${Math.min(100, Number(competitor.price_level) || 0)}%` }} />
            </div>
            <span>{competitor.price_level || 0}</span>
            <span>Share</span>
            <div className="h-2 rounded-full bg-slate-950">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(100, Number(competitor.market_share_estimate) || 0)}%` }} />
            </div>
            <span>{competitor.market_share_estimate || 0}</span>
            <span>Digital</span>
            <div className="h-2 rounded-full bg-slate-950">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, Number(competitor.digital_presence) || 0)}%` }} />
            </div>
            <span>{competitor.digital_presence || 0}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ListBlock = ({ items }) => (
  <ul className="space-y-2 text-sm leading-6 text-slate-300">
    {asArray(items).map((item) => <li key={item}>- {item}</li>)}
  </ul>
);

const PrintList = ({ items }) => (
  <ul>
    {asArray(items).map((item) => <li key={item}>{item}</li>)}
  </ul>
);

const PrintKeyValueTable = ({ rows }) => {
  const visibleRows = rows.filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!visibleRows.length) return null;

  return (
    <table>
      <tbody>
        {visibleRows.map(([key, value]) => (
          <tr key={key}>
            <th>{titleize(key)}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PrintScoresTable = ({ scores }) => {
  const rows = Object.entries(scores || {});
  if (!rows.length) return null;

  return <PrintKeyValueTable rows={rows.map(([key, value]) => [key, `${value}%`])} />;
};

const PrintCostTable = ({ costs, currency, baseCurrency }) => {
  const rows = asArray(costs);
  if (!rows.length) return null;

  return (
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((item) => (
          <tr key={`${item.category}-${item.amount}`}>
            <td>{item.category}</td>
            <td>{formatMoney(item.amount, currency, baseCurrency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PrintProjectionTable = ({ projection, currency }) => {
  const rows = asArray(projection);
  if (!rows.length) return null;

  return (
    <table>
      <thead>
        <tr>
          <th>Month</th>
          <th>Revenue</th>
          <th>Costs</th>
          <th>Profit</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.month || index}>
            <td>{row.month || `M${index + 1}`}</td>
            <td>{formatMoney(row.revenue, currency, currency)}</td>
            <td>{formatMoney(row.costs, currency, currency)}</td>
            <td>{formatMoney(row.profit, currency, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PrintBlueprint = ({ blueprint, currency }) => {
  if (!blueprint) return null;
  const baseCurrency = normalizeCurrency(blueprint.currency_base || 'USD');
  const selectedCurrency = normalizeCurrency(currency || baseCurrency);
  const summaryFields = ['target_market', 'revenue_model', 'positioning_summary'];
  const inputSummary = blueprint.input_summary || {};
  const convertedProjection = convertProjection(blueprint.monthly_projection, selectedCurrency, baseCurrency);

  return (
    <div id="blueprint-print" className="hidden">
      <h1>{blueprint.name}</h1>
      <p className="print-slogan">{blueprint.slogan}</p>
      <p>{blueprint.description}</p>

      <section>
        <h2>Concept Inputs</h2>
        <PrintKeyValueTable
          rows={[
            ['sector', inputSummary.sector || blueprint.sector],
            ['budget', inputSummary.budget],
            ['currency', inputSummary.currency || baseCurrency],
            ['objectives', inputSummary.objectives],
          ]}
        />
      </section>

      <h2>Generated Information</h2>
      {summaryFields.map((key) => blueprint[key] && (
        <section key={key}>
          <h3>{titleize(key)}</h3>
          <p>{blueprint[key]}</p>
        </section>
      ))}

      {blueprint.financial_summary && (
        <section>
          <h2>Financial Summary</h2>
          <table>
            <tbody>
              {Object.entries(blueprint.financial_summary).map(([key, value]) => (
                <tr key={key}>
                  <th>{titleize(key)}</th>
                  <td>{key.includes('investment') || key.includes('profit') ? formatMoney(value, selectedCurrency, baseCurrency) : value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section>
        <h2>Graphs</h2>
        <h3>Scores</h3>
        <PrintScoresTable scores={blueprint.scores} />
        <ScoreBars scores={blueprint.scores} />
        <h3>Startup Costs</h3>
        <PrintCostTable costs={blueprint.startup_costs} currency={selectedCurrency} baseCurrency={baseCurrency} />
        <CostChart costs={blueprint.startup_costs} currency={selectedCurrency} baseCurrency={baseCurrency} />
        <CostDonut costs={blueprint.startup_costs} currency={selectedCurrency} baseCurrency={baseCurrency} />
        <h3>Monthly Projection</h3>
        <PrintProjectionTable projection={convertedProjection} currency={selectedCurrency} />
        <ProjectionChart projection={convertedProjection} currency={selectedCurrency} />
        <ProjectionBars projection={convertedProjection} currency={selectedCurrency} />
        <h3>Competitor Metrics</h3>
        <CompetitorChart competitors={blueprint.competitors} />
      </section>

      {blueprint.swot && (
        <section>
          <h2>SWOT</h2>
          <div className="print-grid">
            {Object.entries(blueprint.swot).map(([key, items]) => (
              <div key={key}>
                <h3>{titleize(key)}</h3>
                <PrintList items={items} />
              </div>
            ))}
          </div>
        </section>
      )}

      {blueprint.bmc && (
        <section>
          <h2>Business Model Canvas</h2>
          <div className="print-grid">
            {Object.entries(blueprint.bmc).map(([key, items]) => (
              <div key={key}>
                <h3>{titleize(key)}</h3>
                <PrintList items={items} />
              </div>
            ))}
          </div>
        </section>
      )}

      {!!asArray(blueprint.competitors).length && (
        <section>
          <h2>Competitors</h2>
          {blueprint.competitors.map((competitor) => (
            <div key={competitor.name}>
              <h3>{competitor.name}</h3>
              <p>{competitor.positioning}</p>
              <p><strong>Strength:</strong> {competitor.strength}</p>
              <p><strong>Weakness:</strong> {competitor.weakness}</p>
              <p><strong>Differentiation:</strong> {competitor.differentiation_strategy}</p>
            </div>
          ))}
        </section>
      )}

      {!!asArray(blueprint.next_steps).length && (
        <section>
          <h2>Next Steps</h2>
          <PrintList items={blueprint.next_steps} />
        </section>
      )}
    </div>
  );
};

const GeneratorDashboard = () => {
  const [formData, setFormData] = useState({ sector: '', budget: '', currency: 'USD', objectives: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState(['Ready. Define your startup constraints to begin.']);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [scoreChartType, setScoreChartType] = useState('bars');
  const [costChartType, setCostChartType] = useState('bars');
  const [projectionChartType, setProjectionChartType] = useState('line');

  const blueprint = useMemo(() => normalizeBlueprint(result), [result]);
  const baseCurrency = normalizeCurrency(blueprint?.currency_base || 'USD');
  const currency = normalizeCurrency(selectedCurrency || baseCurrency);
  const convertedProjection = useMemo(
    () => convertProjection(blueprint?.monthly_projection, currency, baseCurrency),
    [blueprint, currency, baseCurrency],
  );

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!loading) return undefined;
    setLogs([terminalSteps[0]]);
    let index = 1;
    const interval = setInterval(() => {
      setLogs((current) => [...current, terminalSteps[index] || 'Still thinking...']);
      index += 1;
      if (index >= terminalSteps.length) clearInterval(interval);
    }, 850);
    return () => clearInterval(interval);
  }, [loading]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get('/ideas/history/');
      setHistory(response.data);
    } catch (err) {
      console.error('History fetch error', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setSelectedCurrency(formData.currency);
    try {
      const response = await api.post('/ideas/generate/', formData);
      setResult(response.data);
      setSelectedCurrency(normalizeCurrency(response.data?.analysis?.currency_base || response.data?.currency_base || 'USD'));
      setLogs((current) => [...current, 'Blueprint generated successfully.', 'Saved to your library.']);
      fetchHistory();
    } catch (error) {
      const message = error.response?.data?.details || error.response?.data?.error || 'Generation failed.';
      setLogs((current) => [...current, `Error: ${message}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    if (!blueprint) return;
    const previousTitle = document.title;
    document.title = `${blueprint.name || 'business-blueprint'}-blueprint`;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener('afterprint', restoreTitle);
    };
    window.addEventListener('afterprint', restoreTitle);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-300">AI Generator</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">Build a business blueprint.</h1>
          <p className="mt-3 text-slate-400">A split-screen workspace for market-aware startup generation.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-black text-white">Concept Inputs</h2>
              <p className="text-sm text-slate-500">Sector, budget, and founder objectives.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Sector</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                placeholder="student fitness, AI accounting, coffee shop..."
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Budget</span>
              <div className="mt-2 grid grid-cols-[1fr_6.5rem] gap-2">
                <input
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                  placeholder="3000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
                <select
                  value={formData.currency}
                  onChange={(event) => setFormData({ ...formData, currency: event.target.value })}
                  className="rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-3 font-black text-white outline-none focus:border-blue-500"
                >
                  {supportedCurrencies.map((code) => (
                    <option key={code} value={code} className="bg-slate-950 text-white">
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-300">Objectives</span>
              <textarea
                className="mt-2 min-h-36 w-full rounded-lg border border-slate-800 bg-slate-950/80 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                placeholder="Low-risk launch, Moroccan market, fast MVP, social media growth..."
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              />
            </label>
            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-500 px-4 py-3 font-black text-white flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
              Generate Blueprint
            </button>
          </form>
        </div>

        <div className="xl:col-span-3 rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl overflow-hidden">
          <div className="h-12 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
              <Terminal size={16} className="text-emerald-300" /> live-preview.ai
            </div>
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="p-5 font-mono text-sm min-h-[34rem]">
            <div className="space-y-2">
              {logs.map((line, index) => (
                <p key={`${line}-${index}`} className="text-emerald-300">
                  <span className="text-slate-600 mr-2">{String(index + 1).padStart(2, '0')}</span>
                  {line}
                </p>
              ))}
              {loading && <p className="text-slate-500 animate-pulse">cursor awaiting model response...</p>}
            </div>

            {blueprint && (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 font-sans">
                <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-blue-300">{blueprint.slogan}</p>
                      <h2 className="mt-2 text-3xl font-black text-white">{blueprint.name}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm font-black text-slate-200">
                        <WalletCards size={16} className="text-blue-300" />
                        <select
                          value={currency}
                          onChange={(event) => setSelectedCurrency(event.target.value)}
                          className="bg-transparent text-sm font-black text-white outline-none"
                          title="Currency"
                        >
                          {supportedCurrencies.map((code) => (
                            <option key={code} value={code} className="bg-slate-950 text-white">
                              {code}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={handleExportPdf}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-400/40 bg-blue-500/15 px-4 py-2 text-sm font-black text-blue-100 hover:bg-blue-500/25"
                      >
                        <Download size={16} />
                        Export PDF
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{blueprint.description}</p>
                </div>
                {['target_market', 'revenue_model', 'positioning_summary'].map((key) => (
                  blueprint[key] && (
                    <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                      <p className="text-xs font-bold uppercase text-slate-500">{key.replaceAll('_', ' ')}</p>
                      <p className="mt-2 text-sm text-slate-300">{blueprint[key]}</p>
                    </div>
                  )
                ))}
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs font-bold uppercase text-slate-500">Status</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
                    <CheckCircle2 size={16} /> Saved as idea #{blueprint.id}
                  </p>
                </div>

                {blueprint.financial_summary && (
                  <SectionCard title="Financial summary" icon={FileText} className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(blueprint.financial_summary).map(([key, value]) => (
                        <div key={key} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                          <p className="text-[11px] font-bold uppercase text-slate-500">{titleize(key)}</p>
                          <p className="mt-2 text-lg font-black text-white">
                            {key.includes('investment') || key.includes('profit') ? formatMoney(value, currency, baseCurrency) : value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                <SectionCard title="Score graph" icon={BarChart3}>
                  <div className="mb-4 flex justify-end">
                    <ChartToggle
                      value={scoreChartType}
                      onChange={setScoreChartType}
                      options={[
                        { value: 'bars', label: 'Bar chart', icon: BarChart3 },
                        { value: 'radar', label: 'Radar chart', icon: Target },
                      ]}
                    />
                  </div>
                  {scoreChartType === 'radar' ? <RadarScoreChart scores={blueprint.scores} /> : <ScoreBars scores={blueprint.scores} />}
                </SectionCard>

                <SectionCard title="Startup cost graph" icon={BarChart3}>
                  <div className="mb-4 flex justify-end">
                    <ChartToggle
                      value={costChartType}
                      onChange={setCostChartType}
                      options={[
                        { value: 'bars', label: 'Bar chart', icon: BarChart3 },
                        { value: 'donut', label: 'Donut chart', icon: PieChart },
                      ]}
                    />
                  </div>
                  {costChartType === 'donut'
                    ? <CostDonut costs={blueprint.startup_costs} currency={currency} baseCurrency={baseCurrency} />
                    : <CostChart costs={blueprint.startup_costs} currency={currency} baseCurrency={baseCurrency} />}
                </SectionCard>

                <SectionCard title="Monthly projection graph" icon={BarChart3} className="lg:col-span-2">
                  <div className="mb-4 flex justify-end">
                    <ChartToggle
                      value={projectionChartType}
                      onChange={setProjectionChartType}
                      options={[
                        { value: 'line', label: 'Line chart', icon: LineChart },
                        { value: 'bars', label: 'Column chart', icon: BarChart3 },
                      ]}
                    />
                  </div>
                  {projectionChartType === 'bars'
                    ? <ProjectionBars projection={convertedProjection} currency={currency} />
                    : <ProjectionChart projection={convertedProjection} currency={currency} />}
                </SectionCard>

                {blueprint.swot && (
                  <SectionCard title="SWOT analysis" icon={Target} className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(blueprint.swot).map(([key, items]) => (
                        <div key={key} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                          <p className="mb-3 text-xs font-bold uppercase text-blue-300">{titleize(key)}</p>
                          <ListBlock items={items} />
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {blueprint.bmc && (
                  <SectionCard title="Business model canvas" icon={FileText} className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(blueprint.bmc).map(([key, items]) => (
                        <div key={key} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                          <p className="mb-3 text-xs font-bold uppercase text-slate-500">{titleize(key)}</p>
                          <ListBlock items={items} />
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {!!asArray(blueprint.competitors).length && (
                  <SectionCard title="Competitor graph" icon={BarChart3} className="lg:col-span-2">
                    <CompetitorChart competitors={blueprint.competitors} />
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {blueprint.competitors.map((competitor) => (
                        <div key={competitor.name} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                          <p className="font-black text-white">{competitor.name}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{competitor.positioning}</p>
                          <p className="mt-3 text-xs text-emerald-300">{competitor.differentiation_strategy}</p>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                )}

                {!!asArray(blueprint.next_steps).length && (
                  <SectionCard title="Next steps" icon={CheckCircle2} className="lg:col-span-2">
                    <ListBlock items={blueprint.next_steps} />
                  </SectionCard>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <PrintBlueprint blueprint={blueprint} currency={currency} />

      <section className="rounded-2xl border border-slate-800 bg-slate-900/55 backdrop-blur-xl p-5">
        <h2 className="flex items-center gap-2 font-black text-white">
          <Clock size={18} className="text-blue-300" /> Recent Blueprints
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {historyLoading
            ? Array.from({ length: 4 }).map((_, index) => <HistorySkeleton key={index} />)
            : history.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setResult(item);
                  setSelectedCurrency(normalizeCurrency(item.analysis?.currency_base || item.currency_base || 'USD'));
                  setLogs([`Loaded saved blueprint: ${item.name}`]);
                }}
                className="text-left rounded-lg border border-slate-800 bg-slate-950/60 p-4 hover:border-blue-500/50"
              >
                <p className="font-bold text-white truncate">{item.name}</p>
                <p className="mt-2 text-xs text-slate-500">{item.date}</p>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
};

export default GeneratorDashboard;
