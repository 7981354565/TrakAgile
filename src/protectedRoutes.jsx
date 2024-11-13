import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element: Component, allowedRoles, ...rest }) => {
    const { role } = useAuth();
    console.log(role); // Get role from context
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/login" />;
    }

    return <Component {...rest} />;
};

export default ProtectedRoute;
