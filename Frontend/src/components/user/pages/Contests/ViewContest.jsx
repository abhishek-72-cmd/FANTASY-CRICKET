import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import '../../styles/ViewContests.css'
import UseCheckActivation from "../../../common/middleware/UseCheckActivation";

const ViewContest = () => {
  const { fixtureId } = useParams();
const {isActivated, loading, error} = UseCheckActivation(fixtureId)
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);


  useEffect(() => {

    const fetchContests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/admin/contests/view/${fixtureId}`
        );
        setContests(response.data.contests || []);
      } catch (err) {
        console.error(err);
      } 
    };
    if (isActivated) {
      fetchContests();
    }

  }, [fixtureId,isActivated]);



  if (loading) return <div>Checking activation...</div>;
  if (error) return <div>{error}</div>;
  if (!isActivated) return <div>This match is not yet activated.</div>;




  const calculateTotalEntryFee = (contest) => {
    const buyIn = parseFloat(contest.buy_in) || 0;
    const entryFee = parseFloat(contest.entry_fee) || 0;
    return (buyIn + entryFee).toFixed(2);
  };

  const calculateTimeRemaining = (visibleUntil) => {
    const endTime = new Date(visibleUntil).getTime();
    const now = Date.now();
    const diffMs = endTime - now;

    if (diffMs <= 0) return "Expired";

    const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));

    return `${hours}h ${minutes}m remaining`;
  };

  const handleJoinContest = (contest) => {
    const totalFee = calculateTotalEntryFee(contest);
    const timeRemaining = calculateTimeRemaining(contest.visible_until);

    navigate(`/user/joinContest/${contest.id}`, {
      state: {
        contestId: contest.id,
        totalFee,
        matchTitle: contest.match_title,
        timeRemaining,
        matchId: contest.match_id
      }
    });
    console.log ('my contest',{contest})
  };

  if (loading) return <div>Loading contests...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Contests for Match ID: {fixtureId}</h2>

      {contests.length === 0 ? (
        <p>No contests found for this match.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {contests.map((contest) => {
            const totalEntryFee = calculateTotalEntryFee(contest);
            const timeRemaining = calculateTimeRemaining(contest.visible_until);

            return (
              <div
                key={contest.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "1rem",
                  background: "#f9f9f9",
                }}
              >
                <h4>Contest ID: {contest.id}</h4>
                <p><strong>Title:</strong> {contest.match_title}</p>
                <p><strong>Prize Pool:</strong> ₹{contest.prize_pool}</p>
                <p><strong>Entry Fee:</strong> ₹{totalEntryFee}</p>
                <p><strong>Players:</strong> {contest.min_players} - {contest.max_players}</p>
                <p><strong>Winner Type:</strong> {contest.winner_type === "single" ? "Single Winner" : "Multiple Winners"}</p>
                <p><strong>Time Remaining:</strong> {timeRemaining}</p>

                <div style={{ marginTop: "1rem" }}>
                  <button
                    onClick={() => handleJoinContest(contest)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Join Contest
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

// return (
//     <div>
//       <h2>Available Contests</h2>
//       {loading ? (
//         <p>Loading contests...</p>
//       ) : error ? (
//         <p>{error}</p>
//       ) : (
//         <div>
//           {contests.map((contest) => {
//             const timeRemaining = calculateTimeRemaining(contest.start_time); // make sure you define this function
//             const totalEntryFee = contest.entry_fee;

//             return (
//               <div
//                 key={contest.id}
//                 style={{
//                   border: "1px solid #ccc",
//                   borderRadius: "8px",
//                   padding: "1rem",
//                   background: "#f9f9f9",
//                   marginBottom: "1rem",
//                 }}
//               >
//                 <h4>Contest ID: {contest.id}</h4>
//                 <p><strong>Title:</strong> {contest.match_title}</p>
//                 <p><strong>Prize Pool:</strong> ₹{contest.prize_pool}</p>
//                 <p><strong>Entry Fee:</strong> ₹{totalEntryFee}</p>
//                 <p><strong>Players:</strong> {contest.min_players} - {contest.max_players}</p>
//                 <p><strong>Winner Type:</strong> {contest.winner_type === "single" ? "Single Winner" : "Multiple Winners"}</p>
//                 <p><strong>Time Remaining:</strong> {timeRemaining}</p>

//                 <div style={{ marginTop: "1rem" }}>
//                   <button
//                     onClick={() => handleJoinContest(contest)}
//                     style={{
//                       padding: "0.5rem 1rem",
//                       background: "#4CAF50",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "4px",
//                       cursor: "pointer",
//                     }}
//                   >
//                     Join Contest
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
// );


};

export default ViewContest;

