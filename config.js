<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>MTG Top 100 Live — Magic: The Gathering Market Dashboard</title>
<meta name="description" content="Track the top 100 Magic: The Gathering cards by sales volume, total sales, market price, and trend data.">
<meta name="keywords" content="MTG top sales, Magic card sales, TCGPlayer top 100, MTG market, Magic the Gathering prices, MTG sales dashboard">
<meta name="author" content="MTG Market Pulse">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://skyweezydeezy.github.io/mtg-market-pulse/">

<meta property="og:type" content="website">
<meta property="og:url" content="https://skyweezydeezy.github.io/mtg-market-pulse/">
<meta property="og:title" content="MTG Top 100 Live — Magic Card Market Dashboard">
<meta property="og:description" content="See the top 100 Magic: The Gathering cards by sales data with bubble charts, filters, rankings, and TCGPlayer links.">
<meta property="og:image" content="https://skyweezydeezy.github.io/mtg-market-pulse/preview.png">
<meta property="og:site_name" content="MTG Top 100 Live">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="MTG Top 100 Live — Magic Card Market Dashboard">
<meta name="twitter:description" content="Top 100 MTG cards by sales, market price, and trend data.">
<meta name="twitter:image" content="https://skyweezydeezy.github.io/mtg-market-pulse/preview.png">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "MTG Top 100 Live",
  "url": "https://skyweezydeezy.github.io/mtg-market-pulse/",
  "description": "Magic: The Gathering sales dashboard showing top cards by sales volume, total sales, market price, and trend data.",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
<script src="./config.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">

<style>
:root{
  --bg:#050711;
  --bg2:#080c18;
  --panel:#0b1220ee;
  --panel2:#0e1627;
  --panel3:#111b30;
  --border:#1c2940;
  --border2:#2a3d5f;
  --text:#e9ecff;
  --muted:#8d9ab8;
  --muted2:#52617d;
  --title:#ffffff;
  --accent:#8b5cf6;
  --accent2:#22d3ee;
  --up:#22c55e;
  --down:#ef4444;
  --gold:#facc15;
  --orange:#fb923c;
  --blue:#38bdf8;
  --pink:#f472b6;
  --green:#4ade80;
  --shadow:0 18px 60px rgba(0,0,0,.45);
  --radius:16px;
  --header-h:70px;
}
body.light{
  --bg:#eef2ff;
  --bg2:#f8fafc;
  --panel:#ffffffee;
  --panel2:#f1f5f9;
  --panel3:#e2e8f0;
  --border:#cbd5e1;
  --border2:#94a3b8;
  --text:#172033;
  --muted:#475569;
  --muted2:#64748b;
  --title:#020617;
  --shadow:0 18px 60px rgba(15,23,42,.16);
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}
body{
  background:
    radial-gradient(circle at 65% 25%, rgba(139,92,246,.18), transparent 34%),
    radial-gradient(circle at 25% 80%, rgba(34,211,238,.12), transparent 34%),
    var(--bg);
  color:var(--text);
  font-family:'Barlow Condensed',sans-serif;
}
button,input,select{font-family:inherit}
button{cursor:pointer;outline:none}
input,select{outline:none}
.mono{font-family:'JetBrains Mono',monospace}
.hide{display:none!important}

.app{
  height:100%;
  display:grid;
  grid-template-rows:var(--header-h) 1fr;
}

/* Header */
.topbar{
  height:var(--header-h);
  display:flex;
  align-items:center;
  gap:18px;
  padding:0 22px;
  border-bottom:1px solid var(--border);
  background:linear-gradient(180deg, rgba(2,6,23,.84), rgba(2,6,23,.62));
  backdrop-filter:blur(18px);
  z-index:50;
}
.brand{
  display:flex;
  align-items:center;
  gap:10px;
  min-width:230px;
}
.logo{
  width:30px;height:30px;
  border-radius:9px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  display:grid;place-items:center;
  box-shadow:0 0 24px rgba(139,92,246,.45);
}
.brand-title{
  font-size:25px;
  font-weight:900;
  letter-spacing:.7px;
  color:var(--title);
  line-height:1;
}
.brand-sub{
  font-size:11px;
  color:var(--muted);
  letter-spacing:.5px;
}
.search-wrap{
  flex:1;
  max-width:560px;
  position:relative;
}
.search-wrap svg{
  position:absolute;
  left:13px;
  top:50%;
  transform:translateY(-50%);
  opacity:.65;
}
#global-search{
  width:100%;
  padding:11px 14px 11px 40px;
  border:1px solid var(--border2);
  border-radius:10px;
  color:var(--text);
  background:rgba(8,13,25,.75);
  font-size:15px;
}
body.light #global-search{background:#fff}
.header-actions{
  margin-left:auto;
  display:flex;
  align-items:center;
  gap:10px;
}
.badge{
  display:inline-flex;
  align-items:center;
  gap:8px;
  border:1px solid var(--border);
  background:rgba(15,23,42,.55);
  border-radius:10px;
  padding:9px 12px;
  font-size:13px;
  color:var(--text);
}
.dot{
  width:9px;height:9px;border-radius:50%;
  background:var(--up);
  box-shadow:0 0 12px var(--up);
  display:inline-block;
}
.icon-btn{
  width:38px;height:38px;
  border-radius:12px;
  border:1px solid var(--border);
  background:rgba(15,23,42,.55);
  color:var(--text);
  display:grid;
  place-items:center;
}
.mobile-menu{display:none}

/* Shell */
.shell{
  height:calc(100vh - var(--header-h));
  display:grid;
  grid-template-columns:280px 1fr 340px;
  gap:10px;
  padding:10px;
  overflow:hidden;
}
.sidebar,.detail-side,.main{
  min-height:0;
}
.sidebar,.detail-side{
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  overflow:hidden;
}
.sidebar{
  display:flex;
  flex-direction:column;
}
.side-scroll{
  overflow-y:auto;
  padding:16px;
}
.side-title{
  display:flex;
  justify-content:space-between;
  align-items:center;
  color:var(--title);
  font-weight:900;
  letter-spacing:1px;
  margin-bottom:14px;
}
.reset-btn{
  border:none;
  background:none;
  color:#a78bfa;
  font-size:13px;
  font-weight:700;
}
.filter-group{margin-bottom:15px}
.filter-label{
  display:block;
  color:var(--muted);
  font-size:12px;
  margin-bottom:6px;
  letter-spacing:.7px;
}
.filter-control{
  width:100%;
  border:1px solid var(--border2);
  background:rgba(15,23,42,.65);
  color:var(--text);
  border-radius:9px;
  padding:10px 11px;
  font-size:14px;
}
body.light .filter-control{background:#fff}
.check-grid{
  display:grid;
  gap:8px;
}
.check-row{
  display:flex;align-items:center;gap:8px;
  font-size:14px;color:var(--text);
}
.check-row input{accent-color:var(--accent)}
.price-row{display:grid;grid-template-columns:1fr auto 1fr;gap:7px;align-items:center}
.apply-btn{
  width:100%;
  border:none;
  border-radius:10px;
  padding:12px 14px;
  background:linear-gradient(135deg,#7c3aed,#4f46e5);
  color:white;
  font-weight:900;
  letter-spacing:.7px;
  margin-top:2px;
}
.stat-card{
  border-top:1px solid var(--border);
  padding:14px 16px;
  background:rgba(3,7,18,.24);
}
.stat-title{
  font-size:12px;
  color:#c4b5fd;
  font-weight:900;
  letter-spacing:1px;
  margin-bottom:10px;
}
.stat-row{
  display:flex;
  justify-content:space-between;
  gap:8px;
  font-size:13px;
  margin:8px 0;
  color:var(--muted);
}
.stat-row strong{color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px}
.updated{color:var(--up)!important}

/* Main */
.main{
  display:grid;
  grid-template-rows:auto 1fr 220px;
  gap:10px;
  overflow:hidden;
}
.main-head{
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:12px 14px;
  display:flex;
  align-items:center;
  gap:12px;
}
.title-block{min-width:260px}
.main-title{
  font-size:24px;
  font-weight:900;
  color:var(--title);
  letter-spacing:.4px;
}
.main-kicker{
  color:var(--muted);
  font-size:14px;
  margin-top:2px;
}
.mobile-filter-row{
  display:none;
}
.tabs{
  display:flex;
  border:1px solid var(--border2);
  border-radius:12px;
  padding:3px;
  margin-left:auto;
  background:rgba(2,6,23,.5);
}
.tab{
  border:none;
  background:transparent;
  color:var(--text);
  min-width:80px;
  padding:8px 12px;
  border-radius:9px;
  font-weight:900;
  letter-spacing:.4px;
}
.tab.active{
  background:rgba(139,92,246,.22);
  color:#c4b5fd;
}
.chart-card{
  position:relative;
  overflow:hidden;
  background:
    radial-gradient(circle at 50% 50%, rgba(139,92,246,.1), transparent 40%),
    rgba(2,6,23,.38);
  border:1px solid var(--border);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
}
#bubble-svg{
  width:100%;
  height:100%;
  display:block;
}
.chart-overlay{
  position:absolute;
  left:14px;
  bottom:14px;
  display:flex;
  align-items:center;
  gap:10px;
  background:rgba(2,6,23,.66);
  border:1px solid var(--border);
  border-radius:12px;
  padding:8px 10px;
  backdrop-filter:blur(10px);
}
.chart-overlay label{
  color:var(--muted);
  font-size:13px;
}
#bubble-metric{
  border:1px solid var(--border2);
  background:#07111f;
  color:var(--text);
  border-radius:9px;
  padding:7px 9px;
}
#render-limit{
  accent-color:var(--accent2);
}
.empty-state{
  position:absolute;inset:0;
  display:none;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  gap:8px;
  color:var(--muted2);
}
.empty-state.show{display:flex}

