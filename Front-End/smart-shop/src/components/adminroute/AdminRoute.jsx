import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    // 1. بنجيب بيانات المستخدم من التخزين المحلي
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // 2. بنتحقق: هل المستخدم مسجل دخول؟ وهل هو أدمن (is_staff)؟
    // لاحظ: في الباك إند بتاعك الاسم isAdmin في الـ Serializer بيرجع is_staff
    if (userInfo && userInfo.isAdmin) {
        return children; // ✅ اتفضل ادخل
    } else {
        return <Navigate to="/login" />; // ❌ ارجع على صفحة الدخول
    }
};

export default AdminRoute;