// const handleViewContest = (fixture)=>{
//   console.log ('navigating to view contest');
//   navigate(`/user/viewContest/${fixture.id}`)
// }





import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ('../../styles/UserMatches.css')
import { useNavigate } from 'react-router-dom';

/* ─── tiny icon helpers (inline SVG, no deps) ─── */
const Icon = {
  Cricket: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3L6 21M9 6l9 9M6 9l3-3M15 18l3-3" />
    </svg>
  ),
  Sync: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:14,height:14}}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17a2 2 0 0 1-2 2H6M14 14.66V17a2 2 0 0 1 2 2h2M6 2h12v7a6 6 0 0 1-12 0V2z" />
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:12,height:12}}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Cal: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:11,height:11}}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

/* ─── helpers ─── */
const formatDate = (utcDate) => {
  const date = new Date(utcDate);
  return date.toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const getCountdown = (utcDate) => {
  const diff = new Date(utcDate) - Date.now();
  if (diff <= 0) return 'Live / Completed';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `Starts in ${Math.floor(h / 24)}d ${h % 24}h`;
  return `Starts in ${h}h ${m}m`;
};

/* fake odds just for display flair; remove if you have real odds */
const fakeOdds = (id) => {
  const seed = (id * 9301 + 49297) % 233280;
  const r = seed / 233280;
  const home = (1.4 + r * 2.2).toFixed(2);
  const draw = (2.8 + r * 1.5).toFixed(2);
  const away = (1.4 + (1 - r) * 2.2).toFixed(2);
  return { home, draw, away };
};

/* ─── Toast ─── */
const ToastContainer = ({ toasts }) => (
  <div className="am-toast-wrap">
    {toasts.map(t => (
      <div key={t.id} className={`am-toast${t.type === 'error' ? ' error' : ''}`}>
        {t.msg}
      </div>
    ))}
  </div>
);

/* ─── Fixture Card ─── */
const FixtureCard = ({ fixture, onViewSquad, onViewContest }) => {
  const odds = fakeOdds(fixture.id);
  const countdown = getCountdown(fixture.dateTime);
  const isLive = countdown === 'Live / Completed';

  return (
    <div className="am-fixture-card">
      {/* header */}
      <div className="am-card-header">
        <div className="am-card-header-left">
          {isLive && <span className="am-live-dot" />}
          <span className="am-match-type-badge">{fixture.matchType || 'T20'}</span>
          <span className="am-match-id">#{fixture.id}</span>
        </div>
        <div className="am-card-date">
          <Icon.Cal />
          {formatDate(fixture.dateTime)}
        </div>
      </div>

      {/* round label */}
      {fixture.matchName && (
        <div className="am-match-round">{fixture.matchName}</div>
      )}

      {/* teams */}
      <div className="am-teams">
        <div className="am-team">
          <div className="am-team-logo-wrap">
            <img
              src={fixture.homeTeam.image}
              alt={fixture.homeTeam.name}
              onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/60x60/1a2235/00d68f?text=${fixture.homeTeam.code || '?'}`; }}
            />
          </div>
          <div>
            <div className="am-team-name">{fixture.homeTeam.name}</div>
            <div className="am-team-code">{fixture.homeTeam.code}</div>
          </div>
        </div>

        <div className="am-vs-block">
          <div className="am-vs-divider" />
          <div className="am-vs-text">VS</div>
          <div className="am-vs-divider" />
        </div>

        <div className="am-team">
          <div className="am-team-logo-wrap">
            <img
              src={fixture.awayTeam.image}
              alt={fixture.awayTeam.name}
              onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/60x60/1a2235/00d68f?text=${fixture.awayTeam.code || '?'}`; }}
            />
          </div>
          <div>
            <div className="am-team-name">{fixture.awayTeam.name}</div>
            <div className="am-team-code">{fixture.awayTeam.code}</div>
          </div>
        </div>
      </div>

      {/* odds */}
      <div className="am-odds-strip">
        <div className="am-odd">
          <div className="am-odd-label">{fixture.homeTeam.code || 'HOME'}</div>
          <div className="am-odd-value">{odds.home}</div>
        </div>
        <div className="am-odd">
          <div className="am-odd-label">Draw</div>
          <div className="am-odd-value">{odds.draw}</div>
        </div>
        <div className="am-odd">
          <div className="am-odd-label">{fixture.awayTeam.code || 'AWAY'}</div>
          <div className="am-odd-value">{odds.away}</div>
        </div>
      </div>

      {/* countdown */}
      <div className="am-countdown">
        {isLive
          ? <strong style={{ color: 'var(--red)' }}>● Live / Completed</strong>
          : <><Icon.Cal /> &nbsp;<strong>{countdown}</strong></>
        }
      </div>

      {/* action buttons */}
      <div className="am-card-actions">
        {/* <button className="am-action-btn am-btn-squad" onClick={() => onViewSquad(fixture)}>
          <Icon.Users /> Squad
        </button> */}
        <button className="am-action-btn am-btn-view" onClick={() => onViewContest(fixture)}>
          <Icon.Eye /> view Contests
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const AdminMatches = () => {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const fetchFixtures = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/fixtures/FetchFromDB/getFixtures');
      if (response.data.success) {
        const filteredFixtures = response.data.data.map(fixture => ({
          id: fixture.id,
          matchName: fixture.round,
          dateTime: fixture.starting_at,
          matchType: fixture.type,
          homeTeam: { name: fixture.localteam_name, code: fixture.localteam_code, image: fixture.localteam_image },
          awayTeam: { name: fixture.visitorteam_name, code: fixture.visitorteam_code, image: fixture.visitorteam_image },
        }));
        setFixtures(filteredFixtures);
      } else {
        throw new Error('Failed to fetch fixtures');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFixtures(); }, [fetchFixtures]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/admin/fixtures/admin/savefixtures',
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      addToast(data.message.includes('0 fixtures') ? 'No new matches to sync.' : `Synced: ${data.message}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleRefreshFixtures = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(
        'http://localhost:5000/api/admin/fixtures/FetchFromDB/getFixtures',
        { headers: { Expires: '0' } }
      );
      if (response.data.success) {
        setFixtures(response.data.data);
        addToast('Fixtures refreshed successfully!');
      } else {
        addToast('No updates found.', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to refresh', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  const handleCreateContest = (fixture) => {
    navigate(`/admin/create-contest/${fixture.id}`, {
      state: {
        match_title: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
        home_team: fixture.homeTeam.name,
        away_team: fixture.awayTeam.name,
        start_time: fixture.dateTime,
      },
    });
  };

  const handleViewSquad = (fixture) => {
    navigate(`/admin/view-squad/${fixture.id}`, {
      state: {
        match_title: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
        home_team: fixture.homeTeam.name,
        away_team: fixture.awayTeam.name,
        start_time: fixture.dateTime,
      },
    });
  };

  const handleViewContest = (fixture) => {
    navigate(`/user/viewContest/${fixture.id}`);
  };

  /* ── render states ── */
  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar onSync={handleSync} onRefresh={handleRefreshFixtures} onLogout={handleLogout} syncing={false} refreshing={false} />
      <div className="am-loading">
        <div className="am-spinner" />
        <div className="am-loading-text">Fetching live fixtures…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar onSync={handleSync} onRefresh={handleRefreshFixtures} onLogout={handleLogout} syncing={false} refreshing={false} />
      <div className="am-error">
        <div className="am-error-icon">⚠</div>
        <div>{error}</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* topbar */}
      <Topbar
        onSync={handleSync}
        onRefresh={handleRefreshFixtures}
        onLogout={handleLogout}
        syncing={syncing}
        refreshing={refreshing}
      />

      {/* ticker */}
      <div className="am-ticker">
        <div className="am-ticker-item">🏏 <strong>IPL 2025</strong> — Playoffs underway</div>
        <div className="am-ticker-item">🟢 <strong>Live Markets</strong> open</div>
        <div className="am-ticker-item">📢 New fixtures synced today</div>
        <div className="am-ticker-item">🏆 <strong>{fixtures.length}</strong> matches scheduled</div>
      </div>

      <div className="am-page">
        {/* page header */}
        <div className="am-page-header">
          <div>
            <div className="am-page-title">Upcoming <span>Matches</span></div>
            <div className="am-page-subtitle">{fixtures.length} fixtures loaded · Admin panel</div>
          </div>
        </div>

        {/* stats row */}
        <div className="am-stats">
          <div className="am-stat-card">
            <div className="am-stat-label">Total Fixtures</div>
            <div className="am-stat-value green">{fixtures.length}</div>
          </div>
          <div className="am-stat-card">
            <div className="am-stat-label">Live Now</div>
            <div className="am-stat-value" style={{ color: 'var(--red)' }}>
              {fixtures.filter(f => getCountdown(f.dateTime) === 'Live / Completed').length}
            </div>
          </div>
          <div className="am-stat-card">
            <div className="am-stat-label">Today</div>
            <div className="am-stat-value amber">
              {fixtures.filter(f => {
                const d = new Date(f.dateTime);
                const n = new Date();
                return d.toDateString() === n.toDateString();
              }).length}
            </div>
          </div>
          <div className="am-stat-card">
            <div className="am-stat-label">Upcoming</div>
            <div className="am-stat-value">
              {fixtures.filter(f => new Date(f.dateTime) > Date.now()).length}
            </div>
          </div>
        </div>

        {/* section label */}
        <div className="am-section-label">
          <span className="am-section-label-text">All Fixtures</span>
        </div>

        {/* grid */}
        {fixtures.length === 0 ? (
          <div className="am-empty">
            <div className="am-empty-icon">🏏</div>
            <div className="am-empty-title">No fixtures found</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
              Sync upcoming matches to get started
            </div>
          </div>
        ) : (
          <div className="am-fixtures-grid">
            {fixtures.map(fixture => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                onViewSquad={handleViewSquad}
      
                onViewContest={handleViewContest}
              />
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
};

/* ─── Topbar extracted for reuse in loading/error states ─── */
const Topbar = ({ onSync, onRefresh, onLogout, syncing, refreshing }) => (
  <nav className="am-topbar">
    <div className="am-brand">
      <div className="am-brand-icon">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#030f09" stroke="#030f09" strokeWidth="1.5">
          <path d="M18 3L6 21M9 6l9 9" strokeLinecap="round" />
        </svg>
      </div>
      <div className="am-brand-name">Pitch<span>11</span></div>
    </div>

    <div className="am-topbar-actions">
      <button className="btn btn-ghost" onClick={onSync} disabled={syncing}>
        <Icon.Sync /> {syncing ? 'Syncing…' : 'Sync'}
      </button>
      <button className="btn btn-ghost" onClick={onRefresh} disabled={refreshing}>
        <Icon.Refresh /> {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
      <button className="btn btn-danger" onClick={onLogout}>
        <Icon.Logout /> Logout
      </button>
    </div>
  </nav>
);

export default AdminMatches;



