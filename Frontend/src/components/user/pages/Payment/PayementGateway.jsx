// PaymentGateway.jsx
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



const PaymentGateway = () => {
  const { state } = useLocation();
  const navigate = useNavigate()
  useEffect(() => {
    if (!state?.contestId) {
      // Redirect if no contest data
      navigate('/create-team');
    }
  }, []);


   const handleCreateaTeam = ()=>{
    
   }

  return (
    <div>
      <h2>Payment Gateway</h2>
      <p>Contest: {state?.contestId}</p>
      <p>Amount: ₹{state?.amount}</p>
      {/* Payment integration */}
         <button onClick={handleCreateaTeam}>
            Create Team
         </button>

    </div>
  );
};

export default PaymentGateway;
