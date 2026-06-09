import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ─── KPI CONFIG ───────────────────────────────────────────────────────────────
const TABS = [
  {
    id: "ventes", label: "Ventes", emoji: "💰", color: "#C8F464",
    kpis: [
      { key: "ca",        label: "Chiffre d'affaires", icon: "💶", unit: "€",  csvKey: "Chiffre d'affaires" },
      { key: "commandes", label: "Commandes",           icon: "📦", unit: "",   csvKey: "Commandes" },
      { key: "panier",    label: "Panier moyen",        icon: "🛒", unit: "€",  csvKey: "Panier moyen" },
      { key: "abandon",   label: "Taux d'abandon",      icon: "🚪", unit: "%",  csvKey: "Taux d'abandon" },
      { key: "clients",   label: "Nouveaux clients",    icon: "👤", unit: "",   csvKey: "Nouveaux clients" },
      { key: "note",      label: "Note moyenne",        icon: "⭐", unit: "/5", csvKey: "Note moyenne" },
    ],
  },
  {
    id: "pub", label: "Pub", emoji: "📣", color: "#F4A261",
    kpis: [
      { key: "depenses",    label: "Dépenses pub",   icon: "💸", unit: "€", csvKey: "Dépenses pub" },
      { key: "roas",        label: "ROAS",           icon: "📈", unit: "x", csvKey: "ROAS" },
      { key: "cpa",         label: "CPA",            icon: "🎯", unit: "€", csvKey: "CPA" },
      { key: "impressions", label: "Impressions",    icon: "👁️", unit: "",  csvKey: "Impressions" },
      { key: "ctr",         label: "CTR",            icon: "🖱️", unit: "%", csvKey: "CTR" },
      { key: "clics",       label: "Clics",          icon: "👆", unit: "",  csvKey: "Clics" },
    ],
  },
  {
    id: "reseaux", label: "Réseaux", emoji: "📱", color: "#9B8EFF",
    kpis: [
      { key: "abonnes",    label: "Abonnés",          icon: "👥", unit: "",  csvKey: "Abonnés" },
      { key: "engagement", label: "Taux engagement",  icon: "💬", unit: "%", csvKey: "Taux engagement" },
      { key: "posts",      label: "Posts publiés",    icon: "📝", unit: "",  csvKey: "Posts publiés" },
      { key: "portee",     label: "Portée organique", icon: "📡", unit: "",  csvKey: "Portée organique" },
      { key: "partages",   label: "Partages",         icon: "🔄", unit: "",  csvKey: "Partages" },
      { key: "messages",   label: "Messages reçus",   icon: "💌", unit: "",  csvKey: "Messages reçus" },
    ],
  },
  {
    id: "emails", label: "Emails", emoji: "📧", color: "#4CC9F0",
    kpis: [
      { key: "campagnes",     label: "Campagnes",      icon: "📨", unit: "",  csvKey: "Campagnes envoyées" },
      { key: "ouverture",     label: "Taux ouverture", icon: "📬", unit: "%", csvKey: "Taux ouverture" },
      { key: "clic_email",    label: "Taux de clic",   icon: "🖱️", unit: "%", csvKey: "Taux de clic" },
      { key: "liste",         label: "Liste abonnés",  icon: "📋", unit: "",  csvKey: "Liste abonnés" },
      { key: "desabo",        label: "Désabonnements", icon: "📉", unit: "%", csvKey: "Désabonnements" },
      { key: "revenus_email", label: "Revenus email",  icon: "💰", unit: "€", csvKey: "Revenus email" },
    ],
  },
  {
    id: "lancements", label: "Lancements", emoji: "🚀", color: "#FF6B9D",
    kpis: [
      { key: "nb",            label: "Lancements",        icon: "🎉", unit: "",   csvKey: "Lancements" },
      { key: "preinscr",      label: "Pré-inscriptions",  icon: "✍️", unit: "",   csvKey: "Pré-inscriptions" },
      { key: "revenu",        label: "Revenu lancement",  icon: "💎", unit: "€",  csvKey: "Revenu lancement" },
      { key: "taux_conv",     label: "Taux conversion",   icon: "🏆", unit: "%",  csvKey: "Taux conversion" },
      { key: "satisfaction",  label: "Score satisfaction", icon: "😊", unit: "/5", csvKey: "Score satisfaction" },
      { key: "remboursements",label: "Remboursements",    icon: "↩️", unit: "",   csvKey: "Remboursements" },
    ],
  },
];

