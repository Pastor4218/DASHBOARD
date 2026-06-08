import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const FlowBoard = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('week');
  const [periodIndex, setPeriodIndex] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiForm, setShowApiForm] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  const clientName = 'Agence Digital Pro';
  const healthScore = 78;

  const kpiStructure = {
    sales: [
      { name: 'Revenus totaux', icon: '💵', value: 45230, trend: 12.5, unit: '€' },
      { name: 'Nb commandes', icon: '📦', value: 342, trend: 8.3, unit: '' },
      { name: 'Panier moyen', icon: '🛒', value: 132, trend: 5.2, unit: '€' },
      { name: 'Conversion', icon: '✅', value: 3.8, trend: -2.1, unit: '%' },
      { name: 'Clients acquis', icon: '👤', value: 89, trend: 15.7, unit: '' },
      { name: 'Churn', icon: '⚠️', value: 2.3, trend: -0.8, unit: '%' },
    ],
    ads: [
      { name: 'Budget dépensé', icon: '💰', value: 12450, trend: 8.2, unit: '€' },
      { name: 'Impressions', icon: '👁️', value: 245800, trend: 22.5, unit: '' },
      { name: 'Clics', icon: '🖱️', value: 8934, trend: 18.3, unit: '' },
      { name: 'CTR', icon: '📊', value: 3.64, trend: 5.1, unit: '%' },
      { name: 'CPC', icon: '💶', value: 1.39, trend: -3.2, unit: '€' },
      { name: 'ROAS', icon: '🎯', value: 3.42, trend: 12.8, unit: '€' },
    ],
    social: [
      { name: 'Followers nets', icon: '📈', value: 5240, trend: 18.9, unit: '' },
      { name: 'Engagement', icon: '💬', value: 8932, trend: 24.3, unit: '' },
      { name: 'Reach', icon: '🌍', value: 124500, trend: 31.2, unit: '' },
      { name: 'Sauvegarde', icon: '❤️', value: 3421, trend: 19.5, unit: '' },
      { name: 'Partages', icon: '🔄', value: 1205, trend: 27.8, unit: '' },
      { name: 'Mentions', icon: '@', value: 456, trend: -5.3, unit: '' },
    ],
    email: [
      { name: 'Abonnés', icon: '✉️', value: 12450, trend: 9.2, unit: '' },
      { name: 'Taux ouverture', icon: '📂', value: 24.5, trend: 3.8, unit: '%' },
      { name: 'Taux clic', icon: '🔗', value: 3.2, trend: 5.1, unit: '%' },
      { name: 'Désabos', icon: '❌', value: 34, trend: -12.5, unit: '' },
      { name: 'Revenus générés', icon: '💸', value: 8932, trend: 14.2, unit: '€' },
      { name: 'Segmentation', icon: '🎲', value: 6, trend: 0, unit: 'listes' },
    ],
    launch: [
      { name: 'Produits lancés', icon: '🚀', value: 4, trend: 100, unit: '' },
      { name: 'Pré-commandes', icon: '📋', value: 1234, trend: 45.6, unit: '' },
      { name: 'Buzz score', icon: '⭐', value: 8.2, trend: 22.1, unit: '/10' },
      { name: 'Couverture média', icon: '📰', value: 23, trend: 76.8, unit: 'articles' },
      { name: 'Social mentions', icon: '💭', value: 5621, trend: 89.3, unit: '' },
      { name: 'Conversion pré-cmd', icon: '🎁', value: 12.3, trend: 34.5, unit: '%' },
    ],
  };

  const chartData = [
    { name: 'Lun', value: 2400 },
    { name: 'Mar', value: 3210 },
    { name: 'Mer', value: 2290 },
    { name: 'Jeu', value: 3800 },
    { name: 'Ven', value: 4300 },
    { name: 'Sam', value: 3890 },
    { name: 'Dim', value: 4100 },
  ];

  const tabConfig = {
    sales: { label: 'Ventes', emoji: '💰', color: 'rgb(200, 244, 100)' },
    ads: { label: 'Pub', emoji: '📣', color: 'rgb(200, 244, 100)' },
    social: { label: 'Réseaux', emoji: '📱', color: 'rgb(200, 244, 100)' },
    email: { label: 'Emails', emoji: '📧', color: 'rgb(200, 244, 100)' },
    launch: { label: 'Lancements', emoji: '🚀', color: 'rgb(200, 244, 100)' },
    ai: { label: 'IA', emoji: '🤖', color: 'rgb(200, 244, 100)' },
  };

  useEffect(() => {
    fetchSheetData();
  }, []);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://docs.google.com/spreadsheets/d/e/2PACX-1vTxN8z8ghMm2_DSKpTIWK5WZJaopiUHhzF6uMGvNrsG56GQMSM3_5xArcKQZle70g/pub?output=csv'
      );
      
      if (!response.ok) throw new Error('Sheet non accessible');
      
      const text = await response.text();
      const lines = text.trim().split('\n');
      
      if (lines.length > 0) {
        setData({ loaded: true });
        setError(null);
      }
    } catch (err) {
      setError('❌ Impossible de charger le Google Sheet. Vérifiez le lien ou assurez-vous qu\'il est partagé en public.');
      setData({ loaded: false });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey.trim()) {
      alert('Veuillez entrer votre clé API Claude');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult('');

    try {
      const currentKpis = kpiStructure[activeTab];
      const prompt = `Analyse ces KPIs pour l'onglet "${tabConfig[activeTab].label}" et propose 3 actions d'optimisation concrètes et rapides :\n\n${currentKpis.map(k => `${k.name}: ${k.value}${k.unit} (tendance: ${k.trend > 0 ? '+' : ''}${k.trend}%)`).join('\n')}\n\nRéponse courte (max 150 mots), directe, sans fluff.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur API Claude');
      }

      const data = await response.json();
      const result = data.content[0]?.text || 'Pas de réponse';
      setAnalysisResult(result);
      setShowApiForm(false);
    } catch (err) {
      setAnalysisResult(`❌ Erreur: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const currentKpis = kpiStructure[activeTab] || [];
  const periods = ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'];
  const currentPeriod = periods[periodIndex] || 'Semaine 1';

  return (
    <div style={{ backgroundColor: '#07090F', color: '#E5E7EB', minHeight: '100vh', fontFamily: '"Segoe UI", sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0D1120', padding: '1.5rem 1rem', borderBottom: '1px solid #1F2937', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#C8F464' }}>FlowBoard</h1>
              <p style={{ margin: '0.25rem 0 0', fontSize: '14px', color: '#9CA3AF' }}>{clientName}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#1F2937', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Santé</span>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: healthScore > 70 ? '#C8F464' : '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>
                {healthScore}
              </div>
            </div>
          </div>

          {/* Navigation période */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
            <button
              onClick={() => setPeriodIndex(Math.max(0, periodIndex - 1))}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                color: '#9CA3AF',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              ← Précédent
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['week', 'month'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: period === p ? '#C8F464' : '#1F2937',
                    border: 'none',
                    color: period === p ? '#000' : '#9CA3AF',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: period === p ? 600 : 400,
                  }}
                >
                  {p === 'week' ? 'Semaine' : 'Mois'}
                </button>
              ))}
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#9CA3AF' }}>
              {currentPeriod}
            </div>
            <button
              onClick={() => setPeriodIndex(Math.min(periods.length - 1, periodIndex + 1))}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                color: '#9CA3AF',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Suivant →
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
            <div style={{ fontSize: '24px', marginBottom: '1rem' }}>⏳</div>
            <p>Chargement des données...</p>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: '#7F1D1D', padding: '1.5rem', borderRadius: '8px', color: '#FCA5A5', marginBottom: '2rem' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        ) : null}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {Object.entries(tabConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: activeTab === key ? '#C8F464' : '#1F2937',
                border: '1px solid #374151',
                color: activeTab === key ? '#000' : '#E5E7EB',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === key ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              {config.emoji} {config.label}
            </button>
          ))}
        </div>

        {/* Contenu par onglet */}
        {activeTab === 'ai' ? (
          <div style={{ backgroundColor: '#0D1120', padding: '2rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
            <h2 style={{ marginTop: 0, color: '#C8F464', marginBottom: '1.5rem' }}>Analyse IA des KPIs</h2>
            <p style={{ color: '#D1D5DB', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Utilisez Claude pour analyser les KPIs de l'onglet actuel et recevoir des recommandations d'optimisation basées sur les données.
            </p>

            {!showApiForm ? (
              <button
                onClick={() => setShowApiForm(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#C8F464',
                  border: 'none',
                  color: '#000',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Analyser avec Claude
              </button>
            ) : (
              <div style={{ backgroundColor: '#1F2937', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', color: '#9CA3AF' }}>
                  Clé API Claude :
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#0D1120',
                    border: '1px solid #374151',
                    color: '#E5E7EB',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    marginBottom: '1rem',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: analyzing ? '#6B7280' : '#C8F464',
                      border: 'none',
                      color: analyzing ? '#9CA3AF' : '#000',
                      borderRadius: '6px',
                      cursor: analyzing ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {analyzing ? '⏳ Analyse...' : '🤖 Analyser'}
                  </button>
                  <button
                    onClick={() => setShowApiForm(false)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#374151',
                      border: '1px solid #4B5563',
                      color: '#E5E7EB',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {analysisResult && (
              <div style={{
                backgroundColor: '#1F2937',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '1.5rem',
                borderLeft: '4px solid #C8F464',
              }}>
                <p style={{ margin: 0, color: '#E5E7EB', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {analysisResult}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              {currentKpis.map((kpi, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#0D1120',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #1F2937',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C8F464';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(200, 244, 100, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1F2937';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '24px' }}>{kpi.icon}</span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: kpi.trend > 0 ? '#065F46' : '#7F1D1D',
                      color: kpi.trend > 0 ? '#A7F3D0' : '#FCA5A5',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      {kpi.trend > 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}%
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>{kpi.name}</h3>
                  <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#C8F464' }}>
                    {kpi.value.toLocaleString('fr-FR')}{kpi.unit}
                  </p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div style={{
              backgroundColor: '#0D1120',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #1F2937',
            }}>
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '16px', color: '#E5E7EB', fontWeight: 600 }}>
                Tendance sur 7 jours
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8F464" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8F464" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#E5E7EB',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C8F464"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0D1120',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '12px',
        color: '#6B7280',
        borderTop: '1px solid #1F2937',
        marginTop: '2rem',
      }}>
        <p style={{ margin: 0 }}>FlowBoard © 2024 • Dashboard KPI pour assistantes virtuelles</p>
      </footer>
    </div>
  );
};

export default FlowBoard;
