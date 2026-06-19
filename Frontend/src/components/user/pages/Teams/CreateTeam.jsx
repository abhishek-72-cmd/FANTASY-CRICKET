import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/CreateTeam.css';
const API_URL = import.meta.env.VITE_API_URL;

// ── Constants ──────────────────────────────────────────────
const ROLES = ['Wicket Keeper', 'Batsman', 'All Rounder', 'Bowler'];

const ROLE_LIMITS = {
  'Wicket Keeper': { min: 1, max: 2 },
  Batsman: { min: 1, max: 5 },
  'All Rounder': { min: 1, max: 5 },
  Bowler: { min: 1, max: 5 },
};

const MAX_POINTS = 100;

const positionToRole = {
  Wicketkeeper: 'Wicket Keeper',
  Batsman: 'Batsman',
  Bowler: 'Bowler',
  Allrounder: 'All Rounder',
  'Bowling Allrounder': 'All Rounder',
  'Batsman Allrounder': 'All Rounder',
  'Batting Allrounder': 'All Rounder',
  'Middle Order Batter': 'Batsman',
  'Top Order Batter': 'Batsman',
};

const ROLE_ICONS = {
  'Wicket Keeper': '🧤',
  Batsman: '🏏',
  'All Rounder': '⚡',
  Bowler: '🎯',
};

// ── Helpers ────────────────────────────────────────────────
const normalizePlayers = (players) =>
  players
    .filter((p) => positionToRole[p.position])
    .map((p) => ({
      player_id: p.player_id,
      fullname: p.fullname,
      role: positionToRole[p.position],
      credit_points: Number(p.credit_points ?? p.points ?? 0),
    }));

/** Returns the first two initials from a name */
const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Groups an array of players by their role */
const groupByRole = (players) => {
  const map = {};
  players.forEach((p) => {
    if (!map[p.role]) map[p.role] = [];
    map[p.role].push(p);
  });
  return map;
};

// ── Component ──────────────────────────────────────────────
const CreateTeam = ({
  mode = 'create',
  matchId: propMatchId,
  matchTitle: propMatchTitle,
  entryFee: propEntryFee,
  initialPlayers = [],
  initialCaptainId = null,
  initialViceCaptainId = null,
}) => {
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [userTeam, setUserTeam] = useState({});
  const [captainId, setCaptainId] = useState('');
  const [viceCaptainId, setViceCaptainId] = useState('');
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);
  const [lineupStatus, setLineupStatus] = useState('confirmed');
