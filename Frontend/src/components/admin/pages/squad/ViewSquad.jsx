// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom'; 
// import '../../styling/ViewSquad.css'
// // below code is updated with is activate button 
// import useCheckActivation from '../../../common/middleware/UseCheckActivation';
// import useMatchActivation from '../../../common/middleware/UseMatchActivation';









import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
 import '../../styling/ViewSquad.css'
import useCheckActivation from '../../../common/middleware/UseCheckActivation';
import useMatchActivation from '../../../common/middleware/UseMatchActivation';

/* ─── Toast system ─── */
const ToastContainer = ({ toasts }) => (
  <div className="vs-toast-wrap">
    {toasts.map(t => (
      <div key={t.id} className={`vs-toast${t.type ? ` ${t.type}` : ''}`}>
        {t.msg}
      </div>
    ))}
  </div>
);

/* ─── Role badge ─── */
const RoleBadge = ({ isCaptain, isWicketkeeper }) => {
  if (isCaptain) return <span className="vs-role-badge captain">C</span>;
  if (isWicketkeeper) return <span className="vs-role-badge wk">WK</span>;
  return <span className="vs-role-empty">—</span>;
};

/* ─── Player initials ─── */
const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

/* ─── Main component ─── */
const ViewSquad = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);

  const { isActivated, loadingActivation } = useCheckActivation(matchId);
  const { activateMatch, activating } = useMatchActivation(matchId);

  /* toast helper */
  const addToast = (msg, type = '') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    if (!matchId) return;
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/squads/fetch-players/${matchId}`);
        if (Array.isArray(res.data?.data)) {
          setTeams(res.data.data);
        } else {
          addToast('Players data is not in the correct format.', 'error');
        }
      } catch (err) {
        console.error('Error fetching players:', err);
        addToast('Failed to fetch players.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [matchId]);

  const handleChange = (teamId, playerId, value) => {
    setTeams(prev =>
      prev.map(team =>
        team.team_id === teamId
          ? {
              ...team,
              players: team.players.map(p =>
                p.player_id === playerId ? { ...p, credit_points: value, points: value } : p
              ),
            }
          : team
      )
    );
  };

  const handleSave = async () => {
    if (!Array.isArray(teams)) { addToast('Players not loaded.', 'error'); return; }
    setSaving(true);
    try {
      const pointsData = teams
        .flatMap(team => (Array.isArray(team.players) ? team.players : []))
        .map(p => ({
          player_id: p.player_id,
          credit_points: parseFloat(p.credit_points ?? p.points ?? 0),
        }));

      if (pointsData.some(p => p.credit_points <= 0)) {
        addToast('All players must have credit points greater than 0.', 'warning');
        setSaving(false);
        return;
      }

      await axios.post(
        `http://localhost:5000/api/admin/squads/update-points/${matchId}`,
        { pointsData }
      );
      addToast('Credit points saved successfully!');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error('Error saving points:', err);
      addToast('Error saving credit points.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    const success = await activateMatch();
    if (success) addToast('Match activated successfully!');
  };

  /* ── computed stats ── */
  const allPlayers = teams.flatMap(t => t.players || []);
  const totalPlayers = allPlayers.length;
  const captains = allPlayers.filter(p => p.is_captain).length;
  const wicketkeepers = allPlayers.filter(p => p.is_wicketkeeper).length;
  const unset = allPlayers.filter(p => !(parseFloat(p.credit_points ?? p.points ?? 0) > 0)).length;

  /* ── loading state ── */
  if (loading || loadingActivation) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <nav className="vs-topbar">
        <div className="vs-brand">
          <div className="vs-brand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#030f09" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 3L6 21M9 6l9 9" />
            </svg>
          </div>
          <div className="vs-brand-name">Pitch<span>11</span></div>
        </div>
      </nav>
      <div className="vs-loading">
        <div className="vs-spinner" />
        <div className="vs-loading-text">Loading squad…</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── Topbar ── */}
      <nav className="vs-topbar">
        <div className="vs-brand">
          <div className="vs-brand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#030f09" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 3L6 21M9 6l9 9" />
            </svg>
          </div>
          <div className="vs-brand-name">Pitch<span>11</span></div>
        </div>
        <button className="vs-back-btn" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Matches
        </button>
      </nav>

      <div className="vs-page">

        {/* ── Page header ── */}
        <div className="vs-page-header">
          <div className="vs-match-label">Match #{matchId} · Squad Management</div>
          <div className="vs-page-title">Player <span>Squad</span></div>
        </div>

        {/* ── Status banner ── */}
        <div className="vs-status-banner">
          <div className="vs-status-left">
            {isActivated ? (
              <span className="vs-status-pill activated">
                <span className="vs-status-dot pulse" />
                Activated
              </span>
            ) : (
              <span className="vs-status-pill not-activated">
                <span className="vs-status-dot" />
                Not Activated
              </span>
            )}
            <div className="vs-status-info">
              {isActivated
                ? <><strong>Match is live.</strong> Credit points are locked.</>
                : <><strong>Set credit points</strong> before activating the match.</>
              }
            </div>
          </div>

          {!isActivated && (
            <button
              className="vs-activate-btn"
              onClick={handleActivate}
              disabled={activating}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              {activating ? 'Activating…' : 'Activate Match'}
            </button>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="vs-stats">
          <div className="vs-stat-card">
            <div className="vs-stat-label">Total Players</div>
            <div className="vs-stat-value green">{totalPlayers}</div>
          </div>
          <div className="vs-stat-card">
            <div className="vs-stat-label">Teams</div>
            <div className="vs-stat-value">{teams.length}</div>
          </div>
          <div className="vs-stat-card">
            <div className="vs-stat-label">Captains</div>
            <div className="vs-stat-value amber">{captains}</div>
          </div>
          <div className="vs-stat-card">
            <div className="vs-stat-label">Wicketkeepers</div>
            <div className="vs-stat-value blue">{wicketkeepers}</div>
          </div>
          <div className="vs-stat-card">
            <div className="vs-stat-label">Points Unset</div>
            <div className={`vs-stat-value ${unset > 0 ? 'red' : 'green'}`}>{unset}</div>
          </div>
        </div>

        {/* ── Teams ── */}
        {teams.map(team => {
          const initials = team.team_name
            ? team.team_name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
            : '??';
          return (
            <div key={team.team_id}>
              <div className="vs-section-label">
                <span className="vs-section-label-text">{team.team_name}</span>
              </div>

              <div className="vs-team-block">
                <div className="vs-team-header">
                  <div className="vs-team-header-left">
                    <div className="vs-team-avatar">{initials}</div>
                    <div className="vs-team-name">{team.team_name}</div>
                  </div>
                  <span className="vs-team-count-badge">
                    {Array.isArray(team.players) ? team.players.length : 0} players
                  </span>
                </div>

                <div className="vs-table-wrap">
                  <table className="vs-player-table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Role</th>
                        <th>Credit Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(team.players) && team.players.map(player => (
                        <tr key={player.player_id}>
                          <td>
                            <div className="vs-player-info">
                              <div className="vs-player-avatar">
                                {getInitials(player.fullname)}
                              </div>
                              <span className="vs-player-name">{player.fullname}</span>
                            </div>
                          </td>
                          <td>
                            <RoleBadge
                              isCaptain={player.is_captain}
                              isWicketkeeper={player.is_wicketkeeper}
                            />
                          </td>
                          <td>
                            <div className="vs-credit-input-wrap">
                              <input
                                className="vs-credit-input"
                                type="number"
                                step="0.5"
                                min="0"
                                disabled={Boolean(isActivated)}
                                value={player.credit_points ?? player.points ?? ''}
                                onChange={e =>
                                  handleChange(team.team_id, player.player_id, e.target.value)
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Save footer ── */}
        {!isActivated && (
          <div className="vs-save-footer">
            <div className="vs-save-footer-info">
              {unset > 0
                ? <><strong style={{ color: 'var(--red)' }}>{unset} players</strong> still need credit points set</>
                : <><strong style={{ color: 'var(--green)' }}>All players</strong> have credit points assigned</>
              }
            </div>
            <button className="vs-save-btn" onClick={handleSave} disabled={saving}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {saving ? 'Saving…' : 'Save Credit Points'}
            </button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default ViewSquad;