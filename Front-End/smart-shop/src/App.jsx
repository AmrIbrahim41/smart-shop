import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts & Components
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Meta from './components/tapheader/Meta';
import NotFound from './pages/notfound/NotFound'; // 👈 استيراد الصفحة الجديدة

// Public Pages
import Home from './pages/home/Home';
import ProductDetails from './pages/productdetails/ProductDetails';
import WishlistScreen from './pages/Wishlist/WishlistScreen';

// Shipping & Order Pages
import CartScreen from './pages/cart/CartScreen';
import ShippingScreen from './pages/shipping/ShippingScreen';
import PlaceOrderScreen from './pages/shipping/PlaceOrderScreen';
import PaymentScreen from './pages/shipping/PaymentScreen';
import OrderScreen from './pages/shipping/OrderScreen';

// Auth Pages
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/registerPage/RegisterPage';
import ProfileScreen from './pages/profile/ProfileScreen';
import ForgotPasswordScreen from './pages/login/ForgotPasswordScreen';
import ResetPasswordScreen from './pages/login/ResetPasswordScreen';
import ActivationScreen from './pages/registerPage/ActivationScreen';

// Seller Pages & Layout
import SellerLayout from '../src/components/sellerlayout/SellerLayout'; // 👈 استيراد الليآوت
import SellerDashboard from './pages/seller/SellerDashboard';
import ProductEditScreen from './pages/seller/ProductEditScreen';
import MyProducts from './pages/seller/MyProducts'; // 👈 استيراد صفحة منتجاتي

// Admin Pages
import OrderListScreen from './pages/admin/OrderListScreen';
import UserListScreen from './pages/admin/UserListScreen';
import ProductListScreen from './pages/admin/ProductListScreen';

function App() {
  return (
    // 👇 تعديل الخلفية لتكون متجاوبة مع الوضعين (فاتح/غامق) بدلاً من bg-dark الثابتة
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-dark font-sans transition-colors duration-300">

      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<WishlistScreen />} />

        {/* Cart & Checkout */}
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/shipping" element={<ShippingScreen />} />
        <Route path="/placeorder" element={<PlaceOrderScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
        <Route path="/order/:id" element={<OrderScreen />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordScreen />} />
        <Route path="/activate/:uid/:token" element={<ActivationScreen />} />

        {/* Admin Routes */}
        <Route path="/admin/orderlist" element={<OrderListScreen />} />
        <Route path="/admin/users" element={<UserListScreen />} />
        <Route path="/admin/productlist" element={<ProductListScreen />} />
        <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />

        {/* 👇 Seller Routes (Vendor Panel) 👇 */}
        {/* تم تجميعها داخل SellerLayout لتظهر القائمة الجانبية */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<MyProducts />} />
          <Route path="product/:id/edit" element={<ProductEditScreen />} />
          <Route path="products/add" element={<ProductEditScreen />} />
          {/* لو عندك صفحة طلبات خاصة بالتاجر، ضيفها هنا */}
          <Route path="orders" element={<OrderListScreen />} />
        </Route>

        {/* Backward Compatibility: إعادة توجيه لو حد دخل على الرابط القديم */}
        <Route path="/dashboard" element={<SellerDashboard />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;