import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import '../../styling/CreateContest.css';

const CreateContest = () => {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef(null);

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
    registration_opens: '',
    start_time: '',
    formattedStartTime: '',
    remainingTime: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live countdown ticker
  useEffect(() => {
    if (!form.start_time) return;

    const tick = () => {
      const startDate = new Date(form.start_time);
      const now = new Date();
      let diff = Math.max(0, startDate - now);

      const hours   = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const remainingTime = diff === 0
        ? 'Match started'
        : `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

      setForm(prev => ({ ...prev, remainingTime }));
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [form.start_time]);

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

      const now = new Date();
      let diff = Math.max(0, startDate - now);
      const hours   = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const remainingTime = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

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
    setForm(prev => ({ ...prev, [name]: value }));
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

        {/* ── Header ── */}
        <div className="card-header">
          <h2 className="contest-title">
            New Contest
            {form.match_title && (
              <> — <span className="match-title">{form.match_title}</span></>
            )}
          </h2>

          <div className="match-info-strip">
            <div className="match-info-chip">
              <span className="chip-label">Kickoff</span>
              <span className="chip-value">{form.formattedStartTime || '—'}</span>
            </div>

            <div className="match-info-chip countdown">
              <span className="chip-label">Time left</span>
              <span className="chip-value">{form.remainingTime || '—'}</span>
            </div>

            {form.home_team && form.away_team && (
              <div className="match-info-chip">
                <span className="chip-label">Fixture</span>
                <span className="chip-value">{form.home_team} vs {form.away_team}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="contest-form">

          {/* Prize Pool Section */}
          <div className="form-section">
            <div className="form-section-title">Prize Pool</div>
            <div className="form-grid">

              <div className="form-group">
                <label>
                  Prize Pool ($) <span className="label-required">*</span>
                </label>
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
                {errors.prize_pool && (
                  <span className="error-message">{errors.prize_pool}</span>
                )}
              </div>

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

              <div className="form-group">
                <label>
                  Buy In ($) <span className="label-required">*</span>
                </label>
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
                {errors.buy_in && (
                  <span className="error-message">{errors.buy_in}</span>
                )}
              </div>

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

            </div>
          </div>

          {/* Players & Format Section */}
          <div className="form-section">
            <div className="form-section-title">Players & Format</div>
            <div className="form-grid">

              <div className="form-group">
                <label>
                  Min Players <span className="label-required">*</span>
                </label>
                <input
                  type="number"
                  name="min_players"
                  value={form.min_players}
                  onChange={handleChange}
                  placeholder="2"
                  min="2"
                  className={errors.min_players ? 'error' : ''}
                />
                {errors.min_players && (
                  <span className="error-message">{errors.min_players}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Max Players <span className="label-required">*</span>
                </label>
                <input
                  type="number"
                  name="max_players"
                  value={form.max_players}
                  onChange={handleChange}
                  placeholder="100"
                  min="2"
                  className={errors.max_players ? 'error' : ''}
                />
                {errors.max_players && (
                  <span className="error-message">{errors.max_players}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Winner Type <span className="label-required">*</span>
                </label>
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
                {errors.winner_type && (
                  <span className="error-message">{errors.winner_type}</span>
                )}
              </div>

            </div>
          </div>

          {/* Scheduling Section */}
          <div className="form-section">
            <div className="form-section-title">Scheduling</div>
            <div className="form-grid">

              <div className="form-group">
                <label>
                  Visible Until <span className="label-required">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="visible_until"
                  value={form.visible_until}
                  onChange={handleChange}
                  className={errors.visible_until ? 'error' : ''}
                />
                {errors.visible_until && (
                  <span className="error-message">{errors.visible_until}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Registration Opens <span className="label-required">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="registration_opens"
                  value={form.registration_opens}
                  onChange={handleChange}
                  className={errors.registration_opens ? 'error' : ''}
                />
                {errors.registration_opens && (
                  <span className="error-message">{errors.registration_opens}</span>
                )}
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Contest...' : 'Launch Contest'}
          </button>
        </form>

        {/* ── Footer Ticker ── */}
        <div className="ticker">
          <span className="ticker-dot" />
          Admin Panel — Create Contest — Match ID: {form.match_id || '—'}
        </div>

      </div>
    </div>
  );
};

export default CreateContest;