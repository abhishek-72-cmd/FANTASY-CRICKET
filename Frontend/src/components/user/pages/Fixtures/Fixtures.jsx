import React, { useState, useEffect } from 'react';
import axios from 'axios';
 import '../../styles/FixturesList.css';

const FixturesList = () => {
  const [allFixtures, setAllFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/fixtures/FetchFromDB/getFixtures');
        setAllFixtures(response.data);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  // Filter and transform data on the frontend
  const filteredFixtures = allFixtures.map(fixture => ({
    id: fixture.id,
    match_name: fixture.round || `${fixture.localteam?.name} vs ${fixture.visitorteam?.name}`,
    start_time: new Date(fixture.starting_at).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    status: fixture.status,
    match_format: fixture.type,
    home_team_name: fixture.localteam?.name || 'TBD',
    home_team_code: fixture.localteam?.code || '',
    away_team_name: fixture.visitorteam?.name || 'TBD',
    away_team_code: fixture.visitorteam?.code || '',
    venue_name: fixture.venue?.name || 'TBD'
  }));

  if (loading) return <div className="loading-spinner">Loading...</div>;

  return (
    <div className="fixtures-container">
      <h2>Upcoming Matches</h2>
      <div className="fixtures-grid">
        {filteredFixtures.map(fixture => (
          <div key={fixture.id} className="fixture-card">
            {/* Keep the same UI rendering as before */}
            <div className="match-header">
              <span className="match-format">{fixture.match_format}</span>
              <span className="match-status">{fixture.status}</span>
            </div>
            
            <div className="teams">
              <div className="team">
                <span className={`flag-icon flag-${fixture.home_team_code.toLowerCase()}`}></span>
                <span>{fixture.home_team_name}</span>
              </div>
              <div className="vs">vs</div>
              <div className="team">
                <span className={`flag-icon flag-${fixture.away_team_code.toLowerCase()}`}></span>
                <span>{fixture.away_team_name}</span>
              </div>
            </div>

            <div className="match-details">
              <div className="match-name">{fixture.match_name}</div>
              <div className="venue">
                <i className="stadium-icon"></i>
                {fixture.venue_name}
              </div>
              <div className="time">
                <i className="time-icon"></i>
                {fixture.start_time}
              </div>
            </div>

            <div className="match-actions">
              <button className="create-contest-btn">
                Create Contest
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FixturesList;