import { useState } from "react"
import axios from 'axios';


// const UseMatchActivation = (matchId)=>{

// const [activating, setActivating] = useState(false);

// const activateMatch = async ()=>{

//     const confirm = window.confirm("Are you sure you want to activate this match? Once activated, users will be able to see the squad and join contests.")
//     if (!confirm) return false;

//      const adminToken = localStorage.getItem('adminToken');
//     if (!adminToken) {
//       console.error('Admin token not found');
//       alert('Admin token missing. Please log in again.');
//       return false;
//     }

//       try {
//       setActivating(true);
//       await axios.post(
//         `http://localhost:5000/api/admin/activation/admin/activate-match/${matchId}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${adminToken}`
//           }
//         }
//       );
//       return true;
//     } catch (err) {
//       console.error("Error activating match:", err);
//       alert("Failed to activate match");
//       return false;
//     } finally {
//       setActivating(false);
//     }
//   };

//   return { activateMatch, activating };
// }

// export default UseMatchActivation


const UseMatchActivation = (matchId) => {
  const [checkContest, setCheckContest] = useState(null);
  const [checkPoints, setCheckPoints] = useState(null);
  const [activating, setActivating] = useState(false);

  const activateMatch = async () => {
    const confirm = window.confirm(
      "Are you sure you want to activate this match? Once activated, users will be able to see the squad and join contests."
    );
    if (!confirm) return false;

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      console.error('Admin token not found');
      alert('Admin token missing. Please log in again.');
      return false;
    }

    try {
      setActivating(true);
      // ✅ 1. Check if at least one contest is created

      const contestRes = await axios.get(
        `http://localhost:5000/api/admin/contests/view/${matchId}`
      );

      const contests = contestRes?.data?.contests || [];

      if (!contests.length) {
        alert("❌ Please create at least one contest before activating the match.");
        setCheckContest(false);
        return false;
      } else {
        setCheckContest(true);
      }

      // ✅ 2. Check if player credit points have been updated
      const pointsRes = await axios.get(
        `http://localhost:5000/api/admin/points/get-points/${matchId}`
      );
      const pointsPresent = pointsRes?.data?.pointsAvailable;

      if (!pointsPresent) {
        const missingCredits = pointsRes?.data?.missingCredits;
        alert(
          missingCredits
            ? `❌ Please update player credit points before activating the match. Missing credits: ${missingCredits}`
            : "❌ Please update player credit points before activating the match."
        );
        setCheckPoints(false);
        return false;
      } else {
        setCheckPoints(true);
      }

      // ✅ 3. Proceed with activation
      await axios.post(
        `http://localhost:5000/api/admin/activation/admin/activate-match/${matchId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      alert("✅ Match activated successfully.");
      window.location.reload();
      return true;
    } catch (err) {
      console.error("Error activating match:", err);
      alert("⚠️ Failed to activate match. SESSION EXPIRED PLEASE LOGIN AGAIN.");
      return false;
    } finally {
      setActivating(false);
    }
  };

  return { activateMatch, activating, checkContest, checkPoints };
};

export default UseMatchActivation;