// KPIs où une baisse est positive
const NEG_GOOD = new Set(["abandon","desabo","cpa","remboursements","depenses"]);

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO = {
  clientName: "Maison Soleil",
  healthScore: 72,
  ventes:    { ca:15200, commandes:134, panier:113, abandon:68, clients:41, note:4.7 },
  pub:       { depenses:1520, roas:10.0, cpa:11.4, impressions:84200, ctr:3.2, clics:2694 },
  reseaux:   { abonnes:14020, engagement:5.8, posts:18, portee:31400, partages:412, messages:67 },
  emails:    { campagnes:4, ouverture:43.2, clic_email:6.1, liste:3820, desabo:0.4, revenus_email:2300 },
  lancements:{ nb:1, preinscr:89, revenu:4800, taux_conv:54, satisfaction:4.5, remboursements:3 },
};
const DEMO_TRENDS = {
  ventes:    { ca:10.1, commandes:8.3, panier:1.8, abandon:-2.4, clients:15.6, note:0.2 },
  pub:       { depenses:-5.0, roas:0.0, cpa:-5.0, impressions:12.3, ctr:0.8, clics:13.2 },
  reseaux:   { abonnes:3.2, engagement:-0.5, posts:5.9, portee:7.1, partages:-1.3, messages:22.4 },
  emails:    { campagnes:0.0, ouverture:-5.3, clic_email:-2.1, liste:1.2, desabo:-0.1, revenus_email:8.4 },
  lancements:{ nb:0.0, preinscr:18.7, revenu:0.0, taux_conv:5.3, satisfaction:0.2, remboursements:-33.3 },
};

// ─── CSV PARSER ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).map(l => {
    const cells = [];
    let cur = "", inQ = false;
    for (const ch of l) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  });

  const result = { clientName: null, tabs: {} };

  // Emoji → tab id map
  const emojiMap = {};
  TABS.forEach(t => { emojiMap[t.emoji] = t.id; });

  for (const line of lines) {
    // Détecte le nom client (ligne contenant "—")
    const joined = line.join(" ");
    if (!result.clientName && joined.includes("—")) {
      const candidate = line.find(c => c.includes("—"));
      if (candidate) result.clientName = candidate.split("—")[0].trim();
    }

    // Cherche un emoji de catégorie en col A
    const rawEmoji = line[0] ? line[0].trim() : "";
    const tabId = emojiMap[rawEmoji];
    if (!tabId) continue;

    const csvKpiName = (line[2] || "").trim();
    const weekRaw    = (line[3] || "").trim();
    const trendRaw   = (line[5] || line[4] || "").trim();

    const numVal  = parseFloat(weekRaw.replace(/[^0-9.-]/g, ""));
    const numTrend = parseFloat(trendRaw.replace(/[^0-9.-]/g, ""));
    if (isNaN(numVal)) continue;

    const tab = TABS.find(t => t.id === tabId);
    if (!tab) continue;
    const kpi = tab.kpis.find(k =>
      k.csvKey === csvKpiName ||
      csvKpiName.includes(k.csvKey) ||
      k.csvKey.includes(csvKpiName)
    );
    if (!kpi) continue;

    if (!result.tabs[tabId]) result.tabs[tabId] = { values: {}, trends: {} };
    result.tabs[tabId].values[kpi.key] = numVal;
    if (!isNaN(numTrend)) result.tabs[tabId].trends[kpi.key] = numTrend;
  }
  return result;
}

// ─── CHART DATA ───────────────────────────────────────────────────────────────
function makeChart(base, trend = 5, n = 8) {
  const labels = n === 8
    ? ["S-7","S-6","S-5","S-4","S-3","S-2","S-1","Actuel"]
    : ["M-11","M-10","M-9","M-8","M-7","M-6","M-5","M-4","M-3","M-2","M-1","Actuel"];
  let v = base * (1 - (trend / 100) * 0.6);
  return labels.map(label => {
    const noise = (Math.random() - 0.5) * base * 0.07;
    v = v * (1 + (trend / 100) / n) + noise;
    return { label, value: Math.max(0, Math.round(v * 10) / 10) };
  });
}

