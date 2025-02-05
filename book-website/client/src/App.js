import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import JoinGroup from './components/JoinGroup';
import ShareProfile from './components/ShareProfile';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/:username"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/joingroup/:isbn/:username"
                    element={
                        <ProtectedRoute>
                            <JoinGroup />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile-sharing/:isbn/:username/:shareduser"
                    element={
                        <ProtectedRoute>
                            <ShareProfile />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;