/* Table */
.table-card{
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:var(--radius);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
.table-head{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;
  border-bottom:1px solid var(--border);
}
.table-title{
  font-weight:900;
  color:var(--title);
  letter-spacing:.8px;
}
.page-controls{
  display:flex;align-items:center;gap:6px;
}
.page-controls button{
  border:1px solid var(--border2);
  background:rgba(15,23,42,.7);
  color:var(--text);
  border-radius:8px;
  padding:5px 9px;
}
.table-wrap{overflow:auto;min-height:0}
table{
  width:100%;
  border-collapse:collapse;
  font-size:13px;
}
th,td{
  padding:9px 12px;
  border-bottom:1px solid rgba(42,61,95,.42);
  text-align:left;
  white-space:nowrap;
}
th{
  color:#c4b5fd;
  font-size:11px;
  letter-spacing:.8px;
  font-family:'JetBrains Mono',monospace;
  background:rgba(2,6,23,.32);
  position:sticky;
  top:0;
}
td{color:var(--text)}
tr{cursor:pointer}
tr:hover{background:rgba(139,92,246,.1)}
.rank-cell{font-family:'JetBrains Mono',monospace;color:var(--muted)}
.money{font-family:'JetBrains Mono',monospace}
.up{color:var(--up)}
.down{color:var(--down)}
.card-name-cell{
  display:flex;align-items:center;gap:8px;
}
.thumb{
  width:28px;height:39px;
  border-radius:4px;
  object-fit:cover;
  background:#111827;
  border:1px solid var(--border2);
}

/* Detail side */
.detail-side{
  display:flex;
  flex-direction:column;
}
.detail-empty{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  gap:10px;
  color:var(--muted2);
  padding:30px;
  text-align:center;
}
.detail-content{
  display:none;
  overflow-y:auto;
  padding:16px;
}
.detail-content.show{display:block}
.detail-img{
  width:100%;
  border-radius:14px;
  border:1px solid var(--border2);
  background:#111827;
  box-shadow:0 20px 50px rgba(0,0,0,.35);
}
.detail-rank{
  display:inline-flex;
  align-items:center;
  gap:7px;
  margin-top:13px;
  padding:5px 9px;
  border-radius:999px;
  color:#ddd6fe;
  background:rgba(139,92,246,.22);
  font-size:12px;
  font-weight:900;
}
.detail-name{
  margin-top:10px;
  font-size:25px;
  color:var(--title);
  font-weight:900;
  line-height:1.05;
}
.detail-meta{
  margin-top:4px;
  color:var(--muted);
  font-size:14px;
}
.detail-grid{
  margin-top:14px;
  display:grid;
  gap:0;
  border:1px solid var(--border);
  border-radius:12px;
  overflow:hidden;
}
.detail-row{
  display:flex;
  justify-content:space-between;
  gap:10px;
  padding:11px 12px;
  border-bottom:1px solid var(--border);
  font-size:14px;
}
.detail-row:last-child{border-bottom:none}
.detail-row span{color:var(--muted)}
.detail-row strong{font-family:'JetBrains Mono',monospace;color:var(--text)}
.buy-btn{
  margin-top:14px;
  width:100%;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  text-decoration:none;
  border:none;
  border-radius:11px;
  padding:13px;
  background:linear-gradient(135deg,#7c3aed,#4f46e5);
  color:white;
  font-weight:900;
  letter-spacing:1px;
}
.watch-btn{
  margin-top:10px;
  width:100%;
  border:1px solid var(--border2);
  background:rgba(15,23,42,.6);
  color:var(--text);
  border-radius:11px;
  padding:11px;
  font-weight:900;
}

/* Overlays */
.drawer-backdrop{
  position:absolute;
  inset:var(--header-h) 0 0 0;
  z-index:90;
  background:rgba(0,0,0,.5);
  display:none;
}
.drawer-backdrop.show{display:block}
.mobile-drawer{
  position:absolute;
  z-index:100;
  top:var(--header-h);
  bottom:0;
  left:0;
  width:min(86vw,330px);
  background:var(--panel);
  border-right:1px solid var(--border);
  transform:translateX(-105%);
  transition:transform .22s ease;
  box-shadow:var(--shadow);
}
.mobile-drawer.open{transform:translateX(0)}
.mobile-bottom-detail{
  display:none;
}

/* SVG text */
.bubble-label{
  pointer-events:none;
  user-select:none;
  filter:drop-shadow(0 1px 4px rgba(0,0,0,.9));
}

/* Responsive */
@media (max-width:1200px){
  .shell{grid-template-columns:250px 1fr 300px}
  .brand{min-width:205px}
}
@media (max-width:940px){
  :root{--header-h:76px}
  body{overflow:hidden}
  .topbar{
    padding:8px 12px;
    height:var(--header-h);
    gap:10px;
    flex-wrap:wrap;
  }
  .brand{
    min-width:auto;
    flex:1;
  }
  .brand-title{font-size:22px}
  .brand-sub{display:none}
  .search-wrap{
    order:2;
    flex-basis:100%;
    max-width:none;
  }
  #global-search{padding:9px 12px 9px 36px}
  .header-actions .badge{display:none}
  .mobile-menu{display:grid}
  .shell{
    height:calc(100vh - var(--header-h));
    display:block;
    padding:8px;
  }
  .sidebar,.detail-side{display:none}
  .main{
    height:100%;
    grid-template-rows:auto 1fr 160px;
    gap:8px;
  }
  .main-head{
    padding:9px;
    display:block;
  }
  .title-block{min-width:0}
  .main-title{font-size:20px}
  .main-kicker{font-size:12px}
  .mobile-filter-row{
    display:flex;
    gap:7px;
    margin-top:8px;
    overflow-x:auto;
  }
  .mobile-filter-row select,.mobile-filter-row button{
    flex-shrink:0;
    border:1px solid var(--border2);
    background:rgba(15,23,42,.68);
    color:var(--text);
    border-radius:9px;
    padding:8px 9px;
    font-size:13px;
  }
  .tabs{
    margin:8px 0 0;
    width:100%;
  }
  .tab{flex:1;min-width:0;padding:7px}
  .chart-overlay{
    left:8px;
    bottom:8px;
    right:8px;
    justify-content:space-between;
    padding:6px 8px;
  }
  .chart-overlay label{font-size:11px}
  #bubble-metric{font-size:12px;padding:6px}
  .table-card{border-radius:12px}
  .table-head{padding:7px 9px}
  th,td{padding:8px 9px;font-size:12px}
  .hide-mobile{display:none}
  .mobile-bottom-detail{
    display:block;
    position:absolute;
    left:8px;
    right:8px;
    bottom:8px;
    z-index:80;
    background:rgba(8,12,24,.94);
    border:1px solid var(--border2);
    border-radius:14px;
    padding:9px;
    backdrop-filter:blur(16px);
    box-shadow:var(--shadow);
    transform:translateY(145%);
    transition:transform .22s ease;
  }
  .mobile-bottom-detail.show{transform:translateY(0)}
  .mobile-detail-row{
    display:flex;align-items:center;gap:10px;
  }
  .mobile-detail-row img{
    width:54px;height:75px;border-radius:6px;object-fit:cover;border:1px solid var(--border2);
  }
  .mobile-detail-main{flex:1;min-width:0}
  .mobile-detail-name{
    color:#fff;font-weight:900;font-size:17px;
    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  }
  .mobile-detail-meta{color:var(--muted);font-size:12px}
  .mobile-detail-price{color:var(--up);font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:900}
  .mobile-detail-stats{
    display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;
  }
  .mobile-stat{
    border:1px solid var(--border);
    border-radius:9px;
    padding:7px;
  }
  .mobile-stat span{display:block;color:var(--muted);font-size:10px}
  .mobile-stat strong{font-family:'JetBrains Mono',monospace;font-size:12px}
}
</style>
</head>

<body>
<div class="app">
  <header class="topbar">
    <div class="brand">
      <div class="logo">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-8"/><path d="M22 19V3"/>
        </svg>
      </div>
      <div>
        <div class="brand-title">MTG Top 100 Live</div>
        <div class="brand-sub">Live Market Movers · tcgapi.dev</div>
      </div>
    </div>

    <div class="search-wrap">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="global-search" placeholder="Search cards, sets, or keywords..." autocomplete="off" spellcheck="false">
    </div>

    <div class="header-actions">
      <span class="badge"><span class="dot"></span><span id="live-label">Loading live data...</span></span>
      <button class="icon-btn" id="refresh-btn" title="Refresh">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>
      </button>
      <button class="icon-btn" id="theme-btn" title="Toggle theme">☾</button>
      <button class="icon-btn mobile-menu" id="mobile-menu-btn" title="Filters">☰</button>
    </div>
  </header>

  <div class="shell">
    <aside class="sidebar">
      <div class="side-scroll" id="desktop-filters"></div>
      <div class="stat-card" id="desktop-stats"></div>
    </aside>

    <main class="main">
      <section class="main-head">
        <div class="title-block">
          <div class="main-title">MTG Top 100 Live Market Movers</div>
          <div class="main-kicker" id="main-kicker">Bubble size = total sales. Showing top ranked cards.</div>
        </div>

        <div class="mobile-filter-row">
          <select id="mobile-period"></select>
          <select id="mobile-format"></select>
          <button id="mobile-filter-btn">Filters</button>
        </div>

        <div class="tabs">
          <button class="tab active" data-view="bubbles">Bubbles</button>
          <button class="tab" data-view="grid">Grid</button>
          <button class="tab" data-view="list">List</button>
        </div>
      </section>

      <section class="chart-card" id="chart-card">
        <svg id="bubble-svg"></svg>
        <div class="empty-state" id="empty-state">
          <div style="font-size:34px;opacity:.4">◈</div>
          <div class="mono">NO CARDS MATCH YOUR FILTERS</div>
        </div>
        <div class="chart-overlay">
          <label>Bubble Size</label>
          <select id="bubble-metric">
            <option value="weightedMoveScore" selected>Weighted Move</option>
            <option value="dollarChange">Dollar Change</option>
            <option value="marketPrice">Market Price</option>
            <option value="trendPct">Raw Trend %</option>
            <option value="copiesSold">Listings</option>
          </select>
          <label>Render</label>
          <input id="render-limit" type="range" min="25" max="100" step="25" value="75">
          <span id="render-limit-label" class="mono" style="font-size:12px;color:var(--text)">75</span>
        </div>
      </section>

      <section class="table-card">
        <div class="table-head">
          <div class="table-title" id="table-title">RANKINGS</div>
          <div class="page-controls">
            <button id="prev-page">‹</button>
            <span id="page-label" class="mono" style="font-size:12px;color:var(--muted)">1 / 1</span>
            <button id="next-page">›</button>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>RANK</th>
                <th>CARD</th>
                <th class="hide-mobile">SET</th>
                <th class="hide-mobile">RARITY</th>
                <th>MARKET ACTIVITY</th>
                <th>LISTINGS</th>
                <th>MARKET</th>
                <th>TREND</th>
              </tr>
            </thead>
            <tbody id="ranking-body"></tbody>
          </table>
        </div>
      </section>
    </main>

    <aside class="detail-side">
      <div class="detail-empty" id="detail-empty">
        <div style="font-size:36px;opacity:.34">◈</div>
        <div>Tap a bubble or ranking row to inspect a card.</div>
      </div>
      <div class="detail-content" id="detail-content"></div>
    </aside>
  </div>
</div>

<div class="drawer-backdrop" id="drawer-backdrop"></div>
<aside class="mobile-drawer" id="mobile-drawer">
  <div class="side-scroll" id="mobile-filters"></div>
  <div class="stat-card" id="mobile-stats"></div>
</aside>

<div class="mobile-bottom-detail" id="mobile-bottom-detail"></div>

<script>
/*
  BACKEND CONTRACT

  Preferred endpoint:
    GET /api/top-sales?period=30d&limit=100

  With DATA_PROVIDER=tcgapi-dev, this endpoint returns live Magic market movers
  from tcgapi.dev, enriched with Scryfall card identity data by the backend.

  Bubble size defaults to weightedMoveScore, not raw percentage.

  Never put TCGAPI_DEV_KEY in this frontend file.
*/

const API_URL = window.MTGMP_API_URL || "http://localhost:3000";
const TOP_SALES_ENDPOINT = "/api/top-sales";
const REFRESH_MS = 30 * 60 * 1000;

const MC = {
  W:{f:"#f7e7a0",s:"#d6b755",l:"White"},
  U:{f:"#38bdf8",s:"#0ea5e9",l:"Blue"},
  B:{f:"#a78bfa",s:"#7c3aed",l:"Black"},
  R:{f:"#fb7185",s:"#ef4444",l:"Red"},
  G:{f:"#4ade80",s:"#22c55e",l:"Green"},
  C:{f:"#94a3b8",s:"#64748b",l:"Colorless"}
};
const RARITY_COLORS = {Mythic:"#fb923c",Rare:"#facc15",Uncommon:"#38bdf8",Common:"#94a3b8"};
const PERIODS = [["24h","24 Hours"],["7d","7 Days"],["30d","30 Days"]];
const FORMATS = ["All Formats","Commander","Modern","Standard","Pioneer","Legacy","Vintage","Pauper"];
const RARITIES = ["Mythic","Rare","Uncommon","Common"];
const TYPE_OPTIONS = ["All Types","Creature","Artifact","Enchantment","Instant","Sorcery","Land","Planeswalker"];

let allCards = [];
let filteredCards = [];
let selectedCard = null;
let watchlist = [];
let viewMode = "bubbles";
let page = 1;
let pageSize = 25;
let renderLimit = 75;
let isDark = true;
let raf = null;
let nodes = [];

const state = {
  period:"30d",
  format:"All Formats",
  set:"All Sets",
  type:"All Types",
  rarities:new Set(RARITIES),
  minPrice:"",
  maxPrice:"",
  query:"",
  metric:"weightedMoveScore"
};

const $ = (id) => document.getElementById(id);
const money = (n) => "$" + Number(n || 0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const compactMoney = (n) => {
  n = Number(n||0);
  if(n >= 1_000_000) return "$" + (n/1_000_000).toFixed(2) + "M";
  if(n >= 1_000) return "$" + (n/1_000).toFixed(1) + "K";
  return money(n);
};
const intFmt = (n) => Number(n || 0).toLocaleString();
const tcgUrl = (name) => "https://www.tcgplayer.com/search/magic/product?productLineName=magic&q=" + encodeURIComponent(name) + "&view=grid&utm_source=mtgmarketpulse&utm_medium=affiliate";

function colorKey(card){
  const c = card.colors && card.colors.length ? card.colors : ["C"];
  if(c.length > 1) return "M";
  return c[0] || "C";
}
function colorFill(card){
  const key = colorKey(card);
  return key === "M" ? "#facc15" : (MC[key] || MC.C).f;
}
function colorStroke(card){
  const key = colorKey(card);
  return key === "M" ? "#d97706" : (MC[key] || MC.C).s;
}
function normalizeCard(c, i){
  const marketPrice = Number(c.marketPrice ?? c.price ?? c.tcgMarketPrice ?? 0);
  const trendPct = Number(c.trendPct ?? c.pct ?? c.changePct ?? 0);
  const copiesSold = Number(c.copiesSold ?? c.salesCount ?? c.quantitySold ?? 0);
  const totalSales = Number(c.totalSales ?? c.salesUsd ?? (copiesSold * marketPrice) ?? 0);
  const set = String(c.set ?? c.setCode ?? "").toUpperCase();
  const id = String(c.id ?? c.tcgplayerId ?? c.productId ?? (c.name + "-" + set + "-" + i));
  return {
    id,
    rank:Number(c.rank ?? i + 1),
    tcgplayerId:c.tcgplayerId ?? c.productId ?? null,
    name:String(c.name ?? "Unknown Card"),
    set,
    setName:String(c.setName ?? c.groupName ?? set ?? ""),
    rarity:titleCase(String(c.rarity ?? "Unknown")),
    colors:Array.isArray(c.colors) ? c.colors : (Array.isArray(c.colorIdentity) ? c.colorIdentity : ["C"]),
    formats:Array.isArray(c.formats) ? c.formats : [],
    typeLine:String(c.typeLine ?? c.type ?? ""),
    imageUrl:c.imageUrl ?? c.image ?? c.image_uris?.normal ?? "",
    totalSales,
    copiesSold,
    marketPrice,
    lowPrice:Number(c.lowPrice ?? c.tcgLowPrice ?? 0),
    midPrice:Number(c.midPrice ?? 0),
    highPrice:Number(c.highPrice ?? 0),
    directLow:Number(c.directLow ?? c.directLowPrice ?? 0),
    trendPct,
    productUrl:c.productUrl ?? c.tcgplayerUrl ?? (c.tcgplayerId ? "https://www.tcgplayer.com/product/" + c.tcgplayerId : tcgUrl(c.name ?? ""))
  };
}
function titleCase(s){
  if(!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

const MOCK = [
  {rank:1,name:"Demo Card Alpha",set:"DME",setName:"Demo Data",rarity:"Mythic",colors:["U"],totalSales:2613544.98,copiesSold:13752,marketPrice:174.99,trendPct:12.4,typeLine:"Artifact",formats:["Commander"],imageUrl:""},
  {rank:2,name:"Demo Card Beta",set:"DME",setName:"Demo Data",rarity:"Rare",colors:["W"],totalSales:1869166.50,copiesSold:9522,marketPrice:81.99,trendPct:8.7,typeLine:"Artifact",formats:["Commander"],imageUrl:""},
  {rank:3,name:"Demo Card Gamma",set:"DME",setName:"Demo Data",rarity:"Rare",colors:["R"],totalSales:1515132.20,copiesSold:7654,marketPrice:32.99,trendPct:15.3,typeLine:"Creature",formats:["Commander"],imageUrl:""},
  {rank:4,name:"Demo Card Delta",set:"DME",setName:"Demo Data",rarity:"Uncommon",colors:["G"],totalSales:1297278.45,copiesSold:8406,marketPrice:1.29,trendPct:3.2,typeLine:"Artifact",formats:["Commander"],imageUrl:""},
  {rank:5,name:"Demo Card Epsilon",set:"DME",setName:"Demo Data",rarity:"Mythic",colors:["B"],totalSales:945001.32,copiesSold:6890,marketPrice:49.99,trendPct:-2.1,typeLine:"Enchantment",formats:["Commander"],imageUrl:""},
  {rank:6,name:"Demo Card Zeta",set:"DME",setName:"Demo Data",rarity:"Rare",colors:["U","R"],totalSales:841201.32,copiesSold:5988,marketPrice:24.88,trendPct:4.9,typeLine:"Instant",formats:["Modern"],imageUrl:""},
  {rank:7,name:"Demo Card Eta",set:"DME",setName:"Demo Data",rarity:"Rare",colors:["G","W"],totalSales:753398.21,copiesSold:4521,marketPrice:35.99,trendPct:1.8,typeLine:"Enchantment",formats:["Commander"],imageUrl:""},
  {rank:8,name:"Demo Card Theta",set:"DME",setName:"Demo Data",rarity:"Mythic",colors:["B"],totalSales:646278.91,copiesSold:4021,marketPrice:74.49,trendPct:-1.4,typeLine:"Creature",formats:["Commander"],imageUrl:""},
  {rank:9,name:"Demo Card Iota",set:"DME",setName:"Demo Data",rarity:"Rare",colors:["R"],totalSales:584303.11,copiesSold:3411,marketPrice:14.99,trendPct:6.9,typeLine:"Creature",formats:["Pioneer"],imageUrl:""},
  {rank:10,name:"Demo Card Kappa",set:"DME",setName:"Demo Data",rarity:"Rare",colors:["C"],totalSales:630998.44,copiesSold:3014,marketPrice:42.99,trendPct:2.4,typeLine:"Land",formats:["Legacy"],imageUrl:""}
].map(normalizeCard);

async function loadData(){
  $("live-label").textContent = "Loading live data...";
  try{
    const url = API_URL + TOP_SALES_ENDPOINT + "?period=" + encodeURIComponent(state.period) + "&limit=100";
    const r = await fetch(url);
    if(!r.ok) throw new Error("API " + r.status);
    const data = await r.json();
    const cards = Array.isArray(data.cards) ? data.cards : (Array.isArray(data) ? data : []);
    if(!cards.length) throw new Error("No cards returned");
    allCards = cards.map(normalizeCard).sort((a,b)=>a.rank-b.rank);
    $("live-label").textContent = "Live tcgapi.dev data";
    setUpdatedText(data.updatedAt);
  }catch(e){
    console.warn("Top sales load failed. Using demo data.", e.message);
    allCards = generateDemoCards();
    $("live-label").textContent = "Demo mode";
    setUpdatedText(new Date().toISOString());
  }
  buildFilters();
  applyFilters();
}
function generateDemoCards(){
  const base = [];
  for(let i=0;i<1000;i++){
    const seed = MOCK[i % MOCK.length];
    base.push(normalizeCard({
      ...seed,
      rank:i+1,
      id:"demo-" + (i+1),
      name:i<10 ? seed.name : seed.name + " " + (i+1),
      totalSales:Math.max(2000, seed.totalSales * Math.pow(.987, i)),
      copiesSold:Math.max(10, Math.round(seed.copiesSold * Math.pow(.99, i))),
      marketPrice:Math.max(.25, seed.marketPrice * (0.65 + ((i%13)/20))),
      trendPct:((i%17)-8) * 1.4,
      set:["DME","CMM","LTR","MH3","FDN","WOE"][i%6],
      rarity:RARITIES[i%RARITIES.length],
      colors:[["W"],["U"],["B"],["R"],["G"],["C"],["W","U"],["B","R"]][i%8],
      typeLine:TYPE_OPTIONS[(i%7)+1],
      formats:[FORMATS[(i%5)+1]]
    }, i));
  }
  return base;
}
function setUpdatedText(updatedAt){
  const d = updatedAt ? new Date(updatedAt) : new Date();
  const txt = isNaN(d.getTime()) ? "Just now" : d.toLocaleString();
  document.querySelectorAll("[data-updated]").forEach(el=>el.textContent = txt);
}

function buildFilters(){
  const sets = ["All Sets", ...Array.from(new Set(allCards.map(c=>c.set).filter(Boolean))).sort()];
  const filterHtml = `
    <div class="side-title">
      <span>FILTERS</span>
      <button class="reset-btn" onclick="resetFilters()">Reset</button>
    </div>
    <div class="filter-group">
      <label class="filter-label">Time Period</label>
      <select class="filter-control js-period">${PERIODS.map(([v,l])=>`<option value="${v}" ${state.period===v?"selected":""}>${l}</option>`).join("")}</select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Format</label>
      <select class="filter-control js-format">${FORMATS.map(f=>`<option ${state.format===f?"selected":""}>${f}</option>`).join("")}</select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Set</label>
      <select class="filter-control js-set">${sets.map(s=>`<option ${state.set===s?"selected":""}>${s}</option>`).join("")}</select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Type</label>
      <select class="filter-control js-type">${TYPE_OPTIONS.map(t=>`<option ${state.type===t?"selected":""}>${t}</option>`).join("")}</select>
    </div>
    <div class="filter-group">
      <label class="filter-label">Rarity</label>
      <div class="check-grid">
        ${RARITIES.map(r=>`
          <label class="check-row">
            <input type="checkbox" class="js-rarity" value="${r}" ${state.rarities.has(r)?"checked":""}>
            <span style="color:${RARITY_COLORS[r]}">◆</span>
            <span>${r}</span>
          </label>
        `).join("")}
      </div>
    </div>
    <div class="filter-group">
      <label class="filter-label">Market Price</label>
      <div class="price-row">
        <input class="filter-control js-min-price mono" inputmode="decimal" placeholder="$0.00" value="${state.minPrice}">
        <span style="color:var(--muted)">to</span>
        <input class="filter-control js-max-price mono" inputmode="decimal" placeholder="No max" value="${state.maxPrice}">
      </div>
    </div>
    <button class="apply-btn js-apply">Apply Filters</button>
  `;
  $("desktop-filters").innerHTML = filterHtml;
  $("mobile-filters").innerHTML = filterHtml;

  fillMobileQuickFilters();

  document.querySelectorAll(".js-period").forEach(el=>el.onchange = async () => {
    state.period = el.value;
    syncFilterValues();
    await loadData();
  });
  document.querySelectorAll(".js-format").forEach(el=>el.onchange = () => { state.format = el.value; syncFilterValues(); applyFilters(); });
  document.querySelectorAll(".js-set").forEach(el=>el.onchange = () => { state.set = el.value; syncFilterValues(); applyFilters(); });
  document.querySelectorAll(".js-type").forEach(el=>el.onchange = () => { state.type = el.value; syncFilterValues(); applyFilters(); });
  document.querySelectorAll(".js-rarity").forEach(el=>el.onchange = () => {
    const checked = Array.from(document.querySelectorAll(".js-rarity:checked")).map(x=>x.value);
    state.rarities = new Set(checked);
    syncFilterValues();
    applyFilters();
  });
  document.querySelectorAll(".js-apply").forEach(el=>el.onclick = () => {
    const min = document.querySelector(".js-min-price").value.trim();
    const max = document.querySelector(".js-max-price").value.trim();
    state.minPrice = min;
    state.maxPrice = max;
    syncFilterValues();
    applyFilters();
    closeMobileDrawer();
  });
}
function fillMobileQuickFilters(){
  $("mobile-period").innerHTML = PERIODS.map(([v,l])=>`<option value="${v}" ${state.period===v?"selected":""}>${l}</option>`).join("");
  $("mobile-format").innerHTML = FORMATS.map(f=>`<option ${state.format===f?"selected":""}>${f}</option>`).join("");
  $("mobile-period").onchange = async (e)=>{ state.period = e.target.value; await loadData(); };
  $("mobile-format").onchange = (e)=>{ state.format = e.target.value; applyFilters(); };
}
function syncFilterValues(){
  document.querySelectorAll(".js-period").forEach(x=>x.value=state.period);
  document.querySelectorAll(".js-format").forEach(x=>x.value=state.format);
  document.querySelectorAll(".js-set").forEach(x=>x.value=state.set);
  document.querySelectorAll(".js-type").forEach(x=>x.value=state.type);
  document.querySelectorAll(".js-rarity").forEach(x=>x.checked=state.rarities.has(x.value));
  document.querySelectorAll(".js-min-price").forEach(x=>x.value=state.minPrice);
  document.querySelectorAll(".js-max-price").forEach(x=>x.value=state.maxPrice);
  fillMobileQuickFilters();
}
function resetFilters(){
  state.format = "All Formats";
  state.set = "All Sets";
  state.type = "All Types";
  state.rarities = new Set(RARITIES);
  state.minPrice = "";
  state.maxPrice = "";
  state.query = "";
  $("global-search").value = "";
  syncFilterValues();
  applyFilters();
}
function applyFilters(){
  const q = state.query.toLowerCase().trim();
  const min = parseFloat(String(state.minPrice).replace(/[^0-9.]/g,""));
  const max = parseFloat(String(state.maxPrice).replace(/[^0-9.]/g,""));
  filteredCards = allCards.filter(c=>{
    if(q && !(`${c.name} ${c.set} ${c.setName} ${c.rarity} ${c.typeLine}`.toLowerCase().includes(q))) return false;
    if(state.format !== "All Formats" && !(c.formats||[]).includes(state.format)) return false;
    if(state.set !== "All Sets" && c.set !== state.set) return false;
    if(state.type !== "All Types" && !String(c.typeLine||"").toLowerCase().includes(state.type.toLowerCase())) return false;
    if(!state.rarities.has(c.rarity)) return false;
    if(!isNaN(min) && c.marketPrice < min) return false;
    if(!isNaN(max) && c.marketPrice > max) return false;
    return true;
  }).sort((a,b)=>a.rank-b.rank);
  page = 1;
  updateStats();
  renderAll();
}
function updateStats(){
  const totalCards = filteredCards.length;
  const copies = filteredCards.reduce((s,c)=>s+c.copiesSold,0);
  const sales = filteredCards.reduce((s,c)=>s+c.totalSales,0);
  const avg = totalCards ? filteredCards.reduce((s,c)=>s+c.marketPrice,0)/totalCards : 0;
  const sets = new Set(filteredCards.map(c=>c.set).filter(Boolean)).size;
  const html = `
    <div class="stat-title">STATS (${PERIODS.find(p=>p[0]===state.period)?.[1] || state.period})</div>
    <div class="stat-row"><span>Total Cards</span><strong>${intFmt(totalCards)}</strong></div>
    <div class="stat-row"><span>Total Listings</span><strong>${intFmt(copies)}</strong></div>
    <div class="stat-row"><span>Market Activity</span><strong>${money(sales)}</strong></div>
    <div class="stat-row"><span>Average Market Price</span><strong>${money(avg)}</strong></div>
    <div class="stat-row"><span>Sets Represented</span><strong>${intFmt(sets)}</strong></div>
    <div class="stat-row"><span>Updated</span><strong class="updated" data-updated>${new Date().toLocaleString()}</strong></div>
  `;
  $("desktop-stats").innerHTML = html;
  $("mobile-stats").innerHTML = html;
  $("table-title").textContent = `RANKINGS · ${intFmt(totalCards)} CARDS`;
  $("main-kicker").textContent = `${PERIODS.find(p=>p[0]===state.period)?.[1] || state.period} · Bubble size = ${metricLabel(state.metric)} · Showing ${Math.min(renderLimit,totalCards)} of ${intFmt(totalCards)} filtered cards.`;
}
function metricLabel(m){
  return {
    weightedMoveScore:"weighted move",
    dollarChange:"dollar change",
    totalSales:"market activity",
    copiesSold:"listings",
    marketPrice:"market price",
    trendPct:"raw trend percentage"
  }[m] || m;
}

function renderAll(){
  renderTable();
  renderBubbles();
  if(selectedCard){
    const still = filteredCards.find(c=>c.id===selectedCard.id) || allCards.find(c=>c.id===selectedCard.id);
    if(still) selectCard(still, false);
  }
}
function renderTable(){
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  page = Math.min(page,totalPages);
  const start = (page-1)*pageSize;
  const rows = filteredCards.slice(start,start+pageSize);
  $("page-label").textContent = `${page} / ${totalPages}`;
  $("ranking-body").innerHTML = rows.map(c=>{
    const trendClass = c.trendPct >= 0 ? "up" : "down";
    const trend = (c.trendPct >= 0 ? "↑ " : "↓ ") + Math.abs(c.trendPct).toFixed(1) + "%";
    return `
      <tr onclick="selectCardById('${String(c.id).replace(/'/g,"\\'")}')">
        <td class="rank-cell">${c.rank}</td>
        <td>
          <div class="card-name-cell">
            ${c.imageUrl ? `<img class="thumb" src="${c.imageUrl}" loading="lazy" alt="">` : `<span class="thumb" style="display:inline-block;background:${colorFill(c)}22"></span>`}
            <span>${escapeHtml(c.name)}</span>
          </div>
        </td>
        <td class="hide-mobile">${escapeHtml(c.setName || c.set)}</td>
        <td class="hide-mobile" style="color:${RARITY_COLORS[c.rarity]||"var(--text)"}">${escapeHtml(c.rarity)}</td>
        <td class="money">${money(c.totalSales)}</td>
        <td class="money">${intFmt(c.copiesSold)}</td>
        <td class="money">${money(c.marketPrice)}</td>
        <td class="${trendClass} mono">${trend}</td>
      </tr>
    `;
  }).join("");
}
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));
}

function renderBubbles(){
  const area = $("chart-card");
  const svg = $("bubble-svg");
  const W = area.clientWidth || 800;
  const H = area.clientHeight || 420;
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);

  if(raf) cancelAnimationFrame(raf);

  if(!filteredCards.length){
    svg.innerHTML = "";
    $("empty-state").classList.add("show");
    return;
  }

  $("empty-state").classList.remove("show");

  const cards = filteredCards.slice(0, renderLimit);
  const count = Math.max(1, cards.length);

  /*
    Screen-aware bubble sizing.

    We estimate available area and divide it across the number of bubbles.
    Then we cap the largest bubble so it cannot consume the whole viewport.

    This keeps 25 bubbles dramatic, 75 bubbles readable, and 100 bubbles usable.
  */
  const areaPx = Math.max(1, W * H);
  const densityRadius = Math.sqrt(areaPx / (count * Math.PI));
  const mobile = window.innerWidth < 940;

  const minR = mobile
    ? clamp(densityRadius * 0.32, 8, 16)
    : clamp(densityRadius * 0.34, 10, 18);

  const maxR = mobile
    ? clamp(densityRadius * 1.55, 24, Math.min(W, H) * 0.125)
    : clamp(densityRadius * 1.75, 30, Math.min(W, H) * 0.145);

  const values = cards.map(c => Math.abs(Number(c[state.metric] || c.bubbleScore || c.weightedMoveScore || 0)));
  const maxVal = Math.max(...values, 1);

  /*
    Sqrt scale prevents the top mover from becoming absurdly huge.
    weightedMoveScore is the default metric, so penny spikes are already controlled.
  */
  const rScale = d3.scaleSqrt()
    .domain([0, maxVal])
    .range([minR, maxR])
    .clamp(true);

  nodes = cards.map((c,i)=>{
    const a = (i / count) * Math.PI * 2;
    const ring = Math.sqrt(i / count);
    const spread = Math.min(W, H) * (mobile ? 0.22 : 0.27) * ring;
    const metricValue = Math.abs(Number(c[state.metric] || c.bubbleScore || c.weightedMoveScore || 0));
    const r = Math.max(minR, Math.min(maxR, rScale(metricValue)));

    return {
      ...c,
      r,
      x: W / 2 + Math.cos(a) * spread + (Math.random() - 0.5) * Math.min(24, densityRadius),
      y: H / 2 + Math.sin(a) * spread + (Math.random() - 0.5) * Math.min(24, densityRadius),
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      mass: r * r
    };
  });

  drawBubbleSvg(W,H);
  tickPhysics(W,H);
}
function drawBubbleSvg(W,H){
  const defs = `
    <defs>
      <pattern id="stars" x="0" y="0" width="34" height="34" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r=".85" fill="${isDark ? "#263957" : "#cbd5e1"}" opacity=".65"/>
      </pattern>
      <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;
  const bg = `
    <rect width="${W}" height="${H}" fill="${isDark ? "#050711" : "#eef2ff"}"/>
    <rect width="${W}" height="${H}" fill="url(#stars)" opacity="${isDark ? 1 : .55}"/>
  `;
  const body = nodes.map(n=>{
    const fill = colorFill(n), stroke = colorStroke(n);
    const isBig = n.r > 46;
    const showName = n.r > 28;
    const showImg = n.imageUrl && n.r > 24;
    const rankY = -n.r + 16;
    const labelY = showImg ? n.r * .35 : -4;
    const subY = labelY + 16;
    const metricText = state.metric === "weightedMoveScore" ? "W " + Number(n.weightedMoveScore || 0).toFixed(2) :
      state.metric === "dollarChange" ? (n.dollarChange >= 0 ? "+" : "-") + "$" + Math.abs(Number(n.dollarChange || 0)).toFixed(2) :
      state.metric === "copiesSold" ? intFmt(n.copiesSold) :
      state.metric === "marketPrice" ? money(n.marketPrice) :
      state.metric === "trendPct" ? (n.trendPct>=0?"+":"") + n.trendPct.toFixed(1) + "%" :
      compactMoney(n.totalSales);
    const imgSize = Math.min(n.r*1.02, 74);
    const imgY = showName ? -imgSize*.66 : -imgSize/2;
    const clipId = "clip-" + safeId(n.id);
    const gradId = "grad-" + safeId(n.id);
    return `
      <g data-bubble-id="${escapeAttr(n.id)}" transform="translate(${n.x.toFixed(1)},${n.y.toFixed(1)})" onclick="selectCardById('${String(n.id).replace(/'/g,"\\'")}')" style="cursor:pointer">
        <defs>
          <radialGradient id="${gradId}" cx="35%" cy="25%" r="78%">
            <stop offset="0%" stop-color="#fff" stop-opacity=".72"/>
            <stop offset="23%" stop-color="${fill}" stop-opacity=".95"/>
            <stop offset="72%" stop-color="${fill}" stop-opacity=".38"/>
            <stop offset="100%" stop-color="#020617" stop-opacity=".96"/>
          </radialGradient>
          <clipPath id="${clipId}">
            <rect x="${(-imgSize/2).toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgSize.toFixed(1)}" height="${imgSize.toFixed(1)}" rx="7" ry="7"/>
          </clipPath>
        </defs>
        <circle r="${(n.r*1.35).toFixed(1)}" fill="${fill}" opacity=".12" filter="url(#softGlow)"/>
        <circle r="${n.r.toFixed(1)}" fill="url(#${gradId})" stroke="${stroke}" stroke-width="${isBig?2.4:1.5}"/>
        <circle r="${(n.r-3).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity=".10"/>
        <circle cx="0" cy="${rankY}" r="${Math.max(10,Math.min(17,n.r*.23)).toFixed(1)}" fill="rgba(2,6,23,.82)" stroke="${stroke}" stroke-width="1.5"/>
        <text class="bubble-label mono" x="0" y="${rankY+1}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="${Math.max(8,Math.min(14,n.r*.21)).toFixed(1)}" font-weight="700">${n.rank}</text>
        ${showImg ? `<image href="${n.imageUrl}" x="${(-imgSize/2).toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgSize.toFixed(1)}" height="${imgSize.toFixed(1)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>
        <rect x="${(-imgSize/2).toFixed(1)}" y="${imgY.toFixed(1)}" width="${imgSize.toFixed(1)}" height="${imgSize.toFixed(1)}" rx="7" fill="none" stroke="#fff" stroke-opacity=".35"/>` : ""}
        ${showName ? `<text class="bubble-label" x="0" y="${labelY.toFixed(1)}" text-anchor="middle" fill="#fff" font-size="${Math.max(9,Math.min(16,n.r*.21)).toFixed(1)}" font-weight="900">${truncate(n.name, n.r > 60 ? 18 : 13)}</text>` : `<title>${escapeHtml(n.name)}</title>`}
        ${isBig ? `<text class="bubble-label mono" x="0" y="${subY.toFixed(1)}" text-anchor="middle" fill="#fff" font-size="${Math.max(9,Math.min(15,n.r*.18)).toFixed(1)}" font-weight="700">${metricText}</text>` : ""}
      </g>
    `;
  }).join("");
  $("bubble-svg").innerHTML = defs + bg + body;
}
function safeId(id){return String(id).replace(/[^a-zA-Z0-9_-]/g,"_");}
function escapeAttr(s){return String(s).replace(/"/g,"&quot;");}
function truncate(s,n){s=String(s); return s.length > n ? s.slice(0,n-1) + "…" : s;}

function tickPhysics(baseW,baseH){
  const area = $("chart-card");

  /*
    Count-aware physics.

    More bubbles = slower, calmer interaction.
    Fewer bubbles = slightly more motion and drama.
  */
  const count = Math.max(1, nodes.length);
  const crowd = clamp(count / 100, 0, 1);

  const GAP = count > 120 ? 1.5 : count > 75 ? 2 : 3;

  // Higher damping number means less drag; lower means slower.
  const DAMP = lerp(0.91, 0.82, crowd);

  // Less gravity and less jitter when crowded.
  const GRAV = lerp(0.006, 0.0022, crowd);
  const NOISE = lerp(0.010, 0.0018, crowd);

  // Dramatically reduce max speed as bubble count increases.
  const MAX_V = lerp(1.05, 0.28, crowd);

  // Softer wall and collision response when crowded.
  const WALL = lerp(0.12, 0.055, crowd);
  const COLLISION_ITERATIONS = count > 150 ? 1 : count > 90 ? 2 : 3;

  function tick(){
    const W = area.clientWidth || baseW;
    const H = area.clientHeight || baseH;

    for(const n of nodes){
      n.vx += (Math.random() - 0.5) * NOISE;
      n.vy += (Math.random() - 0.5) * NOISE;

      n.vx += (W / 2 - n.x) * GRAV;
      n.vy += (H / 2 - n.y) * GRAV;

      n.vx *= DAMP;
      n.vy *= DAMP;

      const sp = Math.hypot(n.vx,n.vy);
      if(sp > MAX_V){
        n.vx = n.vx / sp * MAX_V;
        n.vy = n.vy / sp * MAX_V;
      }

      n.x += n.vx;
      n.y += n.vy;

      const pad = n.r + GAP;

      if(n.x < pad) n.vx += (pad - n.x) * WALL;
      if(n.x > W - pad) n.vx -= (n.x - (W - pad)) * WALL;
      if(n.y < pad) n.vy += (pad - n.y) * WALL;
      if(n.y > H - pad) n.vy -= (n.y - (H - pad)) * WALL;

      n.x = Math.max(pad, Math.min(W - pad, n.x));
      n.y = Math.max(pad, Math.min(H - pad, n.y));
    }

    /*
      Collision separation.
      This still prevents most overlap, but avoids violent movement when crowded.
    */
    for(let iter = 0; iter < COLLISION_ITERATIONS; iter++){
      for(let i = 0; i < nodes.length; i++){
        for(let j = i + 1; j < nodes.length; j++){
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist2 = dx * dx + dy * dy;
          const target = a.r + b.r + GAP;

          if(dist2 >= target * target || dist2 < 0.0001) continue;

          const dist = Math.sqrt(dist2);
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = target - dist;
          const tm = a.mass + b.mass;

          const correction = overlap * lerp(0.82, 0.48, crowd);

          a.x -= nx * correction * (b.mass / tm);
          a.y -= ny * correction * (b.mass / tm);
          b.x += nx * correction * (a.mass / tm);
          b.y += ny * correction * (a.mass / tm);

          // Small velocity nudge only. This avoids hyperactive bouncing.
          const push = (overlap / target) * lerp(0.05, 0.012, crowd);
          a.vx -= nx * push;
          a.vy -= ny * push;
          b.vx += nx * push;
          b.vy += ny * push;
        }
      }
    }

    for(const n of nodes){
      const el = document.querySelector(`[data-bubble-id="${CSS.escape(String(n.id))}"]`);
      if(el) el.setAttribute("transform", `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
    }

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
}

