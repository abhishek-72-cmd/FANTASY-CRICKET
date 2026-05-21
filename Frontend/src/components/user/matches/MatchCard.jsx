import React from 'react';
import { useNavigate } from 'react-router-dom';

const MatchCard = ({match})=>{

  const navigate = useNavigate();

const handleClick = ()=>{
 navigate(`/match/${match.id}`)
}

    return (

           <div className="bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-xl transition" onClick={handleClick}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{match.name}</h2>
        <img src={match.league_hash_image} alt="League" className="w-10 h-10" />
      </div>
      <p className="text-sm text-gray-600">{new Date(match.start_time).toLocaleString()}</p>
      <p className="text-sm font-medium">Tournament: {match.tournament_name}</p>
    </div>

    
    )
}

export default MatchCard;
