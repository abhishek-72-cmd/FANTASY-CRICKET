import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CreateTeam from "./CreateTeam";
import '../../styles/EditUserTeam.css'
// const EditUserTeam = () => {
//   const { teamId } = useParams();
//   console.log (teamId)
//   const navigate = useNavigate();

//   const [team, setTeam] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [updatedPlayers, setUpdatedPlayers] = useState([]);

//   useEffect(() => {
//     const fetchTeam = async () => {
//       const token =
//         localStorage.getItem("userToken") || localStorage.getItem("adminToken");

//       if (!token) {
//         alert("Please log in first");
//         navigate("/login");
//         return;
//       }

//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/user_teams/my_teams`, // you may want a specific endpoint to fetch a single team
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const foundTeam = res.data.teams.find((t) => t.team_id === Number(teamId));
//         if (!foundTeam) {
//           setError("Team not found");
//           setLoading(false);
//           return;
//         }

//         setTeam(foundTeam);
//         setUpdatedPlayers(foundTeam.players);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch team");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeam();
//   }, [teamId, navigate]);

//   const handleRoleChange = (index, newRole) => {
//     const playersCopy = [...updatedPlayers];
//     playersCopy[index].role = newRole;
//     setUpdatedPlayers(playersCopy);
//   };

//   const handleSave = async () => {
//     const token =
//       localStorage.getItem("userToken") || localStorage.getItem("adminToken");

//     if (!token) {
//       alert("Please log in first");
//       navigate("/login");
//       return;
//     }

//     try {
//       await axios.put(
//         `http://localhost:5000/api/db/fetch_api_data/edit_team/${teamId}`,
//         { players: updatedPlayers },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       alert("Team updated successfully!");
//       navigate("/user/teams");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update team");
//     }
//   };

//   if (loading) return <p>Loading team data...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>Edit Team #{team.team_id}</h2>
//       <h3>{team.match.title}</h3>
//       <p>Contest: {team.contest.match_title} — ₹{team.contest.total_fee}</p>

//       <div style={{ marginTop: "1rem" }}>
//         {updatedPlayers.map((player, idx) => (
//           <div
//             key={idx}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               marginBottom: "0.5rem",
//               gap: "1rem",
//             }}
//           >
//             <span>
//               {player.fullname} ({player.id})
//             </span>
//             <select
//               value={player.role}
//               onChange={(e) => handleRoleChange(idx, e.target.value)}
//             >
//               <option value="Captain">Captain</option>
//               <option value="Vice Captain">Vice Captain</option>
//               <option value="Wicket Keeper">Wicket Keeper</option>
//               <option value="Batsman">Batsman</option>
//               <option value="Bowler">Bowler</option>
//               <option value="All Rounder">All Rounder</option>
//             </select>
//           </div>
//         ))}
//       </div>

//       <button
//         style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
//         onClick={handleSave}
//       >
//         Save Changes
//       </button>
//     </div>
//   );
// };

// export default EditUserTeam;



const EditUserTeam = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(`http://localhost:5000/api/user/team/my_teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const found = res.data.teams.find(t => t.team_id === Number(teamId));
      setTeam(found);
    };
    fetchTeam();
  }, [teamId]);

  const handleUpdate = async (players) => {
    const token = localStorage.getItem("userToken");
    await axios.put(`http://localhost:5000/api/user/team/edit_team/${teamId}`, { players }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Team updated successfully");
    navigate('/user/teams');
  };

  if (!team) return <p>Loading…</p>;

  return (
<CreateTeam
    mode="edit"
  matchId={team.match.id}
  matchTitle={team.match.title}
  entryFee={team.contest.total_fee}
  initialPlayers={team.players}
  initialCaptainId={team.captainId}
  initialViceCaptainId={team.viceCaptainId}
  onSubmit={handleUpdate}
/>
  );
};

export default EditUserTeam;