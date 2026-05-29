import { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Edit2, Shield, ShoppingBag, 
  DollarSign, ClipboardList, CheckCircle, Clock, 
  Layers, Package, Star, AlertCircle, RefreshCw 
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onClose: () => void;
}

interface MenuItemType {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  rating?: number;
  trending?: boolean;
  isSpecial?: boolean;
  type: 'food' | 'cocktail';
}

interface OrderItemType {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: string;
}

interface OrderType {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItemType[];
  user?: {
    name: string;
    email: string;
  };
}

export function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders'>('overview');
  const [foodItems, setFoodItems] = useState<MenuItemType[]>([]);
  const [cocktailItems, setCocktailItems] = useState<MenuItemType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form State for Add / Edit Item
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    type: 'food' as 'food' | 'cocktail',
    rating: '4.5',
    trending: false,
    isSpecial: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Food Menu
      const foodRes = await fetch('/api/menu');
      const foods = await foodRes.json();
      const mappedFoods = foods.map((f: any) => ({ ...f, type: 'food' as const }));

      // 2. Fetch Cocktails
      const drinkRes = await fetch('/api/cocktails');
      const drinks = await drinkRes.json();
      const mappedDrinks = drinks.map((d: any) => ({ ...d, type: 'cocktail' as const }));

      setFoodItems(mappedFoods);
      setCocktailItems(mappedDrinks);

      // 3. Fetch Orders
      const ordersRes = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  // CRUD: Delete Item
  const handleDeleteItem = async (id: number, type: 'food' | 'cocktail') => {
    if (!window.confirm(`Are you sure you want to delete this ${type} item?`)) return;

    try {
      const res = await fetch(`/api/admin/menu/${id}?type=${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        toast.success('Item deleted successfully');
        if (type === 'food') {
          setFoodItems(foodItems.filter(item => item.id !== id));
        } else {
          setCocktailItems(cocktailItems.filter(item => item.id !== id));
        }
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete item');
      }
    } catch (err) {
      toast.error('Network error. Failed to delete item');
    }
  };

  // CRUD: Add / Update Item Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      ...formData,
      price: formData.price.startsWith('₹') ? formData.price : `₹${formData.price}`
    };

    try {
      const url = editingItem 
        ? `/api/admin/menu/${editingItem.id}`
        : '/api/admin/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(editingItem ? 'Item updated successfully' : 'Item added successfully');
        setIsFormOpen(false);
        setEditingItem(null);
        fetchData(); // Reload menu grids
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save item');
      }
    } catch (err) {
      toast.error('Network error. Failed to save item');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(`Order status updated to ${status}`);
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update order');
      }
    } catch (err) {
      toast.error('Network error. Failed to update order');
    }
  };

  // Open Form for Adding
  const openAddForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      type: 'food',
      rating: '4.5',
      trending: false,
      isSpecial: false
    });
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditForm = (item: MenuItemType) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.replace('₹', ''),
      image: item.image,
      type: item.type,
      rating: (item.rating || 4.5).toString(),
      trending: !!item.trending,
      isSpecial: !!item.isSpecial
    });
    setIsFormOpen(true);
  };

  // Statistics Calculations
  const totalRevenue = orders
    .filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const preparingOrders = orders.filter(o => o.status === 'PREPARING').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-serif">Executive Administration Portal</h1>
            <p className="text-xs text-gray-400">ICE CUBE Back-Office Management Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-all duration-300"
            title="Refresh statistics and menu"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300"
          >
            <X className="w-4 h-4" />
            Exit Panel
          </button>
        </div>
      </header>

      {/* Tabs bar */}
      <div className="bg-white border-b border-gray-100 px-6 flex overflow-x-auto space-x-1 shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3.5 px-6 font-semibold text-sm border-b-2 transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`py-3.5 px-6 font-semibold text-sm border-b-2 transition-all shrink-0 ${
            activeTab === 'menu'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Menu Management
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3.5 px-6 font-semibold text-sm border-b-2 transition-all shrink-0 ${
            activeTab === 'orders'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Order Control Queue
          {pendingOrders > 0 && (
            <span className="ml-2 bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              {pendingOrders}
            </span>
          )}
        </button>
      </div>

      {/* Main Body */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <RefreshCw className="w-10 h-10 animate-spin text-amber-600 mb-3" />
            <p className="text-sm font-semibold">Loading secure database files...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                {/* Stats grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Revenue Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Sales</span>
                      <span className="text-2xl font-extrabold text-gray-900 mt-1 block">₹{totalRevenue}</span>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-700">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Active Orders Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Active Queue</span>
                      <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{pendingOrders + preparingOrders}</span>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-700">
                      <Clock className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Foods Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Food Recipes</span>
                      <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{foodItems.length}</span>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-2xl text-orange-700">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Cocktails Card */}
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Infusions & Drinks</span>
                      <span className="text-2xl font-extrabold text-gray-900 mt-1 block">{cocktailItems.length}</span>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-700">
                      <Layers className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* Lower sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Quick Order log */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                      <ClipboardList className="w-5 h-5 text-amber-600" />
                      Recent Order Queue Log
                    </h3>
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {orders.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-12">No orders recorded in system.</p>
                      ) : (
                        orders.slice(0, 5).map(order => (
                          <div key={order.id} className="flex justify-between items-center p-4 border border-gray-50 rounded-2xl bg-gray-50/50 hover:bg-gray-50 hover:border-amber-100 transition-all">
                            <div>
                              <p className="text-sm font-bold text-gray-900">#IC-00{order.id}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{order.user?.name || 'Guest User'} ({order.items.length} items)</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-amber-800">₹{order.totalAmount}</span>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                  ? 'bg-green-50 text-green-700'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Summary Status Panel */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Kitchen System Status
                      </h3>
                      <div className="space-y-4 mt-4">
                        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                          <span className="text-gray-500 font-medium">Pending Approvals</span>
                          <span className="font-bold text-red-500">{pendingOrders} orders</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                          <span className="text-gray-500 font-medium">In Chef Preparation</span>
                          <span className="font-bold text-amber-600">{preparingOrders} orders</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                          <span className="text-gray-500 font-medium">Fully Completed</span>
                          <span className="font-bold text-emerald-600">
                            {orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length} orders
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
                      💡 <strong>Executive Tip:</strong> Keep the active queue preparation status updated. Regular updates ensure customers can track order steps seamlessly on their mobile dashboards.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MENU MANAGEMENT TAB */}
            {activeTab === 'menu' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-gray-900">Manage Restaurant Menu</h2>
                    <p className="text-xs text-gray-400">Total catalog: {foodItems.length} Food Recipes | {cocktailItems.length} Drinks</p>
                  </div>
                  <button
                    onClick={openAddForm}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    Add Menu Item
                  </button>
                </div>

                {/* Food Grids */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold font-serif text-amber-900 border-l-4 border-amber-600 pl-3">Food & Culinary Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foodItems.map(item => (
                      <div key={item.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="h-44 relative bg-gray-100">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                          {item.trending && (
                            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                              Trending
                            </span>
                          )}
                          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            {item.price}
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-gray-900">{item.name}</h4>
                              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {item.rating}
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">{item.description}</p>
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t border-gray-50">
                            <button
                              onClick={() => openEditForm(item)}
                              className="flex-1 py-2 text-xs font-bold text-gray-600 hover:text-amber-800 bg-gray-50 hover:bg-amber-50 rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, 'food')}
                              className="px-4 py-2 text-xs font-bold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl transition-all flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cocktail Grids */}
                <div className="space-y-4 pt-6">
                  <h3 className="text-base font-bold font-serif text-blue-900 border-l-4 border-blue-600 pl-3">Mocktails \& Premium Drinks</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cocktailItems.map(item => (
                      <div key={item.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                        <div className="h-44 relative bg-gray-100">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                          {item.isSpecial && (
                            <span className="absolute top-3 left-3 bg-blue-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                              Special
                            </span>
                          )}
                          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            {item.price}
                          </span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">{item.description}</p>
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t border-gray-50">
                            <button
                              onClick={() => openEditForm(item)}
                              className="flex-1 py-2 text-xs font-bold text-gray-600 hover:text-amber-800 bg-gray-50 hover:bg-amber-50 rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, 'cocktail')}
                              className="px-4 py-2 text-xs font-bold text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl transition-all flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ORDER MANAGEMENT TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold font-serif text-gray-900">Active Order Management Queue</h2>
                  <p className="text-xs text-gray-400">View customer checkouts, billings, and manage kitchen status timelines.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm text-gray-400">
                    <ClipboardList className="w-16 h-16 mx-auto opacity-20 mb-3" />
                    <p className="text-sm font-semibold">No orders found in database</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map(order => (
                      <div 
                        key={order.id} 
                        className={`bg-white rounded-3xl border p-6 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between ${
                          order.status === 'PENDING' ? 'border-red-200' :
                          order.status === 'PREPARING' ? 'border-amber-200' :
                          'border-gray-100'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase">Order Reference</p>
                              <h4 className="text-base font-bold text-gray-900">#IC-00{order.id}</h4>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                                order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : order.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {order.status}
                              </span>
                              <p className="text-base font-bold text-amber-800 mt-2">₹{order.totalAmount}</p>
                            </div>
                          </div>

                          {/* Customer Details */}
                          <div className="text-xs space-y-0.5">
                            <p className="font-semibold text-gray-700"><span className="text-gray-400">Customer:</span> {order.user?.name || 'Guest Customer'}</p>
                            <p className="text-gray-400">{order.user?.email || 'N/A'}</p>
                          </div>

                          {/* Items Ordered */}
                          <div className="space-y-2 bg-gray-50/50 border border-gray-50 p-4 rounded-2xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Items Queue</p>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 font-medium">
                                  <span className="font-bold text-amber-700 mr-1">{item.quantity}x</span>
                                  {item.name}
                                </span>
                                <span className="text-gray-400">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status Controls */}
                        <div className="pt-4 border-t border-gray-50 mt-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Update Stage</p>
                          <div className="grid grid-cols-3 gap-2">
                            {order.status !== 'PREPARING' && order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                                className="py-2 text-xs font-bold bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1 border border-amber-100"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Prepare
                              </button>
                            )}
                            {order.status === 'PREPARING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                className="col-span-2 py-2 text-xs font-bold bg-green-50 hover:bg-green-500 text-green-800 hover:text-white rounded-xl transition-all flex items-center justify-center gap-1 border border-green-100"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Deliver Order
                              </button>
                            )}
                            {order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                                className="py-2 text-xs font-bold bg-red-50 hover:bg-red-500 text-red-800 hover:text-white rounded-xl transition-all flex items-center justify-center border border-red-100"
                              >
                                Cancel
                              </button>
                            )}
                            {(order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                              <span className="col-span-3 text-xs text-gray-400 italic text-center py-1">
                                Order flow finalized. No actions needed.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD / EDIT MENU ITEM DIALOG MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-amber-100 shadow-2xl overflow-hidden animate-scale-in z-10 flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-amber-50/20">
              <h3 className="text-lg font-serif font-bold text-amber-900">
                {editingItem ? 'Edit Recipe/Drink Details' : 'Add New Menu Item'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Type toggle */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Item Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'food' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'food'
                        ? 'border-amber-600 bg-amber-50 text-amber-800'
                        : 'border-gray-100 bg-white text-gray-500'
                    }`}
                  >
                    Culinary/Food
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'cocktail' })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.type === 'cocktail'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-gray-100 bg-white text-gray-500'
                    }`}
                  >
                    Mocktail/Drink
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Item Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Garlic Butter Lobster"
                  className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Price in INR (₹) *</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 450"
                  className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Image Unsplash URL</label>
                <input 
                  type="url" 
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="e.g. https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Detailed Recipe Description *</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide an attractive gourmet sensory description of the ingredients, flavors, and serving style..."
                  className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors leading-relaxed"
                  required
                />
              </div>

              {/* Custom specs based on type */}
              {formData.type === 'food' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Rating (1.0 - 5.0)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input 
                      type="checkbox"
                      id="trending"
                      checked={formData.trending}
                      onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
                      className="w-4.5 h-4.5 text-amber-600 border-gray-200 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="trending" className="text-xs font-bold text-gray-600 select-none">Mark as Trending</label>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-3">
                  <input 
                    type="checkbox"
                    id="isSpecial"
                    checked={formData.isSpecial}
                    onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                    className="w-4.5 h-4.5 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isSpecial" className="text-xs font-bold text-gray-600 select-none">Mark as Chef Special Drink</label>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-50 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-bold rounded-xl shadow-md transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
