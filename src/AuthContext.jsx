import React, { createContext, useContext, useState, useEffect} from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; 
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [role, setRole] = useState('');
    const [userName, setUsername] = useState('');
    const navigate = useNavigate();

    const baseURL = process.env.REACT_APP_API_KEY || 'http://68.183.86.1:8080/trackagile';

    const login = async (username, password) => {
        try {
            setSnackbarOpen(false);
            setSnackbarMessage('');
    
            // Make the login API call
            const response = await axios.post(`${baseURL}/login/authenticate`, {
                userName: username,
                password: password,
            });
    
            if (response.status === 200) {
                const { token, expiryTimeInMillis } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('expiryTime', expiryTimeInMillis);
    
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.roles[0];
                const userSubject = decodedToken.sub;
    
                setUsername(userSubject); // Set the username in state
                setRole(userRole);        // Set the role in state
    
                // Store role in local storage immediately to prevent delay
                localStorage.setItem('role', userRole);
    
                // Check if token is expired
                if (isTokenExpired()) {
                    setSnackbarMessage('Session expired. Please login again.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                    logout();
                } else {
                    setSnackbarMessage('Login successful!');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
    
                    // Use a short delay to ensure that role and username are fully set
                    setTimeout(() => {
                        if (decodedToken.isFirstLogin) {
                            navigate('/change-password');
                        } else {
                            if (userRole === 'ROLE_ADMIN') {
                                navigate('/dashboard');
                            } else {
                                navigate('/manager/dashboard');
                            }
                        }
                    }, 500); // Adjust delay as necessary
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setSnackbarMessage('Invalid credentials');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };    
    
    // Check if token is expired
    const isTokenExpired = () => {
        const expiryTime = localStorage.getItem('expiryTime');
        if (expiryTime) {
            return Date.now() > parseInt(expiryTime);
        }
        return true; // Consider expired if no expiry time is stored
    };
    
    // Use useEffect to check token expiration on component mount
    useEffect(() => {
        if (isTokenExpired()) {
            logout(); // Log out the user if the token is expired
        }
    }, []);

    const changePassword = async (passwordData) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${baseURL}/login/update-password`, {
                userName, // Use the username from login
                password: passwordData.newPassword, // Send only one password field
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.status === 200) {
                setSnackbarMessage('Password changed successfully!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                navigate('/dashboard');
            }
        } catch (error) {
            setSnackbarMessage('Password change failed!');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };    

    const logout = () => {
        localStorage.removeItem('token');
        setSnackbarMessage('Logout successful!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const value = {
        login,
        logout,
        changePassword,  // added changePassword function
        userName,
        role,
        snackbarOpen,
        snackbarMessage,
        snackbarSeverity,
        handleCloseSnackbar,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