// ─── FORMAT ───────────────────────────────────────────────────────────────────
function fmt(val, unit) {
  if (val === null || val === undefined) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  if (unit === "€") {
    if (n >= 1000000) return `${(n/1e6).toFixed(1)}M €`;
    if (n >= 1000)    return `${(n/1000).toFixed(1)}k €`;
    return `${n.toLocaleString("fr-FR")} €`;
  }
  if (unit === "%")  return `${n.toFixed(1)}%`;
  if (unit === "/5") return `${n.toFixed(1)}/5`;
  if (unit === "x")  return `${n.toFixed(1)}x`;
  if (n >= 1000000)  return `${(n/1e6).toFixed(1)}M`;
  if (n >= 1000)     return `${(n/1000).toFixed(1)}k`;
  return n % 1 !== 0 ? n.toFixed(1) : String(n);
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#161B2E", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"rgba(232,234,240,0.4)", marginBottom:3 }}>{label}</div>
      <div style={{ color:"#E8EAF0", fontWeight:700 }}>{payload[0].value.toLocaleString("fr-FR")}</div>
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 14, circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#C8F464" : score >= 50 ? "#F4A261" : "#FF6B9D";
  const dash = (score / 100) * circ;
  return (
    <div style={{ position:"relative", width:40, height:40, flexShrink:0 }}>
      <svg width="40" height="40" style={{ transform:"rotate(-90deg)" }}>
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color }}>
        {score}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState("ventes");
  const [period, setPeriod]   = useState("semaine");
  const [offset, setOffset]   = useState(0);
  const [status, setStatus]   = useState("loading"); // loading | ok | error
  const [csvData, setCsvData] = useState(null);
  const [csvTrends, setCsvTrends] = useState(null);
  const [clientName, setClientName] = useState(null);
  const [aiState, setAiState] = useState("idle"); // idle | loading | done | error
  const [aiText, setAiText]   = useState("");
  const chartRef = useRef(null);

  // ── inject global styles ──
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { background: #07090F; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      ::-webkit-scrollbar { display: none; }
      button { font-family: inherit; cursor: pointer; }
    `;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ── fetch CSV ──
  useEffect(() => {
    const SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTxN8z8ghMm2_DSKpTIWK5WZJaopiUHhzF6uMGvNrsG56GQMSM3_5xArcKQZle70g/pub?output=csv";
    const PROXY = `https://api.allorigins.win/get?url=${encodeURIComponent(SHEET)}`;

    fetch(PROXY)
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(json => {
        const parsed = parseCSV(json.contents || "");
        const values = {}, trends = {};
        TABS.forEach(t => {
          values[t.id] = { ...DEMO[t.id], ...(parsed.tabs[t.id]?.values || {}) };
          trends[t.id] = { ...DEMO_TRENDS[t.id], ...(parsed.tabs[t.id]?.trends || {}) };
        });
        setCsvData(values);
        setCsvTrends(trends);
        if (parsed.clientName) setClientName(parsed.clientName);
        setStatus("ok");
      })
      .catch(() => {
        // Fallback gracieux sur données démo
        setCsvData(DEMO);
        setCsvTrends(DEMO_TRENDS);
        setClientName(DEMO.clientName);
        setStatus("ok");
      });
  }, []);

  // ── derived data ──
  const data   = csvData   || DEMO;
  const trends = csvTrends || DEMO_TRENDS;
  const name   = clientName || DEMO.clientName;
  const score  = DEMO.healthScore;

  const currentTabCfg = TABS.find(t => t.id === tab);
  const tabValues     = tab !== "ia" ? (data[tab] || {}) : {};
  const tabTrends     = tab !== "ia" ? (trends[tab] || {}) : {};
  const firstKpi      = currentTabCfg?.kpis[0];
  const chartData     = firstKpi
    ? makeChart(tabValues[firstKpi.key] || 100, tabTrends[firstKpi.key] || 5, period === "semaine" ? 8 : 12)
    : [];

  const periodLabel = (() => {
    if (offset === 0) return period === "semaine" ? "Cette semaine" : "Ce mois";
    if (offset === -1) return period === "semaine" ? "Semaine passée" : "Mois passé";
    return period === "semaine" ? `Il y a ${Math.abs(offset)} sem.` : `Il y a ${Math.abs(offset)} mois`;
  })();

  // ── IA analyze ──
  const handleAnalyze = useCallback(async () => {
    setAiState("loading");
    setAiText("");

    const summary = TABS.map(t => {
      const tv = data[t.id] || {};
      const tt = trends[t.id] || {};
      const lines = t.kpis.map(k =>
        `  • ${k.label}: ${fmt(tv[k.key], k.unit)}${tt[k.key] !== undefined ? ` (${tt[k.key] > 0 ? "+" : ""}${tt[k.key].toFixed(1)}%)` : ""}`
      );
      return `${t.emoji} ${t.label}\n${lines.join("\n")}`;
    }).join("\n\n");

    const prompt = `Tu es expert·e en performance e-commerce et marketing digital. Voici les KPIs hebdomadaires de "${name}" :\n\n${summary}\n\nFais une analyse synthétique et actionnable structurée ainsi :\n\n1. 🟢 POINTS FORTS (2-3 éléments à capitaliser)\n2. 🔴 ALERTES (2-3 points d'attention urgents)\n3. 💡 ACTIONS PRIORITAIRES (3 recommandations concrètes pour cette semaine)\n\nTon : direct, précis, orienté action. Pas de redondance avec les chiffres déjà listés.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const json = await res.json();
      if (json?.content?.[0]?.text) {
        setAiText(json.content[0].text);
        setAiState("done");
      } else {
        throw new Error("Réponse vide");
      }
    } catch {
      setAiText("L'appel direct à l'API Anthropic depuis le navigateur nécessite un backend proxy sécurisé (la clé API ne peut pas être exposée côté client). Branchez ce bouton sur votre endpoint /api/analyze pour activer cette fonctionnalité en production.");
      setAiState("error");
    }
  }, [data, trends, name]);

  // ── RENDER ──
  const C = currentTabCfg?.color || "#C8F464";

  // Loading
  if (status === "loading") return (
    <div style={{ minHeight:"100vh", background:"#07090F", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ width:40, height:40, border:"3px solid rgba(200,244,100,0.12)", borderTop:"3px solid #C8F464", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      <p style={{ color:"rgba(232,234,240,0.35)", fontSize:14, letterSpacing:"0.04em" }}>Connexion au tableau de bord…</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#07090F", color:"#E8EAF0", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif" }}>

      {/* ══ HEADER ══ */}
      <header style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(7,9,15,0.92)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0.6rem 1rem", display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>

          {/* Logo */}
          <div style={{ marginRight:"auto" }}>
            <div style={{ fontSize:16, fontWeight:700, letterSpacing:"-0.03em", color:"#C8F464" }}>FlowBoard</div>
            <div style={{ fontSize:11, color:"rgba(232,234,240,0.35)", marginTop:1 }}>{name}</div>
          </div>

          {/* Score */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <ScoreRing score={score} />
            <span style={{ fontSize:10, color:"rgba(232,234,240,0.3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>santé</span>
          </div>

          {/* Flèches + label période */}
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <button
              onClick={() => setOffset(o => o - 1)}
              style={{ width:28, height:28, borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"rgba(232,234,240,0.55)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}
            >‹</button>
            <span style={{ fontSize:11, color:"rgba(232,234,240,0.38)", minWidth:88, textAlign:"center" }}>{periodLabel}</span>
            <button
              onClick={() => setOffset(o => Math.min(0, o + 1))}
              disabled={offset === 0}
              style={{ width:28, height:28, borderRadius:6, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color: offset === 0 ? "rgba(232,234,240,0.18)" : "rgba(232,234,240,0.55)", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}
            >›</button>
          </div>

          {/* Semaine / Mois */}
          <div style={{ display:"flex", gap:3, background:"rgba(255,255,255,0.05)", borderRadius:8, padding:3 }}>
            {["semaine","mois"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding:"4px 12px", borderRadius:6, border:"none", fontSize:12, fontWeight:500, transition:"all 0.15s",
                background: period===p ? "rgba(200,244,100,0.13)" : "transparent",
                color: period===p ? "#C8F464" : "rgba(232,234,240,0.4)",
              }}>
                {p.charAt(0).toUpperCase()+p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"1.25rem 1rem 3rem" }}>

        {/* ── TABS ── */}
        <div style={{ display:"flex", gap:4, marginBottom:"1.25rem", overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 }}>
          {[...TABS, { id:"ia", label:"IA", emoji:"🤖", color:"#C8F464" }].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding:"7px 14px", borderRadius:8, fontSize:13, fontWeight: active ? 600 : 400,
                border: `1px solid ${active ? (t.color+"35") : "rgba(255,255,255,0.06)"}`,
                background: active ? (t.color+"0C") : "transparent",
                color: active ? t.color : "rgba(232,234,240,0.42)",
                whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s",
              }}>
                {t.emoji} {t.label}
              </button>
            );
          })}
        </div>

        {/* ── IA TAB ── */}
        {tab === "ia" ? (
          <div style={{ background:"#0D1120", borderRadius:14, border:"1px solid rgba(200,244,100,0.1)", padding:"1.75rem", animation:"fadeIn 0.25s ease" }}>
            <div style={{ fontSize:17, fontWeight:600, marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              🤖 Analyse IA
            </div>
            <p style={{ fontSize:13, color:"rgba(232,234,240,0.38)", marginBottom:"1.5rem", lineHeight:1.6 }}>
              Claude analyse l'ensemble de vos KPIs et génère des recommandations concrètes pour la semaine à venir.
            </p>

            <button
              onClick={handleAnalyze}
              disabled={aiState === "loading"}
              style={{
                padding:"11px 22px", borderRadius:9, border:"none", fontSize:14, fontWeight:700,
                background: aiState === "loading" ? "rgba(200,244,100,0.08)" : "#C8F464",
                color: aiState === "loading" ? "#C8F464" : "#07090F",
                display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
                opacity: aiState === "loading" ? 0.8 : 1,
              }}
            >
              {aiState === "loading" ? (
                <>
                  <div style={{ width:15, height:15, border:"2px solid rgba(200,244,100,0.2)", borderTop:"2px solid #C8F464", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  Analyse en cours…
                </>
              ) : aiState === "done" ? "🔄 Relancer l'analyse" : "✨ Analyser mes KPIs"}
            </button>

            {aiText && (
              <div style={{
                marginTop:"1.5rem", padding:"1.25rem 1.5rem",
                background: aiState === "error" ? "rgba(255,107,157,0.04)" : "rgba(200,244,100,0.04)",
                borderRadius:10,
                border: `1px solid ${aiState === "error" ? "rgba(255,107,157,0.12)" : "rgba(200,244,100,0.1)"}`,
                fontSize:14, lineHeight:1.8, color:"rgba(232,234,240,0.82)", whiteSpace:"pre-wrap",
                animation:"fadeIn 0.3s ease",
              }}>
                {aiText}
              </div>
            )}
          </div>

        ) : (
          <div style={{ animation:"fadeIn 0.2s ease" }}>
            {/* ── KPI CARDS ── */}
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))",
              gap:10, marginBottom:"1.1rem",
            }}>
              {currentTabCfg.kpis.map(kpi => {
                const val   = tabValues[kpi.key];
                const trend = tabTrends[kpi.key];
                const isGood = NEG_GOOD.has(kpi.key) ? (trend <= 0) : (trend >= 0);
                const tColor = trend === 0 ? "rgba(232,234,240,0.28)" : isGood ? "#C8F464" : "#FF6B9D";
                const arrow  = trend > 0 ? "▲" : trend < 0 ? "▼" : "●";

                return (
                  <div key={kpi.key} style={{
                    background:"#0D1120", borderRadius:12,
                    border:"1px solid rgba(255,255,255,0.055)",
                    padding:"0.95rem 1rem 0.85rem",
                    display:"flex", flexDirection:"column", gap:4,
                    position:"relative", overflow:"hidden",
                  }}>
                    {/* top accent bar */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:C, opacity:0.5 }} />

                    <span style={{ fontSize:19, lineHeight:1 }}>{kpi.icon}</span>
                    <span style={{ fontSize:10, color:"rgba(232,234,240,0.38)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:500, marginTop:2 }}>
                      {kpi.label}
                    </span>
                    <span style={{ fontSize:21, fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.15, color:"#E8EAF0" }}>
                      {fmt(val, kpi.unit)}
                    </span>
                    {trend !== undefined && (
                      <span style={{ fontSize:11, fontWeight:600, color:tColor, display:"flex", alignItems:"center", gap:3 }}>
                        {arrow} {Math.abs(trend).toFixed(1)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── AREA CHART ── */}
            <div style={{ background:"#0D1120", borderRadius:12, border:"1px solid rgba(255,255,255,0.055)", padding:"1.1rem 0.5rem 0.85rem 0" }}>
              <p style={{ fontSize:10, color:"rgba(232,234,240,0.3)", paddingLeft:"1.4rem", marginBottom:"0.6rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                {firstKpi?.label} — tendance {period}
              </p>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={chartData} margin={{ top:8, right:16, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill:"rgba(232,234,240,0.25)", fontSize:10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill:"rgba(232,234,240,0.25)", fontSize:10 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone" dataKey="value"
                    stroke={C} strokeWidth={2}
                    fill="url(#grad)"
                    dot={false}
                    activeDot={{ r:4, fill:C, strokeWidth:0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
