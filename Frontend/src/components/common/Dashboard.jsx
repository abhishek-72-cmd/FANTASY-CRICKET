import { useNavigate } from "react-router-dom";
import "../styling/Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleAdmin = () => {
        navigate('/admin/login');
    };

    const handleUser = () => {
        navigate('/user/login');
    };

    return (
        <div className="dashboard-container">
            <span className="seam-glow top-left" />
            <span className="seam-glow bottom-right" />

            <div className="brand-block">
                <div className="brand-eyebrow">
                    <span className="live-dot" />
                    Fantasy Cricket
                </div>
                <h1 className="dashboard-title">
                    Pitch <span className="accent">11</span>
                </h1>
                <p className="dashboard-subtitle">Pick your XI. Play the match. Win big.</p>
            </div>

            <div className="role-notice">
                <span className="notice-icon">!</span>
                <p>
                    Playing a contest? Please continue with <strong>Login as User</strong>.
                    The admin login is reserved for team staff only.
                </p>
            </div>

            <div className="role-button-row">
                <button className="role-card user-card" onClick={handleUser}>
                    <span className="role-card-icon">U</span>
                    <span className="role-card-label">User</span>
                    <span className="role-card-desc">Join contests, build your team, track your score</span>
                    <span className="role-card-cta">
                        Login as user <span className="arrow">&rarr;</span>
                    </span>
                </button>

                <button className="role-card admin-card" onClick={handleAdmin}>
                    <span className="role-card-icon">A</span>
                    <span className="role-card-label">Admin</span>
                    <span className="role-card-desc">Manage matches, contests, and players</span>
                    <span className="role-card-cta">
                        Login as admin <span className="arrow">&rarr;</span>
                    </span>
                </button>
            </div>

            <div className="dashboard-ticker">
                <span>11 players</span>
                <span className="sep">/</span>
                <span>1 team</span>
                <span className="sep">/</span>
                <span>unlimited glory</span>
            </div>
        </div>
    );
};

export default Dashboard;