import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS, getImageUrl } from '../../api';
import { FaCamera, FaBoxOpen, FaUserEdit, FaCalendarAlt, FaMapMarkerAlt, FaGlobe, FaUser } from 'react-icons/fa'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { t } = useSettings();

  // 👇 1. قسمنا الاسم لمتغيرين بدل متغير واحد
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
      // 👇 2. منطق ذكي لفصل الاسم لو كان متخزن قديم (كله في الاسم الأول)
      // لو الباك إند بيبعت first_name و last_name مفصولين ناخدهم، لو لا نفصل الـ name يدوياً
      if (userInfo.first_name || userInfo.last_name) {
          setFirstName(userInfo.first_name || '');
          setLastName(userInfo.last_name || '');
      } else if (userInfo.name) {
          // Fallback: لو الاسم جاي كتلة واحدة نفصله بالمسافة
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
    // 👇 3. بنبعت الاسم الأول والأخير منفصلين
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
    <div className="min-h-screen pt-28 pb-10 px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={t('myProfile') || "My Profile"} />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* عمود البيانات */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl border border-gray-200 dark:border-white/10 text-center shadow-lg dark:shadow-none transition-colors duration-300">

            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <img
                src={previewImage || "/images/placeholder.png"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-dark shadow-lg transition-colors"
                onError={(e) => { e.target.src = '/images/placeholder.png'; }}
              />
              <label className="absolute bottom-0 right-0 bg-primary p-2 rounded-full cursor-pointer hover:bg-orange-600 transition shadow-lg">
                <FaCamera className="text-white" />
                <input type="file" className="hidden" onChange={uploadFileHandler} />
              </label>
            </div>

            {/* عرض الاسم الكامل (دمجناهم هنا للعرض فقط) */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">
                {firstName} {lastName}
            </h2>
            <span className="bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded uppercase tracking-wider transition-colors">
                {t(userType) || userType}
            </span>

            <hr className="border-gray-200 dark:border-white/10 my-6 transition-colors" />

            {message && (
                <div className={`p-3 rounded mb-4 text-sm font-bold ${message.includes('Success') || message.includes('✅') ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-transparent' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-transparent'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={submitHandler} className="space-y-4 text-left">
              
              {/* 👇 4. حقلين الاسم الجديدين */}
              <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">{t('firstName') || "First Name"}</label>
                    <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-colors" 
                        placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">{t('lastName') || "Last Name"}</label>
                    <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-colors" 
                        placeholder="Doe"
                    />
                  </div>
              </div>

              <div>
                <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">{t('email') || "Email"}</label>
                <input type="email" value={email} readOnly className="w-full bg-gray-100 dark:bg-dark/50 border border-gray-200 dark:border-white/5 rounded p-2 text-gray-500 text-sm cursor-not-allowed transition-colors" />
              </div>

              <div>
                <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">{t('phone') || "Phone Number"}</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-colors" placeholder="01xxxxxxxxx" />
              </div>

              <div>
                <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 flex items-center gap-1 font-bold"><FaCalendarAlt size={10}/> {t('birthdate') || "Birthdate"}</label>
                <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none custom-date-input transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 flex items-center gap-1 font-bold"><FaMapMarkerAlt size={10}/> {t('city') || "City"}</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-colors" placeholder="Cairo" />
                </div>
                <div>
                    <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 flex items-center gap-1 font-bold"><FaGlobe size={10}/> {t('country') || "Country"}</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-colors" placeholder="Egypt" />
                </div>
              </div>

              <hr className="border-gray-200 dark:border-white/10 my-2 transition-colors" />

              <div>
                <label className="text-gray-500 dark:text-gray-400 text-xs ml-1 font-bold">{t('changePassword') || "Change Password"}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-colors" placeholder={t('newPasswordPlaceholder') || "New Password"} />
              </div>
              <div>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-dark border border-gray-300 dark:border-white/10 rounded p-2 text-gray-900 dark:text-white text-sm focus:border-primary outline-none transition-colors" placeholder={t('confirmPasswordPlaceholder') || "Confirm Password"} />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2 rounded-xl transition shadow-lg shadow-orange-500/20 uppercase">
                {t('saveChanges') || "SAVE CHANGES"}
              </button>
            </form>
          </div>
        </div>

        {/* عمود الطلبات (بدون تغيير) */}
        <div className="lg:col-span-3 space-y-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2 transition-colors">
              <FaBoxOpen className="text-primary" /> {t('myPurchases') || "My Purchases"}
            </h2>
            {loading ? <div className="text-gray-600 dark:text-white animate-pulse">{t('loading') || "Loading..."}</div> : myOrders.length === 0 ? (
              <div className="bg-white dark:bg-dark-accent p-6 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 transition-colors shadow-sm">{t('noPurchases') || "No purchases yet."}</div>
            ) : (
              <OrdersTable orders={myOrders} isSeller={false} navigate={navigate} t={t} />
            )}
          </div>

          {userType === 'vendor' && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2 border-t border-gray-200 dark:border-white/10 pt-8 transition-colors">
                <FaUserEdit className="text-green-500" /> {t('salesDashboard') || "Sales Dashboard (Requests)"}
              </h2>
              {sellerOrders.length === 0 ? (
                <div className="bg-white dark:bg-dark-accent p-6 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 transition-colors shadow-sm">{t('noSalesRequests') || "No sales requests yet."}</div>
              ) : (
                <OrdersTable orders={sellerOrders} isSeller={true} navigate={navigate} t={t} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// OrdersTable component remains the same...
const OrdersTable = ({ orders, isSeller, navigate, t }) => {
    return (
        <div className="overflow-x-auto bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none transition-colors duration-300">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs transition-colors">
                <th className="p-4">ID</th>
                <th className="p-4">{t('date') || "Date"}</th>
                <th className="p-4">{isSeller ? (t('product') || 'Product') : (t('total') || 'Total')}</th>
                <th className="p-4 text-center">{t('paid') || "Paid"}</th>
                <th className="p-4 text-center">{t('delivered') || "Delivered"}</th>
                <th className="p-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                {orders.map((order) => {
                    const orderId = isSeller ? (order.order_id) : (order._id || order.id);

                    return (
                        <tr key={orderId || Math.random()} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                            <td className="p-4 text-gray-900 dark:text-white font-bold">
                                {orderId ? `#${orderId.toString().substring(0, 8)}..` : <span className="text-red-500">No ID</span>}
                            </td>
                            
                            <td className="p-4">{order.createdAt?.substring(0, 10)}</td>
                            
                            <td className="p-4">
                                {isSeller ? (
                                    <div>
                                        <span className="text-gray-900 dark:text-white font-bold block">{order.name}</span>
                                        <span className="text-gray-500 text-xs">{order.qty} x ${order.price}</span>
                                    </div>
                                ) : (
                                    <span className="text-primary font-bold">${order.totalPrice}</span>
                                )}
                            </td>

                            <td className="p-4 text-center">
                                {order.isPaid ? <span className="text-green-500 dark:text-green-400 font-bold">{t('yes') || "Yes"}</span> : <span className="text-red-500 dark:text-red-400 font-bold">{t('no') || "No"}</span>}
                            </td>
                            
                            <td className="p-4 text-center">
                                {order.isDelivered ? <span className="text-green-500 dark:text-green-400 font-bold">{t('yes') || "Yes"}</span> : <span className="text-red-500 dark:text-red-400 font-bold">{t('no') || "No"}</span>}
                            </td>

                            <td className="p-4">
                                <button
                                    onClick={() => {
                                        if (orderId) {
                                            navigate(`/order/${orderId}`);
                                        } else {
                                            alert("Order ID is missing! cannot view details.");
                                        }
                                    }}
                                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:text-dark dark:hover:bg-white dark:hover:text-dark text-gray-700 dark:text-white px-3 py-1 rounded transition text-xs font-bold uppercase"
                                >
                                    {t('view') || "VIEW"}
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
    );
};

export default ProfileScreen;