import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../styling/ViewContest.css";
const API_URL = import.meta.env.VITE_API_URL;

const calculateTotalEntryFee = (contest) => {
  const buyIn = parseFloat(contest.buy_in) || 0;
  const entryFee = parseFloat(contest.entry_fee) || 0;
  return (buyIn + entryFee).toFixed(2);
};

const fillPct = (current, max) =>
  max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

const BrandIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#030f09"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M18 3L6 21M9 6l9 9" />
  </svg>
);

const ContestCard = ({ contest, onEdit, onDelete }) => {
  const totalEntryFee = calculateTotalEntryFee(contest);
  const joined = parseInt(contest.current_players ?? contest.joined_players ?? 0);
  const maxPlayers = parseInt(contest.max_players) || 1;
  const pct = fillPct(joined, maxPlayers);

  return (
    <div className="vc-card">
      <div className="vc-card-header">
        <div className="vc-card-header-left">
          <span
            className={`vc-winner-badge ${
              contest.winner_type === "single" ? "single" : "multi"
            }`}
          >
            {contest.winner_type === "single" ? "Single Winner" : "Multi Winner"}
          </span>
          <span className="vc-card-id">#{contest.id}</span>
        </div>
        <div className="vc-time-pill">
          <span className="vc-time-dot" />
          Active
        </div>
      </div>

      <div className="vc-prize-block">
        <div className="vc-prize-label">Prize Pool</div>
        <div className="vc-prize-value">Rs {contest.prize_pool}</div>
        <div className="vc-prize-sub">{contest.match_title}</div>
      </div>

      <div className="vc-card-stats">
        <div className="vc-cs">
          <div className="vc-cs-label">Entry</div>
          <div className="vc-cs-value amber">Rs {totalEntryFee}</div>
        </div>
        <div className="vc-cs">
          <div className="vc-cs-label">Players</div>
          <div className="vc-cs-value">
            {contest.min_players}-{contest.max_players}
          </div>
        </div>
        <div className="vc-cs">
          <div className="vc-cs-label">Spots Left</div>
          <div className="vc-cs-value green">{Math.max(maxPlayers - joined, 0)}</div>
        </div>
      </div>

      <div className="vc-progress-wrap">
        <div className="vc-progress-label">
          <span>{joined} joined</span>
          <span>{pct}% filled</span>
        </div>
        <div className="vc-progress-bar">
          <div className="vc-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="vc-admin-actions">
        <button className="vc-action-btn edit" onClick={() => onEdit(contest.id)}>
          Edit Contest
        </button>
        <button className="vc-action-btn delete" onClick={() => onDelete(contest.id)}>
          Delete Contest
        </button>
      </div>
    </div>
  );
};

const ViewContest = () => {
  const { fixtureId } = useParams();
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/admin/contests/view/${fixtureId}`
        );
        setContests(response.data.contests || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch contests.");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [fixtureId]);

  const handleEdit = (id) => {
    navigate(`/admin/edit-contest/${id}`);
  };

  const handleDelete = (id) => {
    navigate(`/admin/delete-contest/${id}`);
  };

  const Topbar = () => (
    <nav className="vc-topbar">
      <div className="vc-brand">
        <div className="vc-brand-icon">
          <BrandIcon />
        </div>
        <div className="vc-brand-name">
          Pitch<span>11</span>
        </div>
      </div>
      <button className="vc-back-btn" onClick={() => navigate(-1)}>
        Back
      </button>
    </nav>
  );

  if (loading) {
    return (
      <div className="vc-screen">
        <Topbar />
        <div className="vc-loading">
          <div className="vc-spinner" />
          <div className="vc-loading-text">Loading contests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vc-screen">
        <Topbar />
        <div className="vc-not-activated">
          <div className="vc-na-title">Something went wrong</div>
          <div className="vc-na-sub">{error}</div>
        </div>
      </div>
    );
  }

  const totalPrizePool = contests.reduce(
    (sum, contest) => sum + (parseFloat(contest.prize_pool) || 0),
    0
  );
  const singleWinner = contests.filter((contest) => contest.winner_type === "single").length;
  const multiWinner = contests.filter((contest) => contest.winner_type !== "single").length;

  return (
    <div className="vc-screen">
      <Topbar />

      <div className="vc-ticker">
        <div className="vc-ticker-item">
          Admin <strong>contest control</strong>
        </div>
        <div className="vc-ticker-item">
          Total prize pool: <strong>Rs {totalPrizePool.toLocaleString()}</strong>
        </div>
        <div className="vc-ticker-item">
          <strong>{contests.length}</strong> contests available
        </div>
      </div>

      <div className="vc-page">
        <div className="vc-match-hero">
          <div className="vc-match-hero-label">Match #{fixtureId} - Contests</div>
          <div className="vc-match-hero-title">
            {contests[0]?.match_title || (
              <>
                Available <span>Contests</span>
              </>
            )}
          </div>
          <div className="vc-match-hero-badges">
            <span className="vc-hero-badge open">Admin View</span>
            <span className="vc-hero-badge id">ID #{fixtureId}</span>
          </div>
        </div>

        <div className="vc-stats">
          <div className="vc-stat-card">
            <div className="vc-stat-label">Total Contests</div>
            <div className="vc-stat-value green">{contests.length}</div>
          </div>
          <div className="vc-stat-card">
            <div className="vc-stat-label">Prize Pool</div>
            <div className="vc-stat-value amber">Rs {totalPrizePool.toLocaleString()}</div>
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

        <div className="vc-section-label">
          <span className="vc-section-label-text">All Contests</span>
        </div>

        <div className="vc-grid">
          {contests.length === 0 ? (
            <div className="vc-empty">
              <div className="vc-empty-title">No Contests Found</div>
              <div className="vc-empty-copy">
                No contests have been created for this match yet.
              </div>
            </div>
          ) : (
            contests.map((contest) => (
              <ContestCard
                key={contest.id}
                contest={contest}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewContest;
