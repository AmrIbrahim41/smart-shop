import React, { useState, useEffect } from 'react';
import { apiService } from '../../api';
import { FaChartLine, FaBoxOpen, FaUsers, FaClipboardList, FaTrash, FaEdit, FaPlus, FaFileCsv, FaTags, FaLayerGroup } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    // --- Stats & Data State ---
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]); // 👈 state للتاجز
    const [loading, setLoading] = useState(true);
    const [chartReady, setChartReady] = useState(false);
    
    // --- UI State ---
    const [activeTab, setActiveTab] = useState('categories'); // 👈 للتحكم في التبويبات (categories أو tags)

    // --- Forms State ---
    const [catName, setCatName] = useState('');
    const [tagName, setTagName] = useState(''); // 👈 اسم التاج
    
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // 1. جلب البيانات
    const fetchData = async () => {
        try {
            const statsData = await apiService.getDashboardStats();
            const catsData = await apiService.getCategories();
            // نفترض أن هناك API لجلب التاجز، لو مش موجود ممكن تستخدم نفس منطق الأقسام مؤقتاً
            // const tagsData = await apiService.getTags(); 
            
            setStats(statsData.data);
            setCategories(catsData.data);
            
            // 👇 (مؤقت) لو مفيش API للتاجز لسه، ممكن نفترض أنها مصفوفة فارغة أو نجرب نجيبها
            try {
               const tagsResponse = await apiService.getTags(); // تأكد أن الدالة دي موجودة في api.js
               setTags(tagsResponse.data);
            } catch (e) {
               console.log("Tags API not ready yet");
            }

            setLoading(false);
            
            setTimeout(() => {
                setChartReady(true);
            }, 500); 
            
        } catch (error) {
            console.error("Error fetching admin data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Category Handlers ---
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

    // --- Tag Handlers (New) 👇 ---
    const handleTagSubmit = async (e) => {
        e.preventDefault();
        if(!tagName) return;
        try {
            if (editMode) {
                await apiService.updateTag(editId, { name: tagName }); // تأكد من وجود updateTag في api.js
                alert('Tag Updated! ✅');
            } else {
                await apiService.createTag({ name: tagName }); // تأكد من وجود createTag في api.js
                alert('Tag Created! 🎉');
            }
            setTagName('');
            setEditMode(false);
            setEditId(null);
            fetchData(); 
        } catch (error) {
            alert('Error saving tag');
        }
    };

    const handleDeleteTag = async (id) => {
        if(window.confirm('Delete this tag?')) {
            try {
                await apiService.deleteTag(id); // تأكد من وجود deleteTag في api.js
                fetchData();
            } catch (error) {
                alert('Error deleting tag');
            }
        }
    };

    // دالة موحدة لبدء التعديل
    const handleEditClick = (item, type) => {
        if (type === 'category') {
            setCatName(item.name);
            setActiveTab('categories');
        } else {
            setTagName(item.name);
            setActiveTab('tags');
        }
        setEditMode(true);
        setEditId(item.id || item._id);
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditId(null);
        setCatName('');
        setTagName('');
    };

    // --- CSV Export Handler ---
    const handleExportCSV = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            alert("Starting Download... 📂");
            
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
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error(error);
            alert("Error exporting CSV");
        }
    };

    if (loading) return <div className="min-h-screen pt-24 text-center font-bold text-gray-500 animate-pulse">Loading Analytics...</div>;

    return (
        <div className="min-h-screen pt-20 md:pt-28 pb-10 px-4 md:px-8 bg-gray-50 dark:bg-dark transition-colors">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                 <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-3">
                    <FaChartLine className="text-primary" /> Admin Dashboard
                </h1>
                <span className="text-xs md:text-sm font-bold bg-white dark:bg-white/10 px-3 py-1 rounded-full text-gray-500 border border-gray-100 dark:border-white/5">
                    Overview & Stats
                </span>
            </div>

            {/* 1. Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                <StatCard icon={<FaChartLine />} title="Total Sales" value={`$${stats?.totalSales.toFixed(2)}`} color="bg-blue-500" />
                <StatCard icon={<FaClipboardList />} title="Total Orders" value={stats?.totalOrders} color="bg-green-500" />
                <StatCard icon={<FaBoxOpen />} title="Products" value={stats?.totalProducts} color="bg-orange-500" />
                <StatCard icon={<FaUsers />} title="Users" value={stats?.totalUsers} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                
                {/* 2. Sales Analytics Chart */}
                <div className="bg-white dark:bg-dark-accent p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 order-2 lg:order-1 min-w-0">
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">Sales Performance</h2>
                    
                    <div style={{ width: '100%', height: '300px' }}>
                        {chartReady && stats?.salesChart && stats.salesChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={stats.salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse">
                                {chartReady ? "No sales data yet" : "Loading Chart..."}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-xs md:text-sm uppercase tracking-wide">Quick Actions</h3>
                        <div className="flex flex-col md:flex-row gap-3">
                            <button 
                                onClick={handleExportCSV}
                                className="w-full md:w-auto px-5 py-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold hover:bg-green-100 dark:hover:bg-green-500/20 transition flex items-center justify-center gap-2"
                            >
                                <FaFileCsv size={18} /> Export CSV
                            </button>
                            {/* 👇 تم تفعيل الزر ليعمل الآن */}
                            <button 
                                onClick={() => setActiveTab('tags')} 
                                className={`w-full md:w-auto px-5 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'tags' ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500' : 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20'}`}
                            >
                                <FaTags size={16} /> Manage Tags
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Management Panel (Categories & Tags) */}
                <div className="bg-white dark:bg-dark-accent p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 h-fit order-1 lg:order-2 flex flex-col">
                    
                    {/* Tabs Header */}
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
                        <button 
                            onClick={() => { setActiveTab('categories'); cancelEdit(); }}
                            className={`flex items-center gap-2 text-sm md:text-base font-bold pb-2 border-b-2 transition ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            <FaLayerGroup /> Categories
                        </button>
                        <button 
                            onClick={() => { setActiveTab('tags'); cancelEdit(); }}
                            className={`flex items-center gap-2 text-sm md:text-base font-bold pb-2 border-b-2 transition ${activeTab === 'tags' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            <FaTags /> Tags
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
                            {activeTab === 'categories' ? 'Manage Categories' : 'Manage Tags'}
                        </h2>
                        {editMode && (
                            <button onClick={cancelEdit} className="text-xs text-red-500 underline">Cancel Edit</button>
                        )}
                    </div>

                    {/* Form Section (Dynamic based on Tab) */}
                    <form onSubmit={activeTab === 'categories' ? handleCategorySubmit : handleTagSubmit} className="flex gap-2 md:gap-3 mb-6">
                        <input 
                            type="text" 
                            value={activeTab === 'categories' ? catName : tagName}
                            onChange={(e) => activeTab === 'categories' ? setCatName(e.target.value) : setTagName(e.target.value)}
                            placeholder={activeTab === 'categories' ? "New Category Name..." : "New Tag Name..."}
                            className="flex-1 bg-gray-50 dark:bg-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary transition text-sm md:text-base"
                        />
                        <button type="submit" className={`${activeTab === 'categories' ? 'bg-primary hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'} text-white px-4 md:px-6 rounded-xl font-bold transition flex items-center gap-2 shadow-lg text-sm md:text-base`}>
                            {editMode ? <FaEdit /> : <FaPlus />}
                        </button>
                    </form>

                    {/* List Section (Dynamic based on Tab) */}
                    <div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[350px] overflow-y-auto custom-scrollbar pr-1 md:pr-2 flex-1">
                        
                        {/* عرض الأقسام */}
                        {activeTab === 'categories' && categories.map((cat) => (
                            <div key={cat.id || cat._id} className="group flex justify-between items-center p-3 md:p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-colors">
                                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm md:text-base">{cat.name}</span>
                                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(cat, 'category')} className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition">
                                        <FaEdit size={12} />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat.id || cat._id)} className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:scale-110 transition">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* عرض التاجز */}
                        {activeTab === 'tags' && (
                            tags.length > 0 ? (
                                tags.map((tag) => (
                                    <div key={tag.id || tag._id} className="group flex justify-between items-center p-3 md:p-4 bg-purple-50/50 dark:bg-white/5 rounded-2xl border border-purple-100 dark:border-white/5 hover:border-purple-500/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <FaTags className="text-purple-300 text-xs" />
                                            <span className="font-bold text-gray-700 dark:text-gray-200 text-sm md:text-base">{tag.name}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditClick(tag, 'tag')} className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition">
                                                <FaEdit size={12} />
                                            </button>
                                            <button onClick={() => handleDeleteTag(tag.id || tag._id)} className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:scale-110 transition">
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400 text-sm">No tags found. Add some!</div>
                            )
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-dark-accent p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 dark:border-white/5 flex items-center gap-3 md:gap-4 hover:-translate-y-1 transition-transform duration-300">
        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${color} text-white flex items-center justify-center text-lg md:text-2xl shadow-lg shadow-${color.replace('bg-', '')}/30`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider truncate">{title}</p>
            <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white truncate">{value}</h3>
        </div>
    </div>
);

export default AdminDashboard;