import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api';
import { FaCamera, FaBoxOpen, FaUserEdit, FaCalendarAlt, FaMapMarkerAlt, FaGlobe, FaSave, FaUser } from 'react-icons/fa'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { t } = useSettings();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');       
  const [country, setCountry] = useState(''); 
  const [birthdate, setBirthdate] = useState(''); 

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [userType, setUserType] = useState('customer');
  const [message, setMessage] = useState(null);

  const [myOrders, setMyOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      if (userInfo.first_name || userInfo.last_name) {
          setFirstName(userInfo.first_name || '');
          setLastName(userInfo.last_name || '');
      } else if (userInfo.name) {
          const nameParts = userInfo.name.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
      }

      setEmail(userInfo.email);
      setPhone(userInfo.profile?.phone || '');
      setCity(userInfo.profile?.city || '');
      setCountry(userInfo.profile?.country || '');
      setBirthdate(userInfo.profile?.birthdate || '');
      setUserType(userInfo.profile?.type || 'customer');

      if (userInfo.profile?.profilePicture) {
        setPreviewImage(getImageUrl(userInfo.profile.profilePicture));
      }

      const fetchMyOrders = async () => {
        try {
          const { data } = await api.get(ENDPOINTS.MY_ORDERS);
          setMyOrders(data);
        } catch (error) { console.log(error); }
      };

      const fetchSellerOrders = async () => {
        if (userInfo.profile?.type === 'vendor') {
          try {
            const { data } = await api.get('/api/users/seller/orders/');
            setSellerOrders(data);
          } catch (error) { console.log(error); }
        }
      };

      Promise.all([fetchMyOrders(), fetchSellerOrders()]).then(() => setLoading(false));
    }
  }, [navigate]);

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage(t('passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('city', city);
    formData.append('country', country);
    formData.append('birthdate', birthdate);

    if (profileImage) {
      formData.append('profilePicture', profileImage);
    }

    try {
      const { data } = await api.put('/api/users/profile/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setMessage(t('profileUpdated') || 'Profile Updated Successfully ✅');
      setPassword('');
      setConfirmPassword('');
      if(data.profile?.profilePicture) {
         setPreviewImage(getImageUrl(data.profile.profilePicture));
      }
    } catch (error) {
      setMessage(t('profileUpdateError') || 'Error updating profile ❌');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Meta title={t('myProfile') || "My Profile"} />
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: User Card & Form (Sticky on Desktop) */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-xl sticky top-28">
            
            {/* Profile Image */}
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                <img
                    src={previewImage || "/images/placeholder.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/placeholder.png'; }}
                />
              </div>
              <label className="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full cursor-pointer hover:bg-orange-600 transition shadow-lg hover:scale-110">
                <FaCamera size={14} />
                <input type="file" className="hidden" onChange={uploadFileHandler} />
              </label>
            </div>

            <h2 className="text-xl font-black text-center text-gray-900 dark:text-white mb-1">
                {firstName} {lastName}
            </h2>
            <div className="flex justify-center mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${userType === 'vendor' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {t(userType) || userType}
                </span>
            </div>

            {message && (
                <div className={`p-3 rounded-xl mb-6 text-xs font-bold text-center animate-pulse ${message.includes('Success') || message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={submitHandler} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{t('firstName')}</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" placeholder="First Name" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{t('lastName')}</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" placeholder="Last Name" />
                  </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{t('email')}</label>
                <input type="email" value={email} readOnly className="w-full bg-gray-100 dark:bg-gray-700/50 border border-transparent rounded-xl p-2.5 text-sm text-gray-500 cursor-not-allowed" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">{t('phone')}</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" placeholder="Phone Number" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1"><FaCalendarAlt /> {t('birthdate')}</label>
                <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1"><FaMapMarkerAlt/> {t('city')}</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1"><FaGlobe/> {t('country')}</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-xs font-bold text-primary uppercase text-center">{t('changePassword') || "Change Password"}</p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" placeholder={t('newPasswordPlaceholder')} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-sm dark:text-white focus:border-primary outline-none transition" placeholder={t('confirmPasswordPlaceholder')} />
              </div>

              <button type="submit" className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg transition flex justify-center items-center gap-2 uppercase text-sm mt-2">
                <FaSave /> {t('saveChanges') || "SAVE CHANGES"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Orders */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-10">
          
          {/* User Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3 uppercase">
              <span className="p-3 bg-primary/10 text-primary rounded-2xl"><FaBoxOpen /></span>
              {t('myPurchases') || "My Orders"}
            </h2>
            {loading ? <div className="text-center py-10 opacity-50 font-bold">Loading...</div> : myOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-medium">{t('noPurchases') || "No orders yet."}</div>
            ) : (
              <OrdersTable orders={myOrders} isSeller={false} navigate={navigate} t={t} />
            )}
          </div>

          {/* Seller Dashboard Preview (If Vendor) */}
          {userType === 'vendor' && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-black rounded-[2.5rem] p-6 md:p-8 border border-gray-700 shadow-xl text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black flex items-center gap-3 uppercase">
                    <span className="p-3 bg-white/10 rounded-2xl"><FaUserEdit className="text-green-400" /></span>
                    {t('salesDashboard') || "Incoming Orders"}
                </h2>
                <button onClick={() => navigate('/seller/dashboard')} className="px-4 py-2 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-200 transition">
                    Manage Products &rarr;
                </button>
              </div>
              
              {sellerOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">{t('noSalesRequests') || "No incoming sales yet."}</div>
              ) : (
                <OrdersTable orders={sellerOrders} isSeller={true} navigate={navigate} t={t} isDarkBg={true} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OrdersTable = ({ orders, isSeller, navigate, t, isDarkBg = false }) => {
    return (
        <div className="overflow-hidden">
            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {orders.map((order) => {
                    const orderId = isSeller ? (order.order_id) : (order._id || order.id);
                    return (
                        <div key={orderId || Math.random()} className={`p-4 rounded-2xl border ${isDarkBg ? 'bg-white/5 border-white/10' : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-black text-sm ${isDarkBg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>#{orderId?.toString().substring(0, 8)}</span>
                                <span className={`text-xs font-bold ${isDarkBg ? 'text-gray-400' : 'text-gray-500'}`}>{order.createdAt?.substring(0, 10)}</span>
                            </div>
                            <div className="mb-3">
                                {isSeller ? (
                                    <p className={`font-bold ${isDarkBg ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>{order.name} <span className="text-xs opacity-70">({order.qty}x)</span></p>
                                ) : (
                                    <p className="text-primary font-black">${order.totalPrice}</p>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2 text-[10px] font-black uppercase">
                                    <span className={`px-2 py-1 rounded ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                                    <span className={`px-2 py-1 rounded ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.isDelivered ? 'Delivered' : 'Pending'}</span>
                                </div>
                                <button onClick={() => navigate(`/order/${orderId}`)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${isDarkBg ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white dark:bg-white dark:text-black hover:opacity-90'}`}>
                                    {t('view')}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className={`text-xs uppercase tracking-wider ${isDarkBg ? 'text-gray-400 border-b border-white/10' : 'text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10'}`}>
                            <th className="p-4 pl-0">ID</th>
                            <th className="p-4">{t('date')}</th>
                            <th className="p-4">{isSeller ? t('product') : t('total')}</th>
                            <th className="p-4 text-center">{t('paid')}</th>
                            <th className="p-4 text-center">{t('delivered')}</th>
                            <th className="p-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className={`text-sm font-medium ${isDarkBg ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {orders.map((order) => {
                            const orderId = isSeller ? (order.order_id) : (order._id || order.id);
                            return (
                                <tr key={orderId || Math.random()} className="group hover:bg-black/5 dark:hover:bg-white/5 transition border-b border-transparent hover:border-gray-200 dark:hover:border-white/10">
                                    <td className={`p-4 pl-0 font-bold ${isDarkBg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>#{orderId?.toString().substring(0, 8)}..</td>
                                    <td className="p-4">{order.createdAt?.substring(0, 10)}</td>
                                    <td className="p-4">
                                        {isSeller ? (
                                            <div>
                                                <span className={`block font-bold ${isDarkBg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{order.name}</span>
                                                <span className="text-xs opacity-60">{order.qty} x ${order.price}</span>
                                            </div>
                                        ) : (
                                            <span className="text-primary font-bold">${order.totalPrice}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {order.isPaid ? <span className="text-green-500">✔</span> : <span className="text-red-500">✖</span>}
                                    </td>
                                    <td className="p-4 text-center">
                                        {order.isDelivered ? <span className="text-green-500">✔</span> : <span className="text-yellow-500">●</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => navigate(`/order/${orderId}`)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${isDarkBg ? 'bg-white/10 hover:bg-white text-white hover:text-black' : 'bg-gray-100 dark:bg-white/10 hover:bg-primary hover:text-white'}`}>
                                            {t('view')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfileScreen;