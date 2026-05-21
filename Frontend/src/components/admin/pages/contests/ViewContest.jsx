import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import '../../styling/ViewContest.css'
const ViewContest = () => {
  const { fixtureId } = useParams();
  const navigate = useNavigate();

  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContests = async () => {
  
      try {
        const response = await axios.get(
          `http://localhost:5000/api/admin/contests/view/${fixtureId}`
        );
        setContests(response.data.contests || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch contests.");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [fixtureId]);

  const handleEdit = (id) => {
    navigate(`/admin/edit-contest/${id}`);
    console.log ({id})
 
  };

  const handleDelete = (id) => {
    navigate(`/admin/delete-contest/${id}`);
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
          {contests.map((contest) => (
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
              <p>
                <strong>Title:</strong> {contest.match_title}
              </p>
              <p>
                <strong>Prize Pool:</strong> ₹{contest.prize_pool}
              </p>
              <p>
                <strong>Entry Fee:</strong> ₹{contest.entry_fee}
              </p>
              <p>
                <strong>Players:</strong> {contest.min_players} -{" "}
                {contest.max_players}
              </p>
              <p>
                <strong>Winner Type:</strong>{" "}
                {contest.winner_type === "single"
                  ? "Single Winner"
                  : "Multiple Winners"}
              </p>

              <div style={{ marginTop: "1rem" }}>
                <button
                  onClick={() => handleEdit(contest.id)}
                  style={{
                    marginRight: "0.5rem",
                    padding: "0.5rem 1rem",
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit Contest
                </button>

                <button
                  onClick={() => handleDelete(contest.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete Contest
                </button>
              </div>
              
            </div>

  

          ))}
        </div>
      )}
    </div>
  );
};

export default ViewContest;
