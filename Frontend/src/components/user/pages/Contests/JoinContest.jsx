import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/JoinContest.css";

const JoinContest = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const handleJoinContest = () => {
    // Directly navigate to create team page with match ID
    navigate(`/user/create_team/${state.matchId}`, {
      state: {
        contestId: state.contestId,
        matchTitle: state.matchTitle,
        entryFee: state.totalFee
      }
    });
  };

  return (
    <div className="join-contest-container">
      <h2 className="contest-title">Join Contest: {state.matchTitle}</h2>
      
      <div className="contest-details">
        <p className="detail-item">
          <span className="detail-label">Entry Fee:</span>
          <span className="detail-value">₹{state.totalFee}</span>
        </p>
        
        <p className="detail-item">
          <span className="detail-label">Time Remaining:</span>
          <span className="detail-value">{state.timeRemaining}</span>
        </p>
      </div>

      <button 
        className="pay-button" 
        onClick={handleJoinContest}
      >
        Join Contest
      </button>
    </div>
  );
};

export default JoinContest;