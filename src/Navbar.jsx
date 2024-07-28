import React, { useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';
import { useUser } from './UserContext';
import './Navbar.css';
import axios from 'axios';

function Navbar() {
    const [user, setUser] = useState(null);
    const { setUserEmail } = useUser();

    // Function to fetch user info from the server
    const fetchUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:3000/user-info', {
                method: 'GET',
                credentials: 'include', // Include credentials to send cookies with the request
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }

            const data = await response.json();
            const { email } = data;
            setUser({ email });
            setUserEmail(email);

            // Initialize WhatsApp client after fetching user info
            const token = 'your_access_token_here'; // Replace with actual token retrieval logic
            initializeWhatsAppClient(email, token);

        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const initializeWhatsAppClient = (email, token) => {
        axios.post('http://localhost:3000/initialize', { email, token })
            .then(response => {
                console.log(response.data);
                if (response.data.success) {
                    // Open the created Google Sheet in a new tab
                    window.open(response.data.url, '_blank');
                } else {
                    console.error('Failed to initialize WhatsApp client');
                }
            })
            .catch(error => console.error('Error initializing client:', error));
    };

    // Function to handle client disconnection
    const handleClientDisconnection = async () => {
        try {
            const encodedEmail = encodeURIComponent(user.email);
            await fetch(`http://localhost:3000/disconnect/${encodedEmail}`, {
                method: 'POST',
                credentials: 'include', // Include credentials to send cookies with the request
            });
        } catch (error) {
            console.error('Error disconnecting client:', error);
        }
    };

    // Function to handle login
    const handleLogin = () => {
        window.location.href = 'http://localhost:3000/auth';
    };

    // Function to handle logout
    const handleLogout = () => {
        handleClientDisconnection(); // Notify backend to disconnect client
        googleLogout();
        setUser(null);
        setUserEmail(null);
        console.log('Logout successful!');
    };

    // Fetch user info on component mount if already logged in
    useEffect(() => {
        fetchUserInfo();
    }, []);

    return (
        <nav className="navbar">
            <h1>WhatsApp-Archiver</h1>
            <div>
                {user ? (
                    <>
                        <span>Welcome, {user.email}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button onClick={handleLogin} className="google-login-button">
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
