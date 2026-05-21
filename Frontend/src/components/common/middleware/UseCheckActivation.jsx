import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UseCheckActivation = (fixtureId)=>{

const [isActivated, setIsActivated] = useState(null)
 const [loading, setLoading] = useState( null)
const [error,setError] = useState(null);

useEffect (()=>{
if(!fixtureId) return;

  const fetchActivationStatus = async ()=>{
    
    try{
  const response =  await axios.get (`http://localhost:5000/api/admin/activation/admin/activation-status/${fixtureId}`)

setIsActivated(response.data.is_activated)


    } catch (err){
           console.error('Error checking activation status:', err);
        setError('Unable to check activation status.');
    } finally {
        setLoading(false);
    }
  }

fetchActivationStatus()
}, [fixtureId])
 return { isActivated, loading, error };
}

export default UseCheckActivation;