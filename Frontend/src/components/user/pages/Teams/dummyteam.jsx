  
import React, { useEffect, useState, useRef } from 'react';
import Sortable from 'sortablejs';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/CreateTeam.css';

const CreateTeam = ({
  mode = 'create',                // 'create' or 'edit'
  initialPlayers = [],            // players already selected (edit mode)
  matchId: propMatchId,
  matchTitle: propMatchTitle,
  entryFee: propEntryFee,
  onSubmit,                       // optional callback to handle save (edit mode)
}) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { matchId: matchIdFromParams } = useParams();

  // 👇 Derive data
  const matchId = propMatchId || matchIdFromParams;
  const { matchTitle: locMatchTitle, entryFee: locEntryFee, contestId } = location.state || {};
  const matchTitle = propMatchTitle || locMatchTitle;
  const entryFee = propEntryFee || locEntryFee;

  console.log('matchId:', matchId);
  console.log('matchTitle:', matchTitle);
  console.log('entryFee:', entryFee);
  console.log('initialPlayers:', initialPlayers);

  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);
  const teamARef = useRef(null);
  const teamBRef = useRef(null);
  const userTeamRefs = useRef([]);

  const ROLE_LIMITS = {
    "Captain": { min: 1, max: 1 },
    "Vice Captain": { min: 1, max: 1 },
    "Wicket Keeper": { min: 1, max: 1 },
    "Batsman": { min: 3, max: 5 },
    "All Rounder": { min: 1, max: 5 },
    "Bowler": { min: 3, max: 5 },
  };
  const ROLES = Object.keys(ROLE_LIMITS);

  // Fetch players for the match
  useEffect(() => {
    if (!matchId) {
      console.error("No matchId found!");
      return;
    }
    fetch(`http://localhost:5000/api/admin/squads/get-or-fetch-players/${matchId}`)
      .then(res => res.json())
      .then(data => {
        setTeamAPlayers(data.localPlayers || []);
        setTeamBPlayers(data.visitorPlayers || []);
      })
      .catch(err => console.error(`Error fetching players`, err));
  }, [matchId]);

  // Initialize Sortable for player pools
  useEffect(() => {
    if (teamARef.current) {
      Sortable.create(teamARef.current, {
        group: { name: 'players', pull: 'clone', put: false },
        sort: false,
        animation: 150,
      });
    }
    if (teamBRef.current) {
      Sortable.create(teamBRef.current, {
        group: { name: 'players', pull: 'clone', put: false },
        sort: false,
        animation: 150,
      });
    }
  }, []);

  // Initialize Sortable for user's team