function selectCardById(id){
  const card = allCards.find(c=>String(c.id)===String(id)) || filteredCards.find(c=>String(c.id)===String(id));
  if(card) selectCard(card, true);
}
function selectCard(card, scroll){
  selectedCard = card;
  renderDetailSide(card);
  renderMobileDetail(card);
  if(scroll && window.innerWidth < 940){
    $("mobile-bottom-detail").classList.add("show");
  }
}
function renderDetailSide(c){
  $("detail-empty").style.display = "none";
  const dc = $("detail-content");
  dc.classList.add("show");
  const trendClass = c.trendPct >= 0 ? "up" : "down";
  const isWatching = watchlist.some(w=>w.id===c.id);
  dc.innerHTML = `
    ${c.imageUrl ? `<img class="detail-img" src="${c.imageUrl}" alt="${escapeAttr(c.name)}">` : `<div class="detail-img" style="height:420px;display:grid;place-items:center;color:var(--muted2)">No Image</div>`}
    <div class="detail-rank">#${c.rank} Top Sales</div>
    <div class="detail-name">${escapeHtml(c.name)}</div>
    <div class="detail-meta">${escapeHtml(c.setName || c.set)} · ${escapeHtml(c.set)} · <span style="color:${RARITY_COLORS[c.rarity]||"var(--text)"}">${escapeHtml(c.rarity)}</span></div>
    <div class="detail-grid">
      <div class="detail-row"><span>Market Activity (${state.period})</span><strong>${money(c.totalSales)}</strong></div>
      <div class="detail-row"><span>Listings</span><strong>${intFmt(c.copiesSold)}</strong></div>
      <div class="detail-row"><span>Market Price</span><strong>${money(c.marketPrice)}</strong></div>
      <div class="detail-row"><span>Previous Price</span><strong>${money(c.previousPrice)}</strong></div>
      <div class="detail-row"><span>Dollar Change</span><strong class="${c.dollarChange>=0?'up':'down'}">${c.dollarChange>=0?'+':'-'}${money(Math.abs(c.dollarChange || 0))}</strong></div>
      <div class="detail-row"><span>Weighted Move Score</span><strong>${Number(c.weightedMoveScore || 0).toFixed(2)}</strong></div>
      <div class="detail-row"><span>Low Price</span><strong>${money(c.lowPrice)}</strong></div>
      <div class="detail-row"><span>Mid Price</span><strong>${money(c.midPrice)}</strong></div>
      <div class="detail-row"><span>High Price</span><strong>${money(c.highPrice)}</strong></div>
      <div class="detail-row"><span>Direct Low</span><strong>${money(c.directLow)}</strong></div>
      <div class="detail-row"><span>Trend</span><strong class="${trendClass}">${c.trendPct>=0?"+":""}${c.trendPct.toFixed(1)}%</strong></div>
    </div>
    <a class="buy-btn" href="${c.productUrl || tcgUrl(c.name)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">View on TCGPlayer ↗</a>
    <button class="watch-btn" onclick="toggleWatch('${String(c.id).replace(/'/g,"\\'")}')">${isWatching ? "★ Remove from Watchlist" : "☆ Add to Watchlist"}</button>
  `;
}
function renderMobileDetail(c){
  const trendClass = c.trendPct >= 0 ? "up" : "down";
  const el = $("mobile-bottom-detail");
  el.innerHTML = `
    <div class="mobile-detail-row" onclick="openMobileDetailFull()">
      ${c.imageUrl ? `<img src="${c.imageUrl}" alt="">` : `<div style="width:54px;height:75px;border-radius:6px;background:${colorFill(c)}22"></div>`}
      <div class="mobile-detail-main">
        <div class="mobile-detail-name">${escapeHtml(c.name)}</div>
        <div class="mobile-detail-meta">${escapeHtml(c.setName || c.set)} · ${escapeHtml(c.rarity)}</div>
        <div class="mobile-detail-price">${money(c.marketPrice)}</div>
      </div>
      <a href="${c.productUrl || tcgUrl(c.name)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" style="color:#c4b5fd;text-decoration:none;font-weight:900">BUY</a>
    </div>
    <div class="mobile-detail-stats">
      <div class="mobile-stat"><span>Market Activity</span><strong>${compactMoney(c.totalSales)}</strong></div>
      <div class="mobile-stat"><span>Listings</span><strong>${intFmt(c.copiesSold)}</strong></div>
      <div class="mobile-stat"><span>Trend</span><strong class="${trendClass}">${c.trendPct>=0?"+":""}${c.trendPct.toFixed(1)}%</strong></div>
    </div>
  `;
}
function openMobileDetailFull(){
  openMobileDrawer();
}
function toggleWatch(id){
  const c = allCards.find(x=>String(x.id)===String(id));
  if(!c) return;
  if(watchlist.some(w=>String(w.id)===String(id))){
    watchlist = watchlist.filter(w=>String(w.id)!==String(id));
  } else {
    watchlist.push({id:c.id,name:c.name});
  }
  localStorage.setItem("mtgtop1000_watchlist", JSON.stringify(watchlist));
  renderDetailSide(c);
}

