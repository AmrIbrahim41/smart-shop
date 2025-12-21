import React, { useState, useEffect } from 'react';
import api from '../../api'; 
import { FaTimes, FaCheck, FaTrash, FaUser, FaStore, FaEnvelope, FaIdBadge, FaUsersCog } from 'react-icons/fa'; 
import { useNavigate } from 'react-router-dom'; 
import Meta from '../../components/tapheader/Meta';
import { useSettings } from '../../context/SettingsContext'; 

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('customer'); 

  const navigate = useNavigate();
  const { t } = useSettings(); 
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchUsers = async () => {
      try {
        const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        };
        const { data } = await api.get('/users/', config);
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
        fetchUsers();
    } else {
        navigate('/login');
    }
  }, [navigate]);

  const deleteHandler = async (id) => {
    if(window.confirm(t('confirmDeleteUser') || 'Are you sure you want to delete this user?')) {
        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await api.delete(`/users/delete/${id}/`, config);
            alert(t('userDeleted') || "User Deleted Successfully");
            setUsers(users.filter(user => user.id !== id)); 
        } catch (error) {
            alert(t('deleteUserError') || "Error deleting user");
        }
    }
  };

  const filteredUsers = users.filter(user => {
      const userType = user.profile ? user.profile.type : (user.isAdmin ? 'admin' : 'customer');
      if (filterType === 'vendor') return userType === 'vendor';
      return userType === 'customer' || userType === 'admin'; 
  });

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 md:px-6 bg-gray-50 dark:bg-dark transition-colors duration-300">
      <Meta title={t('userList') || "USERS LIST"} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 border-l-4 border-primary pl-4 uppercase transition-colors flex items-center gap-2">
            <FaUsersCog className="text-primary" /> {t('usersManagement') || "USERS MANAGEMENT"}
        </h1>

        {/* 👇 أزرار التبديل (Tabs) المطورة والمرنة 👇 */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8">
            <button 
                onClick={() => setFilterType('customer')}
                className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-300 shadow-sm ${
                    filterType === 'customer' 
                    ? 'bg-primary text-white shadow-lg shadow-orange-500/30 scale-[1.02]' 
                    : 'bg-white dark:bg-dark-accent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10'
                }`}
            >
                <div className={`p-2 rounded-lg ${filterType === 'customer' ? 'bg-white/20' : 'bg-gray-100 dark:bg-dark'}`}>
                    <FaUser size={18} />
                </div>
                <span className="whitespace-nowrap text-sm md:text-base uppercase tracking-wide">
                    {t('customersAndAdmins') || "Customers & Admins"}
                </span>
            </button>

            <button 
                onClick={() => setFilterType('vendor')}
                className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all duration-300 shadow-sm ${
                    filterType === 'vendor' 
                    ? 'bg-primary text-white shadow-lg shadow-orange-500/30 scale-[1.02]' 
                    : 'bg-white dark:bg-dark-accent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10'
                }`}
            >
                <div className={`p-2 rounded-lg ${filterType === 'vendor' ? 'bg-white/20' : 'bg-gray-100 dark:bg-dark'}`}>
                    <FaStore size={18} />
                </div>
                <span className="whitespace-nowrap text-sm md:text-base uppercase tracking-wide">
                    {t('sellersVendors') || "Sellers (Vendors)"}
                </span>
            </button>
        </div>

        {loading ? (
          <div className="text-gray-600 dark:text-white text-center font-bold animate-pulse py-20">{t('loadingUsers') || "Loading Users..."}</div>
        ) : (
          <>
            {/* ========================================= */}
            {/* 1. عرض الموبايل (Cards View) */}
            {/* ========================================= */}
            <div className="md:hidden space-y-4">
                {filteredUsers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-dark-accent rounded-2xl border border-gray-200 dark:border-white/10">
                        {t('noUsersFound')}
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white dark:bg-dark-accent p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm relative">
                            <button 
                                onClick={() => deleteHandler(user.id)} 
                                className="absolute top-4 right-4 text-red-500 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg"
                            >
                                <FaTrash size={14} />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                    {user.name[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate pr-6">{user.name}</h3>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                        user.isAdmin ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                    }`}>
                                        {user.isAdmin ? 'Admin' : (user.profile?.type || 'Customer')}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-2">
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <FaEnvelope className="shrink-0" />
                                    <a href={`mailto:${user.email}`} className="text-primary hover:underline truncate">{user.email}</a>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                                    <FaIdBadge className="shrink-0" />
                                    <span>{user.id}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ========================================= */}
            {/* 2. عرض الكمبيوتر (Table View) */}
            {/* ========================================= */}
            <div className="hidden md:block overflow-x-auto bg-white dark:bg-dark-accent rounded-xl border border-gray-200 dark:border-white/10 shadow-lg transition-colors">
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 uppercase text-xs">
                    <th className="p-4">{t('id') || "ID"}</th>
                    <th className="p-4">{t('name') || "NAME"}</th>
                    <th className="p-4">{t('email') || "EMAIL"}</th>
                    <th className="p-4 text-center">{t('type') || "TYPE"}</th> 
                    <th className="p-4 text-center">{t('admin') || "ADMIN"}</th>
                    <th className="p-4 text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10 text-sm text-gray-700 dark:text-gray-300 transition-colors">
                    {filteredUsers.length === 0 ? (
                        <tr><td colSpan="6" className="p-10 text-center font-bold text-gray-500">{t('noUsersFound')}</td></tr>
                    ) : (
                        filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                            <td className="p-4 text-xs font-mono text-gray-400">{user.id}</td>
                            <td className="p-4 font-bold text-gray-900 dark:text-white">{user.name}</td>
                            <td className="p-4 truncate max-w-[200px]"><a href={`mailto:${user.email}`} className="text-blue-600 dark:text-primary hover:underline">{user.email}</a></td>
                            
                            <td className="p-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    (user.profile?.type === 'vendor') ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                }`}>
                                    {user.profile?.type || t('customer')}
                                </span>
                            </td>

                            <td className="p-4 text-center">
                            {user.isAdmin ? (
                                <FaCheck className="text-green-500 mx-auto" />
                            ) : (
                                <FaTimes className="text-red-500 mx-auto" />
                            )}
                            </td>

                            <td className="p-4 text-right">
                                <button 
                                    onClick={() => deleteHandler(user.id)} 
                                    className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white p-2 rounded-lg transition"
                                    title={t('delete')}
                                >
                                    <FaTrash size={16} />
                                </button>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserListScreen;