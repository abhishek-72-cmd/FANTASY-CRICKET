import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';
import ('../../styles/UserMatches.css')

const UserMatches = () => {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {



    const fetchFixtures = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/fixtures/FetchFromDB/getFixtures');
        
        if (response.data.success) {
          // Transform data to only include needed fields
          const filteredFixtures = response.data.data.map(fixture => ({
            id: fixture.id,
            matchName: fixture.round,
            dateTime: fixture.starting_at,
            matchType: fixture.type,
            homeTeam: {
              name: fixture.localteam_name,
              code: fixture.localteam_code,
              image: fixture.localteam_image
            },
            awayTeam: {
              name: fixture.visitorteam_name,
              code: fixture.visitorteam_code,
              image: fixture.visitorteam_image
            }
          }));
          
          setFixtures(filteredFixtures);


        } else {
          throw new Error('Failed to fetch fixtures');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, []);


  // Format date to be more readable

const formatDate = (utcDate) => {
  const date = new Date(utcDate);
  const istDate = new Date(date.getTime()); 
  return istDate.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

  if (loading) return <div className="loading-spinner">Loading fixtures...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;



const handleViewContest = (fixture)=>{
  console.log ('navigating to view contest');
  navigate(`/user/viewContest/${fixture.id}`)
}


   const handleLogout  = ()=>{
    localStorage.removeItem('admin_token')
    navigate('/')
   }


const handleShowTeams = ()=>{
  navigate ('/user/teams')
}


const handleRefresh = async ()=>{
  try{
const response = axios.get ('localhost:5000/api/admin/fixtures/FetchFromDB/getFixtures')

console.log(response.data)
alert('Fixture Refreshed')
  } catch(err){
    alert (' can not refresh fixtures',err)
  }
}

  return (                  
    <div className="fixtures-container">




<div>
  <button className='create-logout-btn' onClick={handleLogout}>Logout</button>
</div> <br /> <br />
      
<div> 
     <button className='show-teams-btn'  onClick={handleShowTeams} > show teams </button>   
   </div> <br />
   <div> 
     <button className='show-teams-btn'  onClick={handleRefresh} > refrest fixtures </button>   
   </div>


      <h2 className="fixtures-title">Upcoming Matches</h2>
      
      <div className="fixtures-grid">
        {fixtures.map((fixture) => (
          <div key={fixture.id} className="fixture-card">
            <div className="match-header">
              <span className="match-type">{fixture.matchType}</span>
              <span className="match-type">{fixture.id}</span>
              <span className="match-date">{formatDate(fixture.dateTime)}</span>
            </div>
            
            <div className="match-name">{fixture.matchName}</div>
            
            <div className="teams-container">
              <div className="team">
                <img 
                  src={fixture.homeTeam.image} 
                  alt={fixture.homeTeam.name} 
                  className="team-logo"
                onError={(e) => {
  e.target.onerror = null; // prevent infinite loop
  e.target.src = 'https://placehold.co/50x50?text=Team';
}}
                />
                <div className="team-info">
                  <span className="team-name">{fixture.homeTeam.name}</span>
                  <span className="team-code">{fixture.homeTeam.code}</span>
                </div>
              </div>
              
              <div className="vs-separator">VS</div>
              
              <div className="team">
                <img 
                  src={fixture.awayTeam.image} 
                  alt={fixture.awayTeam.name} 
                  className="team-logo"
               onError={(e) => {
  e.target.onerror = null; // prevent infinite loop
  e.target.src = 'https://placehold.co/50x50?text=Team';
}}
                />
                <div className="team-info">
                  <span className="team-name">{fixture.awayTeam.name}</span>
                  <span className="team-code">{fixture.awayTeam.code}</span>
                </div>
              </div>
            </div>
            
  <div className="match-actions">
  <button 
    className="create-contest-btn"
    onClick={() => handleViewContest(fixture)}
  >
    View Contest
  </button> 
</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserMatches;