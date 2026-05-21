

import React, { useEffect, useState } from 'react';
import { useParams, useLocation,useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/CreateTeam.css'
// Define available roles
const ROLES = ['Wicket Keeper', 'Batsman', 'All Rounder', 'Bowler'];

// Define role-based player limits
const ROLE_LIMITS = {
  "Wicket Keeper": { min: 1, max: 2 },
  "Batsman": { min: 1, max: 5 },
  "All Rounder": { min: 1, max: 5 },
  "Bowler": { min: 1, max: 5 },
};

const MAX_POINTS = 100; // total points cap

// Mapping API positions to readable roles
const positionToRole = {
  "Wicketkeeper": "Wicket Keeper",
  "Batsman": "Batsman",
  "Bowler": "Bowler",
  "Allrounder": "All Rounder",
  "Bowling Allrounder" : "All Rounder",
  "Batsman Allrounder": "All Rounder",
  "Batting Allrounder": "All Rounder",
   "Middle Order Batter" : 'Batsman',
   "Top Order Batter" : "Batsman"
};

const CreateTeam = ({
  mode = 'create',
  matchId: propMatchId,
  matchTitle: propMatchTitle,
  entryFee: propEntryFee,
    initialPlayers = [], // for edit mode
  initialCaptainId = null,
  initialViceCaptainId = null,
}) => {
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const [userTeam, setUserTeam] = useState({});
  const [captainId, setCaptainId] = useState('');
  const [viceCaptainId, setViceCaptainId] = useState('');
  const [totalPointsUsed, setTotalPointsUsed] = useState();
  const [lineupStatus, setLineupStatus] = useState('confirmed');

  const navigate = useNavigate();
  const location = useLocation();
  const { matchId: matchIdFromParams } = useParams();

  const matchId = propMatchId || matchIdFromParams;
  const { matchTitle: locMatchTitle, entryFee: locEntryFee } = location.state || {};
  const matchTitle = propMatchTitle || locMatchTitle;
  const entryFee = propEntryFee || locEntryFee;

  useEffect(() => {
    if (!matchId) return;

    //  Replaced fetch with axios
    axios.get(`http://localhost:5000/api/admin/squads/fetch-players/${matchId}`)
      .then(res => {
        const data = res.data?.data;
        console.log(data)
        const status = res.data?.lineup_status || 'confirmed';
          setLineupStatus(status);

        if (!data || data.length < 2) return;

        const [teamA, teamB] = data;

        const normalize = (players) =>
          players
            .filter(p => positionToRole[p.position] && p.points >= 0)
            .map(p => ({
              player_id: p.player_id,
              fullname: p.fullname,
              role: positionToRole[p.position],
              points: p.points || 0,
            }));

    const teamAProcessed = normalize(teamA.players);
    const teamBProcessed = normalize(teamB.players);


            setTeamAPlayers(teamAProcessed);
      setTeamBPlayers(teamBProcessed);

     //  Create playerId -> player map
   const allPlayersMap = {};
      [...teamAProcessed, ...teamBProcessed].forEach(p => {
        allPlayersMap[p.player_id] = p;
      })


      
  if (mode === 'edit' && initialPlayers?.length) {
        const reconstructedTeam = {};
        initialPlayers.forEach(p => {
          const fullPlayer = allPlayersMap[p.playerId];
          if (!fullPlayer) return; // skip if player not found (edge case)
          const role = p.role;
          if (!reconstructedTeam[role]) reconstructedTeam[role] = [];
          reconstructedTeam[role].push(fullPlayer);
        });
        setUserTeam(reconstructedTeam);
      }

    })
      .catch(err => console.error('Failed to fetch players', err));
  }, [matchId]);

  useEffect(() => {
    const used = Object.values(userTeam).flat().reduce((acc, p) => acc + p.points, 0);
    setTotalPointsUsed(used);
  }, [userTeam]);

  const isAlreadySelected = (id) =>
    Object.values(userTeam).flat().some(p => p.player_id === id);

  const handleAddPlayer = (player) => {
    if (isAlreadySelected(player.player_id)) return alert('Player already selected');
    if (Object.values(userTeam).flat().length >= 11) return alert('You can only select 11 players');
    if (totalPointsUsed + player.points > MAX_POINTS) return alert('You have reached 100 points limit');

    const role = player.role;
    const current = userTeam[role] || [];

    if (current.length >= ROLE_LIMITS[role].max) {
      return alert(`You can only select ${ROLE_LIMITS[role].max} ${role}(s)`);
    }

    setUserTeam(prev => ({
      ...prev,
      [role]: [...current, player],
    }));
  };

  const handleRemovePlayer = (role, id) => {
    setUserTeam(prev => {
      const updated = {
        ...prev,
        [role]: prev[role].filter(p => p.player_id !== id)
      };
      if (id === captainId) setCaptainId('');
      if (id === viceCaptainId) setViceCaptainId('');
      return updated;
    });
  };

  const handleSaveTeam = async () => {
    const allPlayers = Object.values(userTeam).flat();

    if (allPlayers.length !== 11) return alert('You must select exactly 11 players');
    if (!captainId || !viceCaptainId) return alert('Please select Captain and Vice-Captain');
    if (captainId === viceCaptainId) return alert('Captain and Vice-Captain must be different');

    const payload = {
      match_id: matchId,
      players: allPlayers.map(p => ({
        playerId: p.player_id,
        role: p.role
      })),
      captainId,
      viceCaptainId,
    };

    
    try {
      console.log(matchId)
      const token = localStorage.getItem('userToken');
      await axios.post(
        `http://localhost:5000/api/user/team/save/${matchId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Team saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save team.');
    }
  };

  const selectedPlayers = Object.values(userTeam).flat();

useEffect(() => {
  if (mode === "edit" && Array.isArray(initialPlayers)) {
    const grouped = {};
    initialPlayers.forEach(player => {
      const role = player.role;
      if (!grouped[role]) grouped[role] = [];
      grouped[role].push({
        player_id: player.playerId,
        fullname: player.fullname,
        points: player.points,
        role: role
      });
    });
    setUserTeam(grouped);
    if (initialCaptainId) setCaptainId(initialCaptainId);
    if (initialViceCaptainId) setViceCaptainId(initialViceCaptainId);
  }
}, [mode, initialPlayers, initialCaptainId, initialViceCaptainId]);


const handleShowTeams = ()=>{
      navigate('/user/teams',{match_id: matchId});
}

 return (
    <div className="team-builder-wrapper">``
      <h2>{mode === 'edit' ? 'Edit Your Team' : 'Fantasy Cricket Team Builder'}</h2>
      <div style={{ padding: '0.5rem' }}>
        
        <h2>{matchTitle}</h2>
        <h2>{matchId}</h2>
        <h3>Paid amount: ₹{entryFee}</h3>
        <h4>Total Points Used: {totalPointsUsed} / {MAX_POINTS}</h4>
      </div>

      <div className="teams-row" style={{ display: 'flex', gap: '2rem' }}>
        {/* Team A */}
        <div style={{ flex: 1 }}>
             {/* ⚠️ Warning if lineup is fallback */}
              {lineupStatus === 'fallback' && (
        <div style={{ backgroundColor: '#ff9800', padding: '10px', margin: '15px 0', color: 'white', borderRadius: '5px' }}>
          ⚠️ Final lineup not yet announced. You are viewing players from the last match.
        </div>
      )}
          <h3>Team A Pool</h3>
          {teamAPlayers.map(player => (
            <div
              key={player.player_id}
              style={{ padding: '5px', border: '1px solid #aaa', margin: '5px', cursor: 'pointer' }}
              onClick={() => handleAddPlayer(player)}
            >
              {player.fullname} ({player.role}) - {player.points} pts
            </div>
          ))}
        </div>

        {/* Team B */}
        <div style={{ flex: 1 }}>
          <h3>Team B Pool</h3>
          {teamBPlayers.map(player => (
            <div
              key={player.player_id}
              style={{ padding: '5px', border: '1px solid #aaa', margin: '5px', cursor: 'pointer' }}
              onClick={() => handleAddPlayer(player)}
            >
              {player.fullname} ({player.role}) - {player.points} pts
            </div>
          ))}
        </div>

        {/* User Team */}
        <div style={{ flex: 1 }}>
          <h3>Your Team</h3>
          {ROLES.map(role => (
            <div key={role} style={{ marginBottom: '8px' }}>
              <strong>{role}</strong>
              <div style={{ border: '1px dashed #999', padding: '4px', minHeight: 40 }}>
                {(userTeam[role] || []).map(player => (
                  <div key={player.player_id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{player.fullname} ({player.points} pts)</span>
                    <button onClick={() => handleRemovePlayer(role, player.player_id)}>❌</button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {selectedPlayers.length > 0 && (
            <>
              <div style={{ marginTop: '1rem' }}>
                <label>Captain:</label>
                <select value={captainId} onChange={e => setCaptainId(e.target.value)}>
                  <option value="">Select</option>
                  {selectedPlayers.map(p => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.fullname}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label>Vice-Captain:</label>
                <select value={viceCaptainId} onChange={e => setViceCaptainId(e.target.value)}>
                  <option value="">Select</option>
                  {selectedPlayers.map(p => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.fullname}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <button onClick={handleSaveTeam} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        {mode === 'edit' ? 'Save Changes' : 'Create Team'}
      </button>

      <button onClick={handleShowTeams}>
        show teams 
      </button>
    </div>
  );
  
};

export default CreateTeam;


