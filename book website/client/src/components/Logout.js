import React from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove the token
        sessionStorage.removeItem('token');

        // Redirect to the login page
        navigate('/login');
    };

    return (
        <button onClick={handleLogout} className="btn btn-secondary">
            Logout
        </button>
    );
}

export default Logout;