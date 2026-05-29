
import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/UserTeamsPage.css'; 

const UserTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserTeams = async () => {
      const userToken = localStorage.getItem("userToken");
      const adminToken = localStorage.getItem("adminToken");
      const token = userToken || adminToken;

      if (!token) {
        alert("You are not logged in! Please login first.");
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/user/team/my_teams', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTeams(response.data.teams || []);
      } catch (err) {
        console.error("Error fetching teams:", err);
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


  if (loading) {
    return <div className="loading">Loading your teams...</div>;
  }
  
  const handleEditContest = (teamId)=>{
    navigate(`/user/editteams/${teamId}`)
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const handleDeleteContest = (teamId)=>{
    navigate (`/user/deleteteams/${teamId}`)
  }
  
  return (
    <div className="user-teams-container">
      <h1>Your Teams</h1>
      
      {teams.length === 0 ? (
        <div className="no-teams">
          <p>You haven't created any teams yet.</p>
          <button onClick={() => navigate('/matches')}>Create a Team</button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div 
              key={team.team_id} 
              className="team-card"
              onClick={() => handleTeamClick(team.team_id)}
            >
              <h3>Match: {team.match?.title || `#${team.match?.id}`}</h3>

              <p>
                Contest: {team.contest?.match_title || 'N/A'} — 
                Amount: ₹{team.contest?.total_fee || '0'} <br />
                match id : {team.match?.id }
              </p>

              <p>Created on: {new Date(team.created_at).toLocaleDateString()}</p>

              <div className="players-list">
                <h4>Players:</h4>
                {team.players.map((player, index) => (
                  <div key={index} className="player-item">
                    <span className="player-name">
                      {player.fullname} ({player.id})
                    </span>
                    <span className="player-role">
                      — {player.role}
                    </span>
                  </div>
                ))}
    
   <button
  onClick={(e) => {
    e.stopPropagation(); // ⬅️ prevents the parent onClick
    handleEditContest(team.team_id);
  }}
>
  Edit Team
</button> <br />


<div><br /> 
     <button
  onClick={(e) => {
    e.stopPropagation(); // ⬅️ prevents the parent onClick
    handleDeleteContest(team.team_id);
  }}
>
  Delete Team
</button>
</div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTeamsPage;