function openMobileDrawer(){
  $("mobile-drawer").classList.add("open");
  $("drawer-backdrop").classList.add("show");
}
function closeMobileDrawer(){
  $("mobile-drawer").classList.remove("open");
  $("drawer-backdrop").classList.remove("show");
}

function toggleTheme(){
  isDark = !isDark;
  document.body.classList.toggle("light", !isDark);
  $("theme-btn").textContent = isDark ? "☾" : "☀";
  localStorage.setItem("mtgtop1000_theme", isDark ? "dark" : "light");
  renderBubbles();
}

function setView(v){
  viewMode = v;
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===v));
  if(v === "bubbles"){
    $("chart-card").style.display = "";
    document.querySelector(".table-card").style.display = "";
    document.querySelector(".main").style.gridTemplateRows = window.innerWidth < 940 ? "auto 1fr 160px" : "auto 1fr 220px";
  } else if(v === "grid"){
    $("chart-card").style.display = "none";
    document.querySelector(".table-card").style.display = "";
    document.querySelector(".main").style.gridTemplateRows = "auto 1fr";
  } else {
    $("chart-card").style.display = "none";
    document.querySelector(".table-card").style.display = "";
    document.querySelector(".main").style.gridTemplateRows = "auto 1fr";
  }
  renderTable();
}

