import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; 
import '../../styling/ViewSquad.css'
// below code is updated with is activate button 
import useCheckActivation from '../../../common/middleware/UseCheckActivation';
import useMatchActivation from '../../../common/middleware/UseMatchActivation';

const ViewSquad = () => {
  const { matchId } = useParams(); // ← Get matchId from route

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isActivated, loadingActivation } = useCheckActivation(matchId);
  const { activateMatch, activating } = useMatchActivation(matchId);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/admin/squads/fetch-players/${matchId}`);
        console.log("Fetched response:", res.data);
        if (Array.isArray(res.data?.data)) {
          setTeams(res.data.data);
        } else {
          console.error("Expected array in res.data.data but got:", res.data.data);
          alert("Error: Players data is not in correct format.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching players:", err);
        alert("Failed to fetch players.");
        setLoading(false);
      }


    };
    if (matchId) {
      fetchPlayers();
    
    }
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
    console.log("Teams before saving:", teams);

    if (!Array.isArray(teams)) {
      alert("Something went wrong, players not loaded.");
      return;
    }

    setSaving(true);

    try {
      const pointsData = teams
        .flatMap(team => Array.isArray(team.players) ? team.players : [])
        .map(p => ({
          player_id: p.player_id,
          credit_points: parseFloat(p.credit_points ?? p.points ?? 0),
        }));

      console.log("Saving points data:", pointsData);


 const hasInvalidPoints = pointsData.some(p => p.credit_points <= 0);
    if (hasInvalidPoints) {
      alert("All players must have credit points greater than 0.");
      setSaving(false); // Stop loading
      return;
    }

      await axios.post(
        `http://localhost:5000/api/admin/squads/update-points/${matchId}`,
        { pointsData }
      );
      alert('Credit points saved!');
      window.location.reload();
    } catch (err) {
      console.error("Error saving points:", err);
      alert('Error saving credit points');
    } finally {
      setSaving(false);
    }
  };



  const handleActivate = async () => {
    const success = await activateMatch(); // 🔄 Use hook's function
    if (success) {
      alert("Match activated successfully!");

    }
  };

  if (loading || loadingActivation) return <p>Loading...</p>;





  return (
    <div className="view-squad">
      <h2>Match ID: {matchId} Squad</h2>

      {/* [ACTIVATION] Show status and Activate button */}
      <div style={{ marginBottom: '1rem' }}>
        <strong>Status:</strong> {isActivated ? "Activated ✅" : "Not Activated ❌"}
        {!isActivated && (
          <button 
            onClick={handleActivate} 
            disabled={activating} 
            style={{ marginLeft: '10px', background: '#28a745', color: 'white' }}
          >
            {activating ? "Activating..." : "Activate Match"}
          </button>
        )}
      </div>



      {teams.map(team => (
        <div key={team.team_id}>
          <h3>{team.team_name}</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Captain</th>
                <th>Wicketkeeper</th>
                <th>Credit Points</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(team.players) && team.players.map(player => (
                <tr key={player.player_id}>
                  <td>{player.fullname}</td>
                  <td>{player.is_captain ? 'Yes' : ''}</td>
                  <td>{player.is_wicketkeeper ? 'Yes' : ''}</td>
                  <td>
                    <input
                      type="number"
                      disabled={Boolean(isActivated)}
                      value={player.credit_points ?? player.points ?? ''}
                      onChange={e =>
                        handleChange(team.team_id, player.player_id, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))} 

      {!isActivated && (
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Credit Points'}
        </button>
      )}
    
    </div>
  );
};

export default ViewSquad;
