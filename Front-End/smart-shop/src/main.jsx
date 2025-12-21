import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SettingsProvider } from './context/SettingsContext.jsx'; // 👈 استيراد
// 👇👇 تصحيح المسارات (شيلنا ../src)
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SettingsProvider>
          <CartProvider>
            <WishlistProvider> {/* 👈 لازم يكون موجود هنا */}
              <App />
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);