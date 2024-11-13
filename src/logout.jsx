import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import the AuthContext
import loginImage from './assets/trackagileloginimage.jpeg'; // Adjust the path as necessary
import './logout.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const { login, snackbarMessage, snackbarSeverity } = useAuth(); // Destructure login and snackbarMessage from useAuth
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password); // Call the login function from AuthContext
            localStorage.setItem('username', username); // Save username to local storage
            setError(''); // Clear any previous errors if login is successful
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid username or password'); // Set the error message if login fails
        }
    };

    // Listen for changes to snackbarMessage and update error accordingly
    useEffect(() => {
        if (snackbarSeverity === 'error') {
            setError(snackbarMessage); // Set the error message on invalid credentials
        } else {
            setError(''); // Clear error if login is successful or snackbar message is empty
        }
    }, [snackbarMessage, snackbarSeverity]);

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="body1">
            <div className="login-container">
                <div className="login-image">
                    <img src={loginImage} alt="Login" />
                </div>
                <div className="login-form">
                    <h2 className="login-title">LOGIN</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <div className="input-icon">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Enter Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <i className="fas fa-user"></i>
                            </div>
                        </div>
                        <div className="input-group">
                            <div className="input-icon">
                                <input
                                    type={showPassword ? 'text' : 'password'} // Toggle input type
                                    id="password"
                                    name="password"
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <i
                                    className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} // Toggle icon
                                    onClick={togglePasswordVisibility}
                                    style={{ cursor: 'pointer', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} // Style to position the icon
                                ></i>
                            </div>
                        </div>
                        {error && <p className="error-message">{error}</p>} {/* Display error message */}
                        <button type="submit" className="login-button">
                            Login <i className="fas fa-location-arrow"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