useEffect(() => {
  userTeamRefs.current.forEach((ref, idx) => {
    if (ref) {
      ref.innerHTML = '';

      Sortable.create(ref, {
        group: 'players',
        animation: 150,
        onAdd: () => {
          // Count total players in all userTeamRefs
          const totalSelected = userTeamRefs.current.reduce((count, container) => {
            if (!container) return count;
            return count + container.querySelectorAll('.player-card').length;
          }, 0);

          if (totalSelected > 11) {
            alert('You can select a maximum of 11 players.');
            // Remove the last dropped player
            ref.lastChild?.remove();
          }
        },
        onMove: (evt) => {
          // Optional: auto-scroll here if desired
          const { clientY } = evt.originalEvent;
          const bottomThreshold = window.innerHeight - 100;
          const topThreshold = 100;

          if (clientY > bottomThreshold) {
            window.scrollBy(0, 10);
          } else if (clientY < topThreshold) {
            window.scrollBy(0, -10);
          }
        }
      });

      if (mode === 'edit' && initialPlayers?.length > 0) {
        const role = ROLES[idx];
        const playersForRole = initialPlayers.filter(p => p.role === role);

        playersForRole.forEach(p => {
          const div = document.createElement('div');
          div.className = 'player-card';
          div.dataset.id = p.id || p.playerId;
          div.dataset.role = p.role;
          div.textContent = `${p.fullname || p.playerId} (${p.role})`;
          div.style.padding = '5px';
          div.style.border = '1px solid #aaa';
          div.style.margin = '5px';

          ref.appendChild(div);
        });
      }
    }
  });
}, [initialPlayers, mode]);

  const handleSaveTeam = async () => {
    const selectedPlayers = [];

    userTeamRefs.current.forEach((ref, idx) => {
      const role = ROLES[idx % ROLES.length];
      const players = Array.from(ref.querySelectorAll('.player-card')).map(el => ({
        playerId: el.dataset.id,
        role,
      }));
      selectedPlayers.push(...players);
    });

    console.log('Selected players:', selectedPlayers);

    if (selectedPlayers.length === 0) {
      alert('Please select at least one player.');
      return;
    }

    const token = localStorage.getItem("userToken") || localStorage.getItem("adminToken");
    if (!token) {
      alert("You are not logged in! Please login first.");
      return;
    }

    try {
      if (mode === 'edit' && typeof onSubmit === 'function') {
        // Call provided edit handler
        await onSubmit(selectedPlayers);
      } else {
        // Default create team save
        const res = await axios.post(
          'http://localhost:5000/api/user/team/save/',
          {
            match_id: matchId,
            players: selectedPlayers,
            contest_id: contestId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        alert(res.data.message || 'Team saved successfully');
        navigate('/user/teams');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving team');
    }
  };

  const handleShowTeams = () => {
    navigate('/user/teams',{match_id: matchId});
  };

  const removeZoneRef = useRef(null);

useEffect(() => {
  if (removeZoneRef.current) {
    Sortable.create(removeZoneRef.current, {
      group: 'players',
      animation: 150,
      onAdd: (evt) => {
        evt.item.remove(); // removes the element from DOM
      }
    });
  }
}, []);


  return (
    <div className="team-builder-wrapper">
      <h2>{mode === 'edit' ? 'Edit Your Team' : 'Fantasy Cricket Team Builder'}</h2>
      <div style={{ padding: '0.5rem' }}>
        <h2>{matchTitle}</h2>
        <h3>Paid amount: ₹{entryFee}</h3>
      </div>

      <div className="teams-row" style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <h3>Team A Pool</h3>
          <div ref={teamARef} style={{ minHeight: 100, border: '1px solid #ccc', padding: '10px' }}>
            {teamAPlayers.map(player => (
              <div
                key={player.player_id}
                className="player-card"
                data-id={player.player_id}
                data-role={player.position}
                style={{ padding: '5px', border: '1px solid #aaa', margin: '5px' }}
              >
                {player.fullname} ({player.position})
                
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Team B Pool</h3>
          <div ref={teamBRef} style={{ minHeight: 100, border: '1px solid #ccc', padding: '10px' }}>
            {teamBPlayers.map(player => (
              <div
                key={player.player_id}
                className="player-card"
                data-id={player.player_id}
                data-role={player.position}
                style={{ padding: '5px', border: '1px solid #aaa', margin: '5px' }}
              >
                {player.fullname} ({player.position})
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>Your Team</h3>
          {ROLES.map((role, idx) => (
            <div key={idx} style={{ marginBottom: '8px' }}>
              <strong>{role}</strong>
              <div
                ref={el => {
                  if (!userTeamRefs.current[idx]) {
                    userTeamRefs.current[idx] = el;
                  }
                }}
                style={{ minHeight: '40px', border: '1px dashed #999', marginTop: '2px', padding: '2px' }}
              ></div>
            </div>
          ))}
        </div>
      </div>

<div
  ref={removeZoneRef}
  style={{
    marginTop: '2rem',
    padding: '1rem',
    border: '2px dashed red',
    minHeight: '50px',
    textAlign: 'center',
    color: 'red',
      scrollTarget: window 

  }}
>
  Drop here to remove player
</div>


      <button onClick={handleSaveTeam} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        {mode === 'edit' ? 'Save Changes' : 'Create Team'}
      </button>

      <button onClick={handleShowTeams} style={{ marginTop: '1rem', marginLeft: '1rem', padding: '0.5rem 1rem' }}>
        Show My Teams
      </button>
    </div>
  );
};

export default CreateTeam;