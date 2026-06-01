

import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/JoinContest.css";

const BrandIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="#030f09" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 3L6 21M9 6l9 9" />
  </svg>
);

const JoinContest = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const isExpiring = state?.timeRemaining?.includes("0h") ||
    state?.timeRemaining === "Expired";

  const handleJoinContest = () => {
    navigate(`/user/create_team/${state.matchId}`, {
      state: {
        contestId: state.contestId,
        matchTitle: state.matchTitle,
        entryFee: state.totalFee,
      },
    });
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* Topbar */}
      <nav className="jc-topbar">
        <div className="jc-brand">
          <div className="jc-brand-icon"><BrandIcon /></div>
          <div className="jc-brand-name">Pitch<span>11</span></div>
        </div>
        <button className="jc-back-btn" onClick={() => navigate(-1)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
      </nav>

      <div className="jc-page">

        {/* Step indicator */}
        <div className="jc-steps">
          <div className="jc-step">
            <div className="jc-step-circle done">✓</div>
            <div className="jc-step-label">View</div>
          </div>
          <div className="jc-step-line done" />
          <div className="jc-step">
            <div className="jc-step-circle active">2</div>
            <div className="jc-step-label active">Confirm</div>
          </div>
          <div className="jc-step-line" />
          <div className="jc-step">
            <div className="jc-step-circle pending">3</div>
            <div className="jc-step-label">Build Team</div>
          </div>
        </div>

        {/* Hero card */}
        <div className="jc-hero">

          {/* header */}
          <div className="jc-hero-header">
            <div className="jc-hero-label">Contest · Confirm Entry</div>
            <div className="jc-hero-title">{state?.matchTitle || "Match Contest"}</div>
          </div>

          {/* fee */}
          <div className="jc-fee-block">
            <div className="jc-fee-left">
              <div className="jc-fee-label">Total Entry Fee</div>
              <div className="jc-fee-value">₹{state?.totalFee}</div>
              <div className="jc-fee-note">Includes platform fee</div>
            </div>
            <div className="jc-fee-right">
              <div className="jc-fee-icon">💰</div>
            </div>
          </div>

          {/* time */}
          <div className="jc-time-block">
            <span className={`jc-time-dot${isExpiring ? " warning" : ""}`} />
            <span className="jc-time-label">Time remaining</span>
            <span className={`jc-time-value${isExpiring ? " " : ""}`}
              style={{ color: isExpiring ? "var(--red)" : "var(--tp)" }}>
              {state?.timeRemaining}
            </span>
          </div>

          {/* breakdown */}
          <div className="jc-breakdown">
            <div className="jc-breakdown-title">Entry Breakdown</div>
            <div className="jc-breakdown-row">
              <span className="jc-breakdown-key">Base buy-in</span>
              <span className="jc-breakdown-val">₹{(parseFloat(state?.totalFee || 0) * 0.9).toFixed(2)}</span>
            </div>
            <div className="jc-breakdown-row">
              <span className="jc-breakdown-key">Platform fee (10%)</span>
              <span className="jc-breakdown-val">₹{(parseFloat(state?.totalFee || 0) * 0.1).toFixed(2)}</span>
            </div>
            <div className="jc-breakdown-row">
              <span className="jc-breakdown-key" style={{ fontWeight: 600, color: "var(--tp)" }}>Total</span>
              <span className="jc-breakdown-val amber">₹{state?.totalFee}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="jc-cta-wrap">
            <button className="jc-join-btn" onClick={handleJoinContest}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Continue — Build My Team
            </button>
          </div>
        </div>

        {/* disclaimer */}
        <div className="jc-disclaimer">
          🔒 Secure entry · Fantasy sports for 18+
        </div>

      </div>
    </div>
  );
};

export default JoinContest;