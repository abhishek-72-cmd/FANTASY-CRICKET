import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();

    const handleAdmin = () => {
        navigate('/admin/login');
    };

    const handleUser = () => {
        navigate('/user/login');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '20px'
        }}>
            <h1>Welcome to Cricket App</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <button 
                    onClick={handleAdmin}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#4299e1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Login as Admin
                </button>
                <button 
                    onClick={handleUser}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#48bb78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Login as User
                </button>
            </div>
        </div>
    );
};

export default Dashboard;