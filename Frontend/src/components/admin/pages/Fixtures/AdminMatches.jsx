import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styling/AdminMatches.css'
import { useNavigate  } from 'react-router-dom';

const AdminMatches = () => {
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


const handleSync = async () => {
  try {
    const { data } = await axios.post('http://localhost:5000/api/admin/fixtures/admin/savefixtures', {},{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (data.message.includes('0 fixtures')) {
      alert('No new matches found to sync');
    } else {
      alert(`Success: ${data.message}`);
      // Optionally refresh your matches list here
    }
  } catch (error) {
    console.error('Sync failed:', error);
    alert(error.response?.data?.error || 'Failed to sync fixtures');
    
  }
};

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



const handleCreateContest = (fixture) => {
  console.log('Creating contest for fixture:', fixture);
  navigate(`/admin/create-contest/${fixture.id}`, {
    state: {
      match_title: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
      home_team: fixture.homeTeam.name,
      away_team: fixture.awayTeam.name,
      start_time: fixture.dateTime
    }
  });
};


const handleViewSquad = (fixture)=>{
  navigate(`/admin/view-squad/${fixture.id}`, {
    state: {
        match_title: `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`,
      home_team: fixture.homeTeam.name,
      away_team: fixture.awayTeam.name,
      start_time: fixture.dateTime
    }
  })
}


const handleViewContest = (fixture)=>{
  console.log ('navigating to view contest');
  navigate(`/admin/viewContest/${fixture.id}`)
}


   const handleLogout  = ()=>{
    localStorage.removeItem('admin_token')
    navigate('/')
   }



 const handleRefreshFixtures = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        'http://localhost:5000/api/admin/fixtures/FetchFromDB/getFixtures',
        {
          headers: {
            Expires: '0'
          }
        }
      );
      if (response.data.success) {
        setFixtures(response.data.data); // Update state with fetched matches
        alert('Fixtures refreshed successfully!');
      } else {
        setError('No updates found');
        alert('No updates found');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to refresh fixtures';
      setError(errorMessage);
      console.error('Error fetching fixtures:', err);
      alert(`Failed to refresh fixtures: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }


  return (                  
    <div className="fixtures-container">


<div>
  <button 
  className="create-contest-btn"
  onClick={handleLogout}>Logout</button>
</div>

<div> <br />
  <button 
  className="create-contest-btn"
  onClick={handleSync}> sync upcomming matches</button>
</div>
      

<div> <br />
  <button 
  className="create-contest-btn"
  onClick={handleRefreshFixtures}> refresh fixtures </button>
</div>

      <h2 className="fixtures-title">Upcoming Matches </h2>
      
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
    className="create-contest-btn_red"
    onClick={() => handleViewSquad(fixture)}
  >
   view squad
  </button> 
</div>

  <div className="match-actions">
  <button 
    className="create-contest-btn"
    onClick={() => handleCreateContest(fixture)}
  >
    Create Contest
  </button> 
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

export default AdminMatches;