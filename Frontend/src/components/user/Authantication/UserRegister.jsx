// import React, { useState } from 'react';
// import axios from 'axios';
// import '../styles/UserAuth.css'; // Create this CSS file
// import { useNavigate } from 'react-router-dom';

// const AdminRegister = () => {
//   const [formData, setFormData] = useState({
//     name: '', email: '', phone_number: '', password: ''
//   });
//   const [message, setMessage] = useState('');
  
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//    const navigate = useNavigate();


//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post('http://localhost:5000/api/user/auth/register', formData);
//       setMessage(res.data.message);
//       navigate('/admin/login')
//     } catch (err) {
//       setMessage(err.response?.data?.message || 'Registration failed');
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-form">
//         <h2>Admin Registration</h2>
//         {message && <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}
//         <form onSubmit={handleRegister}>
//           <div className="form-group">
//             <input 
//               type="text" 
//               name="name" 
//               placeholder="Name" 
//               onChange={handleChange} 
//               required 
//             />
//           </div>
//           <div className="form-group">
//             <input 
//               type="email" 
//               name="email" 
//               placeholder="Email" 
//               onChange={handleChange} 
//               required 
//             />
//           </div>
//           <div className="form-group">
//             <input 
//               type="text" 
//               name="phone_number" 
//               placeholder="Phone Number" 
//               onChange={handleChange} 
//               required 
//             />
//           </div>
//           <div className="form-group">
//             <input 
//               type="password" 
//               name="password" 
//               placeholder="Password" 
//               onChange={handleChange} 
//               required 
//             />
//           </div>
//           <button type="submit" className="auth-button">Register</button>
//         </form>
//         <div className="auth-footer">
//           Already have an account? <a href="/admin/login">Login here</a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminRegister;






import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UserAuth.css';
import { useNavigate } from 'react-router-dom';



const UserRegister = () => {

const navigate = useNavigate();

const [step, setStep] = useState(1);

const [formData, setFormData] = useState({
name: '',
email: '',
phone_number: '',
password: ''
});

const [otp, setOtp] = useState('');
const [message, setMessage] = useState('');
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value
});
};

const sendOtp = async (e) => {

e.preventDefault();

try {

  setLoading(true);

  const res = await axios.post(
    'http://localhost:5000/api/user/auth/send-registration-otp',
    {
      email: formData.email
    }
  );

  setMessage(res.data.message);
  setStep(2);

} catch (err) {

  setMessage(
    err.response?.data?.message ||
    'Failed to send OTP'
  );

} finally {
  setLoading(false);
}


};

const verifyOtpAndRegister = async (e) => {


e.preventDefault();

try {

  setLoading(true);

  await axios.post(
    'http://localhost:5000/api/user/auth/verify-registration-otp',
    {
      email: formData.email,
      otp
    }
  );

  const registerRes = await axios.post(
    'http://localhost:5000/api/user/auth/register',
    formData
  );

  setMessage(registerRes.data.message);

  setTimeout(() => {
    navigate('/user/login');
  }, 1500);

} catch (err) {

  setMessage(
    err.response?.data?.message ||
    'Registration failed'
  );

} finally {
  setLoading(false);
}


};

return ( <div className="auth-container">

  <div className="auth-form">

    <h2>User Registration</h2>

    {message && (
      <div className="message">
        {message}
      </div>
    )}

    {step === 1 && (

      <form onSubmit={sendOtp}>

        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>

      </form>

    )}

    {step === 2 && (

      <form onSubmit={verifyOtpAndRegister}>

        <div className="form-group">

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            required
          />

        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading
            ? 'Verifying...'
            : 'Verify OTP & Register'}
        </button>

      </form>

    )}

    <div className="auth-footer">
      Already have an account?
      <a href="/user/login">
        Login here
      </a>
    </div>

  </div>

</div>


);
};

export default UserRegister;