const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { matchId: matchIdFromParams } = useParams();

  const matchId = propMatchId || matchIdFromParams;
  const { matchTitle: locMatchTitle, entryFee: locEntryFee } = location.state || {};
  const matchTitle = propMatchTitle || locMatchTitle;
  const entryFee = propEntryFee || locEntryFee;

  // ── Fetch Players ──────────────────────────────────────
  useEffect(() => {
    if (!matchId) return;

    const applyPlayers = (teamAProcessed, teamBProcessed) => {
      setTeamAPlayers(teamAProcessed);
      setTeamBPlayers(teamBProcessed);

      const allPlayersMap = {};
      [...teamAProcessed, ...teamBProcessed].forEach((p) => {
        allPlayersMap[p.player_id] = p;
      });

      if (mode === 'edit' && initialPlayers?.length) {
        const reconstructedTeam = {};
        initialPlayers.forEach((p) => {
          const fullPlayer = allPlayersMap[p.playerId];
          if (!fullPlayer) return;
          const role = p.role;
          if (!reconstructedTeam[role]) reconstructedTeam[role] = [];
          reconstructedTeam[role].push(fullPlayer);
        });
        setUserTeam(reconstructedTeam);
      }
    };

    const fetchSquadPlayers = async () => {
      const res = await axios.get(
        `${API_URL}/api/admin/squads/get-or-fetch-players/${matchId}`
      );
      const teamAProcessed = normalizePlayers(res.data?.localPlayers || []);
      const teamBProcessed = normalizePlayers(res.data?.visitorPlayers || []);
      setLineupStatus('squad');
      applyPlayers(teamAProcessed, teamBProcessed);
    };

    const fetchPlayers = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/admin/squads/fetch-players/${matchId}`
        );
        const data = res.data?.data;
        const status = res.data?.lineup_status || 'confirmed';

        if (!data || data.length < 2) {
          await fetchSquadPlayers();
          return;
        }

        const [teamA, teamB] = data;
        const teamAProcessed = normalizePlayers(teamA.players || []);
        const teamBProcessed = normalizePlayers(teamB.players || []);

        setLineupStatus(status);
        applyPlayers(teamAProcessed, teamBProcessed);
      } catch (err) {
        console.warn('Final lineup not available. Loading full squad.', err.response?.data || err.message);
        await fetchSquadPlayers();
      }
    };

    fetchPlayers().catch((err) => console.error('Failed to fetch players', err));
  }, [matchId, mode]);

  // ── Credits ────────────────────────────────────────────
  useEffect(() => {
    const used = Object.values(userTeam)
      .flat()
      .reduce((acc, p) => acc + p.credit_points, 0);
    setTotalCreditsUsed(used);
  }, [userTeam]);

  // ── Edit mode seed ─────────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && Array.isArray(initialPlayers)) {
      const grouped = {};
      initialPlayers.forEach((player) => {
        const role = player.role;
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push({
          player_id: player.playerId,
          fullname: player.fullname,
          credit_points: player.credit_points ?? player.points ?? 0,
          role,
        });
      });
      setUserTeam(grouped);
      if (initialCaptainId) setCaptainId(initialCaptainId);
      if (initialViceCaptainId) setViceCaptainId(initialViceCaptainId);
    }
  }, [mode, initialPlayers, initialCaptainId, initialViceCaptainId]);

  // ── Actions ────────────────────────────────────────────
  const isAlreadySelected = (id) =>
    Object.values(userTeam).flat().some((p) => p.player_id === id);

  const handleAddPlayer = (player) => {
    if (isAlreadySelected(player.player_id)) return alert('Player already selected');
    if (Object.values(userTeam).flat().length >= 11) return alert('You can only select 11 players');
    if (totalCreditsUsed + player.credit_points > MAX_POINTS)
      return alert('You have reached 100 credit limit');

    const role = player.role;
    const current = userTeam[role] || [];

    if (current.length >= ROLE_LIMITS[role].max)
      return alert(`You can only select ${ROLE_LIMITS[role].max} ${role}(s)`);

    setUserTeam((prev) => ({ ...prev, [role]: [...current, player] }));
  };

  const handleRemovePlayer = (role, id) => {
    setUserTeam((prev) => {
      const updated = { ...prev, [role]: prev[role].filter((p) => p.player_id !== id) };
      if (id === captainId) setCaptainId('');
      if (id === viceCaptainId) setViceCaptainId('');
      return updated;
    });
  };

  const handleSaveTeam = async () => {
      if (saving) return;

    const allPlayers = Object.values(userTeam).flat();
    if (allPlayers.length !== 11) return alert('You must select exactly 11 players');
    if (!captainId || !viceCaptainId) return alert('Please select Captain and Vice-Captain');
    if (captainId === viceCaptainId) return alert('Captain and Vice-Captain must be different');

    const payload = {
      match_id: matchId,
      players: allPlayers.map((p) => ({ playerId: p.player_id, role: p.role })),
      captainId,
      viceCaptainId,
    };

    try {
       setSaving(true);
      const token = localStorage.getItem('userToken');
      await axios.post(
        `${API_URL}/api/user/team/save/${matchId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Team saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save team.');
    }  finally{
          setSaving(false);
    }
  };

  const handleShowTeams = () => navigate('/user/teams', { state: { matchId } });

  // ── Derived ────────────────────────────────────────────
  const selectedPlayers = Object.values(userTeam).flat();
  const selectedCount = selectedPlayers.length;
  const creditPercent = Math.min((totalCreditsUsed / MAX_POINTS) * 100, 100);
  const creditWarning = creditPercent > 80;

  // Group pool players by role for tidy display
  const teamAByRole = groupByRole(teamAPlayers);
  const teamBByRole = groupByRole(teamBPlayers);

  // ── Render helpers ─────────────────────────────────────
  const renderPoolPanel = (title, playersByRole, dotColor) => (
    <div className="ctb-panel">
      <div className="ctb-panel-header">
        <span className="ctb-panel-title">
          <span className="dot" style={{ background: dotColor }} />
          {title}
        </span>
        <span className="ctb-panel-count">
          {Object.values(playersByRole).flat().length} PLAYERS
        </span>
      </div>
      <div className="ctb-panel-body">
        {ROLES.map((role) => {
          const players = playersByRole[role] || [];
          if (!players.length) return null;
          return (
            <div className="ctb-role-section" key={role}>
              <div className="ctb-role-label">
                {ROLE_ICONS[role]} {role}
              </div>
              {players.map((player) => {
                const selected = isAlreadySelected(player.player_id);
                return (
                  <div
                    key={player.player_id}
                    className={`ctb-player-card${selected ? ' selected' : ''}`}
                    onClick={() => !selected && handleAddPlayer(player)}
                  >
                    <div className="ctb-player-avatar">{initials(player.fullname)}</div>
                    <div className="ctb-player-info">
                      <div className="ctb-player-name">{player.fullname}</div>
                      <div className="ctb-player-role-tag">{player.role}</div>
                    </div>
                    <span className="ctb-player-credits">{player.credit_points}</span>
                    <button
                      className="ctb-add-btn"
                      disabled={selected}
                      onClick={(e) => { e.stopPropagation(); handleAddPlayer(player); }}
                      title="Add player"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── JSX ────────────────────────────────────────────────
  return (
    <div className="ctb-wrapper">
      {/* ── Header ── */}
      <div className="ctb-header">
        <div className="ctb-header-top">
          <div>
            <div className="ctb-page-label">
              {mode === 'edit' ? '✏ Edit Team' : '⚡ Team Builder'}
            </div>
            <h1 className="ctb-match-title">{matchTitle || `Match #${matchId}`}</h1>
          </div>
          <div className="ctb-meta">
            <div className="ctb-meta-badge gold">
              <span className="icon">₹</span>
              Entry: ₹{entryFee ?? '—'}
            </div>
            <div className="ctb-meta-badge">
              <span className="icon">👥</span>
              {selectedCount} / 11 Selected
            </div>
          </div>
        </div>
      </div>

      {/* ── Credits Bar ── */}
      <div className="ctb-credits-bar-wrap">
        <div className="ctb-credits-label">
          <span>Credits Used</span>
          <span className="ctb-credits-value">
            {totalCreditsUsed} <span style={{ color: 'var(--text-muted)' }}>/ {MAX_POINTS}</span>
          </span>
        </div>
        <div className="ctb-credits-track">
          <div
            className={`ctb-credits-fill${creditWarning ? ' warning' : ''}`}
            style={{ width: `${creditPercent}%` }}
          />
        </div>
      </div>

      {/* ── Squad Warning ── */}
      {lineupStatus === 'squad' && (
        <div className="ctb-squad-warning">
          ⚠ Final playing XI not yet announced — showing tentative squad.
        </div>
      )}

      {/* ── Main 3-Column Grid ── */}
      <div className="ctb-main">
        {/* Pool A */}
        {renderPoolPanel('Team A', teamAByRole, '#00e676')}

        {/* Pool B */}
        {renderPoolPanel('Team B', teamBByRole, '#2979ff')}

        {/* Your Team */}
        <div className="ctb-panel ctb-panel--yours">
          <div className="ctb-panel-header">
            <span className="ctb-panel-title">
              <span className="dot" />
              Your XI
            </span>
            <span className="ctb-panel-count">{selectedCount} / 11</span>
          </div>
          <div className="ctb-panel-body">
            {/* Player counter pill */}
            <div className="ctb-counter">
              <span className="ctb-counter-num">{selectedCount}</span>
              <span className="ctb-counter-sep">/</span>
              <span className="ctb-counter-max">11</span>
              <span className="ctb-counter-label">PLAYERS</span>
            </div>

            {/* Role slots */}
            {ROLES.map((role) => {
              const players = userTeam[role] || [];
              return (
                <div className="ctb-slot-group" key={role}>
                  <div className="ctb-slot-header">
                    <span className="ctb-slot-label">
                      {ROLE_ICONS[role]} {role}
                    </span>
                    <span className="ctb-slot-limit">
                      {players.length} / {ROLE_LIMITS[role].max}
                    </span>
                  </div>

                  {players.length === 0 ? (
                    <div className="ctb-slot-empty">No {role} selected yet</div>
                  ) : (
                    players.map((player) => {
                      const isCap = player.player_id === captainId;
                      const isVC = player.player_id === viceCaptainId;
                      return (
                        <div className="ctb-selected-card" key={player.player_id}>
                          <div className="ctb-selected-avatar">{initials(player.fullname)}</div>
                          <div className="ctb-selected-info">
                            <div className="ctb-selected-name">{player.fullname}</div>
                            <div className="ctb-selected-credits">
                              {player.credit_points} credits
                            </div>
                          </div>
                          {isCap && <span className="ctb-role-badge captain">C</span>}
                          {isVC && <span className="ctb-role-badge vc">VC</span>}
                          <button
                            className="ctb-remove-btn"
                            onClick={() => handleRemovePlayer(role, player.player_id)}
                            title="Remove player"
                          >
                            −
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}

            {/* Captain / VC selects */}
            {selectedPlayers.length > 0 && (
              <div className="ctb-captain-section">
                <div className="ctb-captain-title">LEADERSHIP</div>

                <div className="ctb-select-wrap">
                  <div className="ctb-select-label">
                    <span className="badge-c">C</span> Captain
                  </div>
                  <select
                    className="ctb-select"
                    value={captainId}
                    onChange={(e) => setCaptainId(e.target.value)}
                  >
                    <option value="">Select Captain</option>
                    {selectedPlayers.map((p) => (
                      <option key={p.player_id} value={p.player_id}>
                        {p.fullname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ctb-select-wrap">
                  <div className="ctb-select-label">
                    <span className="badge-vc">VC</span> Vice-Captain
                  </div>
                  <select
                    className="ctb-select"
                    value={viceCaptainId}
                    onChange={(e) => setViceCaptainId(e.target.value)}
                  >
                    <option value="">Select Vice-Captain</option>
                    {selectedPlayers.map((p) => (
                      <option key={p.player_id} value={p.player_id}>
                        {p.fullname}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="ctb-actions">
              <button className="ctb-btn ctb-btn--primary" disabled={saving}  onClick={handleSaveTeam}>
                {mode === 'edit' ? 'Save Changes' : 'Create Team'}
              </button>
              <button className="ctb-btn ctb-btn--secondary" onClick={handleShowTeams}>
                My Teams
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
