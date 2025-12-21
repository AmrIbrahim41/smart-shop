import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Home from './pages/home/Home';
import ProductDetails from './pages/productdetails/ProductDetails';
import WishlistScreen from './pages/Wishlist/WishlistScreen';
// Shipping & Order Pages
import ShippingScreen from './pages/shipping/ShippingScreen';
import CartScreen from './pages/cart/CartScreen';
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
// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard'; 
import ProductEditScreen from './pages/seller/ProductEditScreen'; 

// admin Pages
import OrderListScreen from './pages/admin/OrderListScreen';
import UserListScreen from './pages/admin/UserListScreen';
import ProductListScreen from './pages/admin/ProductListScreen';
import Meta from './components/tapheader/Meta';

function App() {
  return (
      <div className="flex flex-col min-h-screen bg-dark font-sans">
        
        
        <Navbar />
        
        <Routes>
          {/* Home Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<WishlistScreen />} />

          {/* Shipping & Order Pages */}
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/shipping" element={<ShippingScreen />} />
          <Route path="/placeorder" element={<PlaceOrderScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/order/:id" element={<OrderScreen />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordScreen />} />
          <Route path="/activate/:uid/:token" element={<ActivationScreen />} />

          {/* Admin Pages */}
          <Route path="/admin/orderlist" element={<OrderListScreen />} />
          
          <Route path="/admin/users" element={<UserListScreen />} />
          <Route path="/admin/productlist" element={<ProductListScreen />} />
          <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />

          {/* Seller Pages */}
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/product/:id/edit" element={<ProductEditScreen />} />
          
        </Routes>

        <Footer />
      </div>
  );
}

export default App;