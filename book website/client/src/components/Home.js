import React, { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import Logout from './Logout';
import Books from './Books';
import { useNavigate } from 'react-router-dom'; 

function Home() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUsername(decodedToken.username);
            } catch (error) {
                console.error("Failed to decode token:", error);
            }
        }
    }, []);

    // Handle click to navigate to profile page
    const goToProfile = () => {
        navigate(`/profile/${username}`);  // Navigate with username as part of the URL
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center">
            <h1 className="mr-3">Welcome, {username || "User"}!</h1>
            <div className="d-flex align-items-center mb-3">
                <Logout />
                <button onClick={goToProfile} className="btn btn-info ml-2">Go to Profile</button>
            </div>
            <Books />
        </div>
    );
}
export default Home;
