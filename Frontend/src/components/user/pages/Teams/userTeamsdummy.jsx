import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/UserTeamsPage.css';

const UserTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserTeams = async () => {
      const userToken = localStorage.getItem('userToken');
      const adminToken = localStorage.getItem('adminToken');
      const token = userToken || adminToken;

      if (!token) {
        alert('You are not logged in! Please login first.');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('(http://localhost:5000/api/user/team/my_teams)', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTeams(response.data.teams || []);
        console.log('Fetched teams:', response.data.teams);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(err.response?.data?.message || 'Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeams();
  }, [navigate]);

  const handleTeamClick = (teamId) => {
    navigate(`/user/teams/${teamId}`);
  };

  const handleEditContest = (teamId) => {
    navigate(`/user/editteams/${teamId}`);
  };

  const handleDeleteContest = (teamId) => {
    navigate(`/user/deleteteams/${teamId}`);
  };

  if (loading) {
    return (
      <div className="utp-page">
        <header className="utp-header">
          <div className="utp-header-left">
            <div className="utp-logo">FC</div>
            <h1 className="utp-title">Your Teams</h1>
          </div>
        </header>
        <div className="utp-content">
          <div className="loading">
            <span className="pulse-dot" />
            Loading your teams...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="utp-page">
        <header className="utp-header">
          <div className="utp-header-left">
            <div className="utp-logo">FC</div>
            <h1 className="utp-title">Your Teams</h1>
          </div>
        </header>
        <div className="utp-content">
          <div className="error">
            <span className="error-icon">!</span>
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="utp-page">
      <div className="utp-hero-lights" aria-hidden="true" />
      <header className="utp-header">
        <div className="utp-header-left">
          <div className="utp-logo">FC</div>
          <h1 className="utp-title">Your Teams</h1>
        </div>

        <div className="utp-header-actions">
          <button
            className="btn btn-outline"
            onClick={() => navigate('/matches')}
          >
            + Create a Team
          </button>
        </div>
      </header>

      <div className="utp-subheader">
        <div className="utp-breadcrumbs">
          <span className="crumb">Home</span>
          <span className="crumb-sep">/</span>
          <span className="crumb active">Your Teams</span>
        </div>
        <div className="utp-meta">
          <span className="meta-pill">
            Total Teams: <strong>{teams.length}</strong>
          </span>
        </div>
      </div>

      <main className="utp-content">
        {teams.length === 0 ? (
          <div className="no-teams card-glow">
            <div className="no-teams-graphic" aria-hidden="true">
              <div className="stadium-arc" />
              <div className="pitch-lines" />
              <div className="ball" />
            </div>
            <p className="no-teams-text">You haven't created any teams yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/matches')}>
              Create a Team
            </button>
          </div>
        ) : (
          <div className="teams-grid">
            {teams.map((team) => (
              <div
                key={team.team_id}
                className="team-card card-glow"
                onClick={() => handleTeamClick(team.team_id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleTeamClick(team.team_id);
                }}
              >
                <div className="team-card-header">
                  <div className="match-badge">
                    <span className="match-label">Match</span>
                    <span className="match-title">
                      {team.match?.title || `#${team.match?.id}`}
                    </span>
                  </div>
                  <div className="team-id">Team ID: {team.team_id}</div>
                </div>

                <div className="team-card-body">
                  <div className="team-stats">
                    <div className="stat">
                      <span className="stat-label">Contest</span>
                      <span className="stat-value">
                        {team.contest?.match_title || 'N/A'}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Amount</span>
                      <span className="stat-value amount">₹{team.contest?.total_fee || '0'}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Match ID</span>
                      <span className="stat-value">#{team.match?.id}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Created</span>
                      <span className="stat-value">
                        {new Date(team.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="players-list">
                    <h4 className="players-title">Players</h4>
                    <div className="players-scroll">
                      {team.players.map((player, index) => (
                        <div key={index} className="player-item">
                          <span className="player-chip">
                            <span className="player-avatar" aria-hidden="true">
                              {String(player.fullname || '')
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                            <span className="player-name">
                              {player.fullname} ({player.id})
                            </span>
                          </span>
                          <span className="player-role">{player.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="team-card-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditContest(team.team_id);
                    }}
                  >
                    Edit Team
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteContest(team.team_id);
                    }}
                  >
                    Delete Team
                  </button>
                </div>

                <div className="scanline" aria-hidden="true" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserTeamsPage;
