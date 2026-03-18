import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import {
  Package,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Search,
  TrendingUp,
  IndianRupee,
  PackageCheck,
  ArrowUpRight,
  Clock,
  FileText,
  AlertTriangle,
  Users
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/useStore';

import riceImg from '@/assets/rice-category.jpg';
import milletsImg from '@/assets/millets-category.jpg';
import pulsesImg from '@/assets/pulses-category.jpg';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { products, orders, isAdmin, isAuthenticated, user } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-4">Please login as admin to access this page</p>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getProductImage = (categoryId: string, image?: string) => {
    const imageUrl = getImageUrl(image);
    if (imageUrl) return imageUrl;
    if (categoryId === '1') return riceImg;
    if (categoryId === '2') return milletsImg;
    return pulsesImg;
  };

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    lowStockItemsData: [] as any[],
    recentOrdersData: [] as any[],
    bestSellingData: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdmin && user) {
          const token = (user as any).token || '';

          // Fetch parallel stats
          const [dashboardData, customersData, ordersData, performanceData] = await Promise.all([
            api.getDashboardStats(token).catch(() => ({})),
            api.getCustomers(token).catch(() => []),
            api.getOrders(token).catch(() => []),
            api.getProductPerformanceReport(token).catch(() => [])
          ]);

          setStats({
            totalRevenue: dashboardData.totalSales || 0,
            totalOrders: dashboardData.totalOrders || 0,
            totalProducts: dashboardData.totalProducts || 0,
            totalCustomers: Array.isArray(customersData) ? customersData.filter((u: any) => u.role !== 'admin').length : 0,
            lowStockProducts: dashboardData.lowStockProducts || 0,
            pendingOrders: dashboardData.pendingOrders || 0,
            lowStockItemsData: dashboardData.lowStockItems || [],
            recentOrdersData: Array.isArray(ordersData) ? ordersData.slice(0, 5) : [],
            bestSellingData: Array.isArray(performanceData) ? performanceData : []
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, [isAdmin, user, products]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { totalRevenue, totalOrders, totalProducts, totalCustomers, lowStockProducts, pendingOrders, lowStockItemsData, recentOrdersData, bestSellingData } = stats;

  const recentOrders = recentOrdersData;
  const lowStockItems = lowStockItemsData;

  // Calculate actual best selling products using performance data or fallback to first 3 products
  let bestSellingProducts = [];
  if (bestSellingData.length > 0) {
    bestSellingProducts = bestSellingData
      .slice(0, 3)
      .map((item: any) => {
        // Find the full product details from store
        const product = products.find(p => p.id === item._id) || {
          id: item._id,
          name: item.productName || 'Unknown Product',
          categoryId: 'unknown'
        };
        return { ...product, soldQuantity: item.totalQuantitySold };
      });
  } else {
    // Fallback if no sales data exists
    bestSellingProducts = [...products]
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 3);
  }

  return (
    <div className="p-6 lg:p-8 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/product-form">
            <Button className="gap-2 shadow-md">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" /> Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl p-6 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold bg-white/20 rounded-full px-2.5 py-1">
                <TrendingUp className="h-3 w-3" /> Live
              </div>
            </div>
            <p className="text-sm opacity-80 font-medium">Total Revenue</p>
            <p className="text-3xl font-extrabold mt-1">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            {pendingOrders > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-2.5 py-1">
                <Clock className="h-3 w-3" /> {pendingOrders} pending
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
          <p className="text-3xl font-extrabold text-foreground mt-1">{totalOrders}</p>
        </div>

        {/* Customers */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-11 w-11 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <Link to="/admin/customers" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              View all <ArrowUpRight className="h-3 w-3 inline" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Total Customers</p>
          <p className="text-3xl font-extrabold text-foreground mt-1">{totalCustomers}</p>
        </div>

        {/* Products */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <Link to="/admin/products" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              View all <ArrowUpRight className="h-3 w-3 inline" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground font-medium">Total Products</p>
          <p className="text-3xl font-extrabold text-foreground mt-1">{totalProducts}</p>
        </div>

        {/* Low Stock */}
        <div className={`bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-shadow ${lowStockProducts > 0 ? 'border-destructive/30' : 'border-border'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${lowStockProducts > 0 ? 'bg-destructive/10' : 'bg-orange-500/10'}`}>
              <AlertTriangle className={`h-5 w-5 ${lowStockProducts > 0 ? 'text-destructive' : 'text-orange-500'}`} />
            </div>
            {lowStockProducts > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 rounded-full px-2.5 py-1">
                Attention
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">Low Stock Items</p>
          <p className="text-3xl font-extrabold text-foreground mt-1">{lowStockProducts}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-base">Recent Orders</h2>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.length > 0 ? recentOrders.map((order, i) => (
              <Link
                key={order.id || i}
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm">#{order._id?.slice(-6) || `ORD-${i}`}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{typeof order.user === 'object' && order.user !== null ? order.user.firstName : 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{order.totalPrice?.toLocaleString()}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] mt-1 ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                          'bg-blue-50 text-blue-600 border-blue-200'
                      }`}
                  >
                    {order.status || 'Processing'}
                  </Badge>
                </div>
              </Link>
            )) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No recent orders
              </div>
            )}
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" /> Best Selling
            </h2>
            <Link to="/admin/reports">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Report <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center gap-4">
            {bestSellingProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={getProductImage(product.categoryId, product.image)}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-cover ring-1 ring-border shadow-sm"
                  />
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-white">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm leading-tight text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.unit}</p>
                </div>
                <div className="text-right flex items-center gap-1.5 flex-col">
                  {product.soldQuantity ? (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-[10px] font-bold">
                      {product.soldQuantity} Sold
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px] font-bold">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {bestSellingProducts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center italic">No sales data available yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm">
          <div className="p-5 border-b border-border">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-bold text-base">Products Overview</h2>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.slice(0, 8).map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(product.categoryId, product.image)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover ring-1 ring-border"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (product.categoryId === '1') target.src = riceImg;
                            else if (product.categoryId === '2') target.src = milletsImg;
                            else target.src = pulsesImg;
                          }}
                        />
                        <div>
                          <p className="font-semibold text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">per {product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        if (product.price) return <span className="font-semibold text-sm">₹{product.price}</span>;
                        if (!product.availableWeights || product.availableWeights.length === 0) return <span className="font-semibold text-sm">₹0</span>;
                        if (product.availableWeights.length === 1) return <span className="font-semibold text-sm">₹{product.availableWeights[0].price}</span>;

                        const prices = product.availableWeights.map((w: any) => w.price);
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);
                        return <span className="font-semibold text-sm">₹{minPrice} - ₹{maxPrice}</span>;
                      })()}
                      {product.discount > 0 && (
                        <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">-{product.discount}%</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.quantity < product.lowStockThreshold ? 'bg-destructive animate-pulse' : 'bg-emerald-500'}`} />
                          <span className={`text-sm font-medium ${product.quantity < product.lowStockThreshold ? 'text-destructive font-bold' : ''}`}>
                            {product.quantity} Bags
                          </span>
                        </div>
                        {product.availableWeights && product.availableWeights.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.availableWeights.slice(0, 2).map((w: any) => (
                              <span key={w.weight} className="text-[9px] text-muted-foreground bg-muted px-1 rounded">
                                {w.weight}: {w.stock || 0}
                              </span>
                            ))}
                            {product.availableWeights.length > 2 && <span className="text-[9px] text-muted-foreground">...</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const realStock = product.availableWeights && product.availableWeights.length > 0
                          ? product.availableWeights.reduce((sum: number, w: any) => sum + (w.stock || 0), 0)
                          : product.quantity;
                        if (!product.isAvailable) {
                          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">Inactive</span>;
                        } else if (realStock <= 0) {
                          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">Out of Stock</span>;
                        } else if (realStock < (product.lowStockThreshold || 10)) {
                          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">Low Stock</span>;
                        } else {
                          return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">In Stock</span>;
                        }
                      })()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/products/edit/${product.id}`}>
                          <Button variant="ghost" size="icon-sm" className="hover:bg-primary/10 hover:text-primary">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Showing {Math.min(filteredProducts.length, 8)} of {filteredProducts.length} products</p>
            <Link to="/admin/products">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View Products <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">Low Stock Alert</h3>
              <p className="text-xs text-amber-700">These products need restocking soon</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {lowStockItems.map((product) => (
              <Link
                key={product.id}
                to={`/admin/products/edit/${product.id}`}
                className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-amber-200 hover:border-amber-400 transition-colors"
              >
                <img
                  src={getProductImage(product.categoryId, product.image)}
                  alt={product.name}
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (product.categoryId === '1') target.src = riceImg;
                    else if (product.categoryId === '2') target.src = milletsImg;
                    else target.src = pulsesImg;
                  }}
                />
                <div>
                  <p className="text-xs font-semibold text-amber-900">{product.name}</p>
                  <p className="text-[10px] text-amber-700 font-medium">{product.quantity} Bags left</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
