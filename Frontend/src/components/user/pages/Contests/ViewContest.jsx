


import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import '../../styles/ViewContests.css'
import UseCheckActivation from "../../../common/middleware/UseCheckActivation";
const API_URL = import.meta.env.VITE_API_URL;

/* ── helpers ── */
const calculateTotalEntryFee = (contest) => {
  const buyIn = parseFloat(contest.buy_in) || 0;
  const entryFee = parseFloat(contest.entry_fee) || 0;
  return (buyIn + entryFee).toFixed(2);
};

const calculateTimeRemaining = (visibleUntil) => {
  const diffMs = new Date(visibleUntil).getTime() - Date.now();
  if (diffMs <= 0) return { label: "Expired", expiring: true };
  const minutes = Math.floor(diffMs / 60000) % 60;
  const hours = Math.floor(diffMs / 3600000);
  const expiring = hours < 1;
  return { label: `${hours}h ${minutes}m remaining`, expiring };
};

/* fill % for the pool bar — capped at 100 */
const fillPct = (current, max) =>
  max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

const BrandIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#030f09" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 3L6 21M9 6l9 9" />
  </svg>
);

/* ── Contest Card ── */
const ContestCard = ({ contest, onJoin }) => {
  const totalEntryFee = calculateTotalEntryFee(contest);
  const time = calculateTimeRemaining(contest.visible_until);
  const joined = parseInt(contest.current_players ?? contest.joined_players ?? 0);
  const maxPlayers = parseInt(contest.max_players) || 1;
  const pct = fillPct(joined, maxPlayers);

  return (
    <div className="vc-card">
      {/* header */}
      <div className="vc-card-header">
        <div className="vc-card-header-left">
          <span className={`vc-winner-badge ${contest.winner_type === "single" ? "single" : "multi"}`}>
            {contest.winner_type === "single" ? "🏆 Single Winner" : "🎯 Multi Winner"}
          </span>
          <span className="vc-card-id">#{contest.id}</span>
        </div>
        <div className={`vc-time-pill${time.expiring ? " expiring" : ""}`}>
          <span className="vc-time-dot" />
          {time.label}
        </div>
      </div>

      {/* prize pool */}
      <div className="vc-prize-block">
        <div className="vc-prize-label">Prize Pool</div>
        <div className="vc-prize-value">₹{contest.prize_pool}</div>
        <div className="vc-prize-sub">{contest.match_title}</div>
      </div>

      {/* stats row */}
      <div className="vc-card-stats">
        <div className="vc-cs">
          <div className="vc-cs-label">Entry</div>
          <div className="vc-cs-value amber">₹{totalEntryFee}</div>
        </div>
        <div className="vc-cs">
          <div className="vc-cs-label">Players</div>
          <div className="vc-cs-value">{contest.min_players}–{contest.max_players}</div>
        </div>
        <div className="vc-cs">
          <div className="vc-cs-label">Spots Left</div>
          <div className="vc-cs-value green">{maxPlayers - joined}</div>
        </div>
      </div>

      {/* fill progress */}
      <div className="vc-progress-wrap">
        <div className="vc-progress-label">
          <span>{joined} joined</span>
          <span>{pct}% filled</span>
        </div>
        <div className="vc-progress-bar">
          <div className="vc-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* join */}
      <button className="vc-join-btn" onClick={() => onJoin(contest)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2v10M12 12l4-4M12 12l-4-4M3 17v1a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1" />
        </svg>
        Join — ₹{totalEntryFee}
      </button>
    </div>
  );
};

/* ── Main ── */
const ViewContest = () => {
  const { fixtureId } = useParams();
  const { isActivated, loading, error } = UseCheckActivation(fixtureId);
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isActivated) return;
    const fetchContests = async () => {
      setFetching(true);
      try {
        const response = await axios.get(
          `${API_URL}/api/admin/contests/view/${fixtureId}`
        );
        setContests(response.data.contests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchContests();
  }, [fixtureId, isActivated]);

  const handleJoinContest = (contest) => {
    const totalFee = calculateTotalEntryFee(contest);
    const timeRemaining = calculateTimeRemaining(contest.visible_until).label;
    navigate(`/user/joinContest/${contest.id}`, {
      state: {
        contestId: contest.id,
        totalFee,
        matchTitle: contest.match_title,
        timeRemaining,
        matchId: contest.match_id,
      },
    });
  };

  const Topbar = () => (
    <nav className="vc-topbar">
      <div className="vc-brand">
        <div className="vc-brand-icon"><BrandIcon /></div>
        <div className="vc-brand-name">Pitch<span>11</span></div>
      </div>
      <button className="vc-back-btn" onClick={() => navigate(-1)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </button>
    </nav>
  );

  /* ── states ── */
  if (loading || fetching) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar />
      <div className="vc-loading">
        <div className="vc-spinner" />
        <div className="vc-loading-text">Loading contests…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar />
      <div className="vc-not-activated">
        <div className="vc-na-icon">⚠️</div>
        <div className="vc-na-title">Something went wrong</div>
        <div className="vc-na-sub">{error}</div>
      </div>
    </div>
  );

  if (!isActivated) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar />
      <div className="vc-not-activated">
        <div className="vc-na-icon">🔒</div>
        <div className="vc-na-title">Match Not Activated</div>
        <div className="vc-na-sub">
          This match hasn't been activated yet. Check back soon — contests open closer to match time.
        </div>
      </div>
    </div>
  );

  const totalPrizePool = contests.reduce((s, c) => s + (parseFloat(c.prize_pool) || 0), 0);
  const singleWinner = contests.filter(c => c.winner_type === "single").length;
  const multiWinner = contests.filter(c => c.winner_type !== "single").length;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Topbar />

      {/* ticker */}
      <div className="vc-ticker">
        <div className="vc-ticker-item">🏏 <strong>Live</strong> contests open</div>
        <div className="vc-ticker-item">💰 Total prize pool: <strong>₹{totalPrizePool.toLocaleString()}</strong></div>
        <div className="vc-ticker-item">🎯 <strong>{contests.length}</strong> contests available</div>
      </div>

      <div className="vc-page">

        {/* match hero */}
        <div className="vc-match-hero">
          <div className="vc-match-hero-label">Match #{fixtureId} · Contests</div>
          <div className="vc-match-hero-title">
            {contests[0]?.match_title
              ? contests[0].match_title.replace( "/")
              : <span>Available <span>Contests</span></span>
            }
          </div>
          <div className="vc-match-hero-badges">
            <span className="vc-hero-badge live">● Live</span>
            <span className="vc-hero-badge open">Contests Open</span>
            <span className="vc-hero-badge id">ID #{fixtureId}</span>
          </div>
        </div>

        {/* stats */}
        <div className="vc-stats">
          <div className="vc-stat-card">
            <div className="vc-stat-label">Total Contests</div>
            <div className="vc-stat-value green">{contests.length}</div>
          </div>
          <div className="vc-stat-card">
            <div className="vc-stat-label">Prize Pool</div>
            <div className="vc-stat-value amber">₹{totalPrizePool.toLocaleString()}</div>
          </div>
          <div className="vc-stat-card">
            <div className="vc-stat-label">Single Winner</div>
            <div className="vc-stat-value">{singleWinner}</div>
          </div>
          <div className="vc-stat-card">
            <div className="vc-stat-label">Multi Winner</div>
            <div className="vc-stat-value blue">{multiWinner}</div>
          </div>
        </div>

        {/* section label */}
        <div className="vc-section-label">
          <span className="vc-section-label-text">All Contests</span>
        </div>

        {/* grid */}
        {contests.length === 0 ? (
          <div className="vc-grid">
            <div className="vc-empty">
              <div className="vc-empty-icon">🏏</div>
              <div className="vc-empty-title">No Contests Yet</div>
              <div style={{ fontSize: 13, color: 'var(--tm)', marginTop: 8 }}>
                The admin hasn't created any contests for this match yet.
              </div>
            </div>
          </div>
        ) : (
          <div className="vc-grid">
            {contests.map(contest => (
              <ContestCard key={contest.id} contest={contest} onJoin={handleJoinContest} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ViewContest;