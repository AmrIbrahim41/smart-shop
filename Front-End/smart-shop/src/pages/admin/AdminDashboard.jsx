import React, { useState, useEffect } from 'react';
import { apiService } from '../../api';
import { FaChartLine, FaBoxOpen, FaUsers, FaClipboardList, FaTrash, FaEdit, FaPlus, FaFileCsv, FaTags } from 'react-icons/fa';
// 👇 استيراد مكتبة الشارت
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Category Form State
    const [catName, setCatName] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchData = async () => {
        try {
            const statsData = await apiService.getDashboardStats();
            const catsData = await apiService.getCategories();
            setStats(statsData.data);
            setCategories(catsData.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admin data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Category Handlers (نفس الكود القديم) ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        if(!catName) return;
        try {
            if (editMode) {
                await apiService.updateCategory(editId, { name: catName });
                alert('Category Updated! ✅');
            } else {
                await apiService.createCategory({ name: catName });
                alert('Category Created! 🎉');
            }
            setCatName('');
            setEditMode(false);
            setEditId(null);
            fetchData(); 
        } catch (error) {
            alert('Error saving category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if(window.confirm('Are you sure you want to delete this category?')) {
            try {
                await apiService.deleteCategory(id);
                fetchData();
            } catch (error) {
                alert('Error deleting category');
            }
        }
    };

    const handleEditClick = (cat) => {
        setCatName(cat.name);
        setEditMode(true);
        setEditId(cat.id || cat._id);
    };

    // 👇👇 دالة تحميل ملف CSV 👇👇
    const handleExportCSV = async () => {
        try {
            // بنستخدم window.open عشان المتصفح يحمل الملف مباشرة
            // تأكد إن الرابط ده مطابق للـ URL في الباك إند
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            
            // الطريقة دي بتضمن إرسال التوكين لو احتجنا fetch، لكن للتحميل المباشر window.open أسهل
            // لو واجهت مشكلة في الصلاحيات مع window.open، قولي وهنعملها بـ axios blob
            
            // للتسهيل: هنفترض إنك عامل Authentication بـ Cookies أو هتستخدم Fetch Blob
            // الطريقة الأضمن بـ Axios:
            alert("Starting Download... 📂");
            
            // *ملحوظة*: لازم تضيف exportOrdersCSV في apiService في ملف api.js
            // لو مش موجودة، ضيفها: exportOrdersCSV: () => api.get('api/orders/export/csv/', { responseType: 'blob' }),
            
            // حل مؤقت مباشر لو مش عايز تعدل api.js دلوقتي:
            const response = await apiService.getOrders(); // دي بس للتجربة، الصح تعمل دالة جديدة
            // بس عشان نعملها صح 100%، يفضل إضافة الدالة في api.js
            // 👇 الحل السريع باستخدام Fetch مباشر مع التوكين:
            const responseCsv = await fetch('http://127.0.0.1:8000/api/orders/export/csv/', {
                headers: {
                    'Authorization': `Bearer ${userInfo.token}`
                }
            });
            const blob = await responseCsv.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'orders_report.csv';
            a.click();
            
        } catch (error) {
            console.error(error);
            alert("Error exporting CSV");
        }
    };

    if (loading) return <div className="min-h-screen pt-24 text-center font-bold text-gray-500 animate-pulse">Loading Analytics...</div>;

    return (
        <div className="min-h-screen pt-24 pb-10 px-4 md:px-8 bg-gray-50 dark:bg-dark transition-colors">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase flex items-center gap-3">
                <FaChartLine className="text-primary" /> Admin Dashboard
            </h1>

            {/* 1. Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard icon={<FaChartLine />} title="Total Sales" value={`$${stats?.totalSales.toFixed(2)}`} color="bg-blue-500" />
                <StatCard icon={<FaClipboardList />} title="Total Orders" value={stats?.totalOrders} color="bg-green-500" />
                <StatCard icon={<FaBoxOpen />} title="Products" value={stats?.totalProducts} color="bg-orange-500" />
                <StatCard icon={<FaUsers />} title="Users" value={stats?.totalUsers} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* 2. Sales Analytics Chart (تم تفعيله) */}
                <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Sales Performance</h2>
                    <div className="h-[300px] w-full">
                        {stats?.salesChart && stats.salesChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.salesChart}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No sales data yet</div>
                        )}
                    </div>
                    
                    {/* Quick Actions (تم تفعيلها) */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-sm uppercase tracking-wide">Quick Actions</h3>
                        <div className="flex gap-3 flex-wrap">
                            <button 
                                onClick={handleExportCSV}
                                className="px-5 py-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold hover:bg-green-100 dark:hover:bg-green-500/20 transition flex items-center gap-2"
                            >
                                <FaFileCsv size={18} /> Export Orders CSV
                            </button>
                            <button 
                                onClick={() => alert("Tag Management feature coming soon! 🚀")}
                                className="px-5 py-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-100 dark:hover:bg-purple-500/20 transition flex items-center gap-2"
                            >
                                <FaTags size={16} /> Manage Tags
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Category Management (شغال بالفعل) */}
                <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 h-fit">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
                        {editMode && (
                            <button onClick={() => {setEditMode(false); setCatName('');}} className="text-xs text-red-500 underline">Cancel Edit</button>
                        )}
                    </div>

                    <form onSubmit={handleCategorySubmit} className="flex gap-3 mb-8">
                        <input 
                            type="text" 
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            placeholder="New Category..." 
                            className="flex-1 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <button type="submit" className="bg-primary text-white px-6 rounded-xl font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-lg shadow-primary/30">
                            {editMode ? <FaEdit /> : <FaPlus />}
                        </button>
                    </form>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                        {categories.map((cat) => (
                            <div key={cat.id || cat._id} className="group flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-colors">
                                <span className="font-bold text-gray-700 dark:text-gray-200">{cat.name}</span>
                                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(cat)} className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition">
                                        <FaEdit size={14} />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat.id || cat._id)} className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:scale-110 transition">
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-dark-accent p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
        <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center text-2xl shadow-lg shadow-${color.replace('bg-', '')}/30`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;