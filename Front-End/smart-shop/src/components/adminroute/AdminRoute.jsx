import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // لو أدمن عدي، لو لا ارجع لصفحة اللوجين
    if (userInfo && userInfo.isAdmin) {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
};

export default AdminRoute;