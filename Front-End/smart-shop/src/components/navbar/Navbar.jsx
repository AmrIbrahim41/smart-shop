import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    FaHeart, FaShoppingBasket, FaSignOutAlt, FaUserCog, FaUser, 
    FaSun, FaMoon, FaGlobe, FaBars, FaTimes, 
    FaClipboardList, FaBox, FaUsers 
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import SearchBox from '../searchbox/SearchBox';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();
  const { theme, toggleTheme, language, toggleLanguage, t } = useSettings();
  const { cartItems, clearCart } = useCart();

  const [isAuth, setIsAuth] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (token && user) {
        setIsAuth(true);
        setUserInfo(user);
      } else {
        setIsAuth(false);
        setUserInfo(null);
      }
    } catch (e) {
      setIsAuth(false);
      setUserInfo(null);
    }
    setMenuOpen(false);
  }, [location]);

  // منع السكرول عند فتح القائمة
  useEffect(() => {
    if (menuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
  }, [menuOpen]);

  const logoutHandler = () => {
    clearCart();
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIsAuth(false);
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path ? "text-primary font-bold" : "hover:text-primary transition";

  return (
    <header className="fixed top-0 w-full z-50 border-b border-gray-200 dark:border-white/10 shadow-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-md transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">

        {/* 1. اللوجو */}
        <Link to="/" className="text-2xl font-extrabold tracking-tighter text-primary z-50 relative">
          SMART<span className="text-gray-900 dark:text-white transition-colors">SHOP</span>
        </Link>

        {/* 2. زر القائمة للموبايل */}
        <button 
            className="lg:hidden p-2 text-2xl text-gray-800 dark:text-white z-50 relative focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
        >
            {menuOpen ? <FaTimes className="text-red-500" /> : <FaBars />}
        </button>

        {/* 3. عناصر سطح المكتب (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-1 items-center justify-between gap-8 ml-8">
            <div className="flex-1 max-w-lg">
                <SearchBox />
            </div>

            <div className="flex items-center gap-6">
                <ul className="flex space-x-6 font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    <li><Link to="/" className={isActive('/')}>{t('home')}</Link></li>
                </ul>

                <div className="flex items-center gap-3 border-l border-r border-gray-300 dark:border-white/20 px-4">
                    <button onClick={toggleLanguage} className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition">
                        <FaGlobe size={14} /> {language === 'en' ? 'AR' : 'EN'}
                    </button>
                    <button onClick={toggleTheme} className="text-gray-600 dark:text-yellow-400 hover:text-primary transition">
                        {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
                    </button>
                </div>

                <div className="flex items-center space-x-4">
                    {isAuth && (
                        <>
                            <Link to="/wishlist" className="relative p-1 group text-gray-600 dark:text-white" title={t('wishlist')}>
                                <FaHeart className="text-xl group-hover:text-primary transition" />
                                {wishlistItems.length > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full">{wishlistItems.length}</span>}
                            </Link>

                            <Link to="/cart" className="relative p-1 group text-gray-600 dark:text-white" title={t('cart')}>
                                <FaShoppingBasket className="text-xl group-hover:text-primary transition" />
                                {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-gray-900 dark:bg-white text-white dark:text-dark text-[10px] font-bold px-1.5 rounded-full">{cartItems.reduce((acc, item) => acc + item.qty, 0)}</span>}
                            </Link>
                        </>
                    )}

                    {isAuth ? (
                        <div className="flex items-center gap-3 pl-2 border-l border-gray-300 dark:border-white/20 ml-2">
                            <Link to="/profile" className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center border border-gray-300 dark:border-white/10 hover:border-primary transition">
                                <FaUser size={12} className="text-gray-700 dark:text-white" />
                            </Link>
                            
                            {userInfo?.isAdmin && (
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-2 py-1.5 rounded-full">
                                    <Link to="/admin/orderlist" className="text-gray-500 dark:text-gray-400 hover:text-primary transition p-1"><FaClipboardList size={14} /></Link>
                                    <Link to="/admin/productlist" className="text-gray-500 dark:text-gray-400 hover:text-primary transition p-1"><FaBox size={14} /></Link>
                                    <Link to="/admin/users" className="text-gray-500 dark:text-gray-400 hover:text-primary transition p-1"><FaUsers size={14} /></Link>
                                </div>
                            )}

                            {userInfo?.profile?.type === 'vendor' && !userInfo?.isAdmin && (
                                <Link to="/dashboard" className="text-primary hover:text-gray-900 dark:hover:text-white transition">
                                    <FaUserCog size={18} />
                                </Link>
                            )}

                            <button onClick={logoutHandler} className="text-gray-400 hover:text-red-500 transition ml-1">
                                <FaSignOutAlt className="text-lg" />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white px-5 py-2 rounded-full text-xs font-bold transition border border-gray-200 dark:border-white/5 ml-2">
                            {t('login')}
                        </Link>
                    )}
                </div>
            </div>
        </div>

        {/* ======================================================= */}
        {/* 👇👇 قائمة الموبايل (تم الإصلاح: خلفية مصمتة + طبقة عليا) 👇👇 */}
        {/* ======================================================= */}
        
        <div 
            className={`lg:hidden fixed top-0 left-0 w-full h-screen bg-white dark:bg-gray-900 z-[100] flex flex-col pt-24 px-6 transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            
            {/* مربع البحث */}
            <div className="mb-8 w-full">
                <SearchBox />
            </div>

            {/* الروابط الأساسية */}
            <div className="flex flex-col gap-4 text-center w-full">
                <Link to="/" onClick={() => setMenuOpen(false)} className="text-2xl font-bold text-gray-800 dark:text-white py-3 border-b border-gray-100 dark:border-white/10 block w-full hover:text-primary transition">
                    {t('home')}
                </Link>
                
                {isAuth && (
                    <>
                        <Link to="/cart" onClick={() => setMenuOpen(false)} className="text-xl font-bold text-gray-800 dark:text-white py-3 border-b border-gray-100 dark:border-white/10 flex justify-between items-center w-full hover:text-primary transition">
                            <span>{t('cart')}</span>
                            <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">{cartItems.length}</span>
                        </Link>
                        <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="text-xl font-bold text-gray-800 dark:text-white py-3 border-b border-gray-100 dark:border-white/10 flex justify-between items-center w-full hover:text-primary transition">
                            <span>{t('wishlist')}</span>
                            <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">{wishlistItems.length}</span>
                        </Link>
                    </>
                )}
            </div>

            {/* قسم المستخدم */}
            <div className="mt-auto mb-8 w-full">
                {isAuth ? (
                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl w-full border border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                                {userInfo.name[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('welcome')}</p>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{userInfo.name}</p>
                            </div>
                        </div>

                        <Link to="/profile" onClick={() => setMenuOpen(false)} className="block bg-white dark:bg-black/20 text-center py-3 rounded-xl font-bold text-gray-800 dark:text-white mb-3 shadow-sm border border-gray-200 dark:border-transparent hover:bg-gray-100 dark:hover:bg-white/10 transition">
                            {t('profile')}
                        </Link>

                        {userInfo?.isAdmin && (
                            <div className="flex gap-2 mb-3">
                                <Link to="/admin/orderlist" onClick={() => setMenuOpen(false)} className="flex-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 py-3 rounded-xl flex justify-center hover:bg-blue-500/20 transition"><FaClipboardList size={20}/></Link>
                                <Link to="/admin/productlist" onClick={() => setMenuOpen(false)} className="flex-1 bg-green-500/10 text-green-600 dark:text-green-400 py-3 rounded-xl flex justify-center hover:bg-green-500/20 transition"><FaBox size={20}/></Link>
                                <Link to="/admin/users" onClick={() => setMenuOpen(false)} className="flex-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 py-3 rounded-xl flex justify-center hover:bg-purple-500/20 transition"><FaUsers size={20}/></Link>
                            </div>
                        )}

                        <button onClick={logoutHandler} className="w-full bg-red-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 hover:bg-red-600 transition">
                            <FaSignOutAlt /> {t('logout')}
                        </button>
                    </div>
                ) : (
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full bg-primary text-white text-center font-bold py-4 rounded-2xl text-xl shadow-lg hover:bg-orange-600 transition">
                        {t('login')}
                    </Link>
                )}

                {/* اللغة والثيم */}
                <div className="flex justify-between items-center mt-6 px-4">
                    <button onClick={toggleLanguage} className="flex items-center gap-2 font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition">
                        <FaGlobe size={20} /> {language === 'en' ? 'العربية' : 'English'}
                    </button>
                    <button onClick={toggleTheme} className="flex items-center gap-2 font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition">
                        {theme === 'dark' ? <><FaSun className="text-yellow-500" size={20}/> Light</> : <><FaMoon className="text-gray-500" size={20}/> Dark</>}
                    </button>
                </div>
            </div>
        </div>

      </nav>
    </header>
  );
};

export default Navbar;