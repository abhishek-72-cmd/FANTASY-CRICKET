
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DeleteContest = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const hasExecuted = useRef(false); // Track if effect has run

  useEffect(() => {
    if (hasExecuted.current) return; // Skip if already executed
    hasExecuted.current = true;

    const deleteContest = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No admin token found - please login');
        }

        // Single confirmation dialog
        if (!window.confirm(`Are you sure you want to delete contest ${contestId}?`)) {
          return navigate('/admin/matches');
        }

        const response = await axios.delete(
          `http://localhost:5000/api/admin/contests/delete/${contestId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          alert('Contest deleted successfully');
        } else {
          alert(response.data.message || 'Failed to delete contest');
        }
      } catch (error) {
        console.error('Delete error details:', error);
        
        if (error.response?.status === 401) {
          alert('Authentication failed. Please login again.');
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else if (error.response?.status === 403) {
          alert('Access denied: Admin privileges required');
        } else {
          alert(`Error: ${error.response?.data?.message || error.message}`);
        }
      } finally {
    navigate('/admin/matches')
      }
    };

    deleteContest();
  }, [contestId, navigate]);

  return <div>Processing deletion request...</div>;
};

export default DeleteContest;