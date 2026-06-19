import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const DeleteUserTeam = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  let isCalled = false

  useEffect(() => {
    const deleteTeam = async () => {
         if (isCalled) return; // prevent 2nd call
    isCalled = true;
      const confirmDelete = window.confirm('Are you sure you want to delete this team?');
      if (!confirmDelete) {
        navigate('/user/teams');
        return;
      }

      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      if (!token) {
        alert('Not logged in');
        navigate('/login');
        return;
      }

      try {
        const res = await axios.delete(`${API_URL}/api/user/team/delete/${teamId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        alert(res.data.message || 'Team deleted successfully');
        navigate('/user/teams',{ replace: true }); // back to teams list
      } catch (err) {
        console.error(err);
        navigate('/user/teams');
      }
    };

    deleteTeam();

    return ()=>{
           isCalled = true; // cleanup
    }
  }, [navigate, teamId]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h3>Deleting team #{teamId}...</h3>
    </div>
  );
};

export default DeleteUserTeam;