function initEvents(){
  $("global-search").addEventListener("input", e=>{
    state.query = e.target.value;
    applyFilters();
  });
  $("bubble-metric").addEventListener("change", e=>{
    state.metric = e.target.value;
    updateStats();
    renderBubbles();
  });
  $("render-limit").addEventListener("input", e=>{
    renderLimit = Number(e.target.value);
    $("render-limit-label").textContent = renderLimit;
    updateStats();
    renderBubbles();
  });
  $("prev-page").onclick = () => { if(page>1){ page--; renderTable(); } };
  $("next-page").onclick = () => {
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
    if(page<totalPages){ page++; renderTable(); }
  };
  $("refresh-btn").onclick = loadData;
  $("theme-btn").onclick = toggleTheme;
  $("mobile-menu-btn").onclick = openMobileDrawer;
  $("mobile-filter-btn").onclick = openMobileDrawer;
  $("drawer-backdrop").onclick = closeMobileDrawer;
  document.querySelectorAll(".tab").forEach(t=>t.onclick = () => setView(t.dataset.view));
  window.addEventListener("resize", debounce(()=>{ renderBubbles(); setView(viewMode); }, 220));
  document.addEventListener("keydown", e=>{ if(e.key === "Escape") closeMobileDrawer(); });
}

function clamp(value, min, max){
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t){
  return a + (b - a) * clamp(t, 0, 1);
}

function debounce(fn, ms){
  let t;
  return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),ms); };
}

(function boot(){
  try{
    watchlist = JSON.parse(localStorage.getItem("mtgtop1000_watchlist") || "[]");
  }catch{ watchlist = []; }
  try{
    if(localStorage.getItem("mtgtop1000_theme") === "light"){
      isDark = false;
      document.body.classList.add("light");
      $("theme-btn").textContent = "☀";
    }
  }catch{}
  initEvents();
  loadData();
  setInterval(loadData, REFRESH_MS);
})();
</script>
</body>
</html>
