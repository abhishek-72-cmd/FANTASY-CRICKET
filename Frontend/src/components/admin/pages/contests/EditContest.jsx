import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styling/EditContest.css';

const EditContest = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch contest data
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(
          `http://localhost:5000/api/admin/contests/viewById/${contestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log(`response for contest data ${res}`)

        const contest = res.data.contest;
        setForm({
          prize_pool: contest.prize_pool || '',
          max_prize_pool: contest.max_prize_pool || '',
          buy_in: contest.buy_in || '',
          entry_fee: contest.entry_fee || '',
          min_players: contest.min_players || '',
          max_players: contest.max_players || '',
          winner_type: contest.winner_type || '',
          visible_until: contest.visible_until?.slice(0, 16) || '',
          registration_opens: contest.registration_opens?.slice(0, 16) || ''
        });
      } catch (err) {
        console.error('Failed to fetch contest:', err);
        alert('Failed to fetch contest details.');
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [contestId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `http://localhost:5000/api/admin/contests/update/${contestId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Contest updated successfully');
      navigate('/admin/matches');
    } catch (err) {
      console.error('Error updating contest:', err);
      alert('Failed to update contest');
    }
  };

  if (loading) {
    return (
      <div className="vc-screen">
        <div className="vc-loading">
          <div className="vc-spinner" />
          <div className="vc-loading-text">Loading contest details...</div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="vc-screen">
        <div className="vc-not-activated">
          <div className="vc-na-title">Failed to load contest data.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-contest-container">
      <h2>Edit Contest</h2>
      <form onSubmit={handleSubmit} className="edit-contest-form">
        {Object.entries(form).map(([key, value]) => (
          <div className="form-group" key={key}>
            <label>{key.replace(/_/g, ' ').toUpperCase()}</label>
            <input
              type={
                key.includes('visible_until') || key.includes('registration_opens')
                  ? 'datetime-local'
                  : 'text'
              }
              name={key}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${key.replace(/_/g, ' ')}`}
            />
          </div>
        ))}
        <button type="submit" className="update-button">Update Contest</button>
      </form>
    </div>
  );
};

export default EditContest;

