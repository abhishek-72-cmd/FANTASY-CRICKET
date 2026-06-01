import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import MatchesPage from './components/admin/pages/Fixtures/AdminMatches';
import AdminLogin from './components/admin/Authantication/AdminLogin';
import AdminRegister from './components/admin/Authantication/AdminRegister';
import './App.css';
import AdminRoutes from './components/admin/routes/AdminRoutes';
import Dashboard from './components/common/Dashboard.jsx';
import UserLogin from './components/user/Authantication/UserLogIn'
import UserRegister from './components/user/Authantication/UserRegister'
import ForgotPassword from './components/user/Authantication/ForgotPassword';
import UserMatches from './components/user/pages/Fixtures/UserMatches'
import PaymentGateway from './components/user/pages/Payment/PayementGateway';
import UserContest from './components/user/pages/Contests/ViewContest'
import Fixtures from './components/user/pages/Fixtures/Fixtures';
import ViewContests from './components/admin/pages/contests/ViewContest';
import UserRoutes from './components/user/routes/UserRoutes';

// Define your GOOGLE_CLIENT_ID here (e.g., from .env)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

console.log("Google Client ID:", GOOGLE_CLIENT_ID);

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path='/user/*' element={<UserRoutes />} />
            <Route path="/admin/matches" element={<MatchesPage />} />

            {/* {Common} */}
            <Route path='/' element={<Dashboard />} />
            {/* {user} */}

            <Route path='/user/login' element={<UserLogin />} />
            <Route path='/user/register' element={<UserRegister />} />
            <Route
              path="/user/forgot-password"
              element={<ForgotPassword />}
            />
            {/* <Route path = '/user/matches' element = {<UserMatches/>}/> */}
            <Route path='/payment/gateway' element={<PaymentGateway />} />
            {/* <Route path = '/fixtures' element = {<Fixtures/>}/> */}
            <Route path='/admin/viewContest/:fixtureId' element={<ViewContests />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;