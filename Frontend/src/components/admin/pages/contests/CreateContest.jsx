import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../../styling/CreateContest.css';

const CreateContest = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    match_id: '',
    match_title: '',
    prize_pool: '',
    max_prize_pool: '',
    buy_in: '',
    entry_fee: '',
    min_players: '2',
    max_players: '100',
    winner_type: 'multiple',
    visible_until: '',
    registration_opens: '' ,
     start_time: '',
  formattedStartTime: '',
  remainingTime: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // Initialize form with location state
  useEffect(() => {
    console.log('Location state:', location.state);
    if (location.state) {

        const startTimeStr = location.state.start_time || '';
    const startDate = new Date(startTimeStr);

    const formattedStartTime = startDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  console.log (formattedStartTime)
    // Calculate remaining time
    const now = new Date();
    let diff = Math.max(0, startDate - now); // in ms

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const remainingTime = `${hours}h ${minutes}m ${seconds}s`;
   console.log (remainingTime)

      setForm(prev => ({
        ...prev,
        match_id: matchId,
        match_title: location.state.match_title || '',
        home_team: location.state.home_team || '',
        away_team: location.state.away_team || '',
        start_time: location.state.start_time || '',
        formattedStartTime,
        remainingTime       
      }));
    }
  }, [matchId, location.state]);




  

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'prize_pool', 'buy_in', 'min_players', 'max_players',
      'winner_type', 'visible_until', 'registration_opens'
    ];

    requiredFields.forEach(field => {
      if (!form[field] || form[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // Numeric validation
    if (form.prize_pool && isNaN(form.prize_pool)) {
      newErrors.prize_pool = 'Must be a number';
    }
    if (form.buy_in && isNaN(form.buy_in)) {
      newErrors.buy_in = 'Must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started', form);

    if (!validateForm()) {
      console.log('Form validation failed', errors);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please login first');
      navigate('/admin/login');
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting form with data:', form);

    try {
      const payload = {
        ...form,
        match_id: Number(form.match_id),
        prize_pool: Number(form.prize_pool),
        buy_in: Number(form.buy_in),
        min_players: Number(form.min_players),
        max_players: Number(form.max_players)
      };

      console.log('Final payload:', payload);

      const response = await fetch('http://localhost:5000/api/admin/contests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to create contest');
      }

      const data = await response.json();
      console.log('Success response:', data);
      alert(data.message || 'Contest created successfully!');
      navigate('/admin/matches');
    } catch (error) {
      console.error('Submission error:', error);
      if (error.message.includes('token') || error.message.includes('auth')) {
        localStorage.removeItem('adminToken');
        alert('Session expired. Please login again.');
        navigate('/admin/login');
      } else {
        alert(error.message || 'Error creating contest');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-contest-container">
      <div className="contest-card">
        <h2 className="contest-title">
          Create Contest for: <span className="match-title">{form.match_title}</span>
        </h2>
          <p>Match Start Time: {}</p>
 <h2>Match Starts at: {form.formattedStartTime}</h2>
      <h2>Time Remaining: {form.remainingTime}</h2>
        
        <form onSubmit={handleSubmit} className="contest-form">
          <div className="form-grid">
            {/* Prize Pool */}
            <div className="form-group">
              <label>Prize Pool ($) *</label>
              <input 
                type="number" 
                name="prize_pool" 
                value={form.prize_pool}
                onChange={handleChange}
                placeholder="1000" 
                min="0"
                step="0.01"
                className={errors.prize_pool ? 'error' : ''}
              />
              {errors.prize_pool && <span className="error-message">{errors.prize_pool}</span>}
            </div>

            {/* Max Prize Pool */}
            <div className="form-group">
              <label>Max Prize Pool ($)</label>
              <input 
                type="number" 
                name="max_prize_pool" 
                value={form.max_prize_pool}
                onChange={handleChange}
                placeholder="5000" 
                min="0"
                step="0.01"
              />
            </div>

            {/* Buy In */}
            <div className="form-group">
              <label>Buy In ($) *</label>
              <input 
                type="number" 
                name="buy_in" 
                value={form.buy_in}
                onChange={handleChange}
                placeholder="10" 
                min="0"
                step="0.01"
                className={errors.buy_in ? 'error' : ''}
              />
              {errors.buy_in && <span className="error-message">{errors.buy_in}</span>}
            </div>

            {/* Entry Fee */}
            <div className="form-group">
              <label>Entry Fee ($)</label>
              <input 
                type="number" 
                name="entry_fee" 
                value={form.entry_fee}
                onChange={handleChange}
                placeholder="1" 
                min="0"
                step="0.01"
              />
            </div>

            {/* Min Players */}
            <div className="form-group">
              <label>Min Players *</label>
              <input 
                type="number" 
                name="min_players" 
                value={form.min_players}
                onChange={handleChange}
                placeholder="2" 
                min="2"
                className={errors.min_players ? 'error' : ''}
              />
              {errors.min_players && <span className="error-message">{errors.min_players}</span>}
            </div>

            {/* Max Players */}
            <div className="form-group">
              <label>Max Players *</label>
              <input 
                type="number" 
                name="max_players" 
                value={form.max_players}
                onChange={handleChange}
                placeholder="100" 
                min="2"
                className={errors.max_players ? 'error' : ''}
              />
              {errors.max_players && <span className="error-message">{errors.max_players}</span>}
            </div>

            {/* Winner Type */}
            <div className="form-group">
              <label>Winner Type *</label>
              <select 
                name="winner_type" 
                value={form.winner_type}
                onChange={handleChange}
                className={errors.winner_type ? 'error' : ''}
              >
                <option value="">Select Winner Type</option>
                <option value="single">Single Winner</option>
                <option value="multiple">Multiple Winners</option>
              </select>
              {errors.winner_type && <span className="error-message">{errors.winner_type}</span>}
            </div>

            {/* Visible Until */}
            <div className="form-group">
              <label>Visible Until *</label>
              <input 
                type="datetime-local" 
                name="visible_until" 
                value={form.visible_until}
                onChange={handleChange}
                className={errors.visible_until ? 'error' : ''}
              />
              {errors.visible_until && <span className="error-message">{errors.visible_until}</span>}
            </div>

            {/* Registration Opens */}
            <div className="form-group">
              <label>Registration Opens *</label>
              <input 
                type="datetime-local" 
                name="registration_opens" 
                value={form.registration_opens}
                onChange={handleChange}
                className={errors.registration_opens ? 'error' : ''}
              />
              {errors.registration_opens && <span className="error-message">{errors.registration_opens}</span>}
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Contest'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateContest;