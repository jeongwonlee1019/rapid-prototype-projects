import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
            // Login successful
            sessionStorage.setItem('token', data.token); // Store JWT token
            navigate('/home'); // Redirect to home page
        } else {
            // Login failed
            setMessage(data.message); // Display error message
        }
    };    
       

    return (
        <div className="d-flex justify-content-center align-items-center">
            <div className="text-center">
                <h1 className="mb-2">Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-control mb-1"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-control mb-2"
                    />
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <p>Don't have an account? <a href="/signup">Signup</a></p>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default Login;
