import React, { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    ShoppingCart,
    Check,
    Search,
    Eye,
    Truck,
    Clock,
    XCircle,
    Package,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_TABS = [
    { label: 'All', value: 'all', icon: ShoppingCart },
    { label: 'Pending', value: 'Pending', icon: Clock },
    { label: 'Confirmed', value: 'Confirmed', icon: Check },
    { label: 'Shipped', value: 'Shipped', icon: Truck },
    { label: 'Delivered', value: 'Delivered', icon: Package },
    { label: 'Cancelled', value: 'Cancelled', icon: XCircle },
];

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Shipped': return 'bg-violet-50 text-violet-700 border-violet-200';
        case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-secondary text-secondary-foreground border-border';
    }
};

const AdminOrders = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (user && (user as any).token) {
            setLoading(true);
            try {
                const data = await api.getOrders((user as any).token);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.updateOrderStatus(id, newStatus, (user as any).token);
            toast.success(`Order marked as ${newStatus}`);
            fetchOrders();
        } catch (e: any) {
            toast.error(e.message || "Failed to update order status");
        }
    };

    const filteredOrders = orders
        .filter(o => activeTab === 'all' || o.status === activeTab)
        .filter(o => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                o._id?.toLowerCase().includes(q) ||
                o.user?.firstName?.toLowerCase().includes(q) ||
                o.user?.lastName?.toLowerCase().includes(q) ||
                o.user?.email?.toLowerCase().includes(q)
            );
        });

    const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, { all: orders.length });

    return (
        <div className="p-6 lg:p-8 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                        Order Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">{orders.length} total orders</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 text-sm rounded-xl"
                    />
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {STATUS_TABS.map(tab => {
                    const count = tab.value === 'all' ? orders.length : (statusCounts[tab.value] || 0);
                    const isActive = activeTab === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                                }`}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 
                                ${isActive ? 'bg-white/20' : 'bg-secondary'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Orders Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30">
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment</th>
                                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50' : ''}>
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                    <td className="p-4">
                                        <span className="font-mono font-bold text-xs text-primary tracking-wider">
                                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-primary">
                                                    {(order.user?.firstName?.[0] || '?').toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</p>
                                                <p className="text-[11px] text-muted-foreground">{order.user?.email || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                            <p className="text-[11px] text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-sm">₹{Number(order.totalPrice).toLocaleString()}</span>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className={`text-[11px] font-semibold ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className={`text-[11px] font-semibold ${order.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="gap-1.5 text-xs h-8 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => navigate(`/admin/orders/${order._id}`)}
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </Button>

                                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className="h-8 text-xs rounded-md border border-input bg-background px-2 py-1 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Packed">Packed</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Out for Delivery">Out for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty state */}
                {!loading && filteredOrders.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="h-7 w-7 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-semibold text-lg text-muted-foreground">No orders found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery || activeTab !== 'all' ? 'Try adjusting your filters' : 'Orders will appear here once customers place them'}
                        </p>
                    </div>
                )}

                {/* Footer */}
                {filteredOrders.length > 0 && (
                    <div className="p-4 border-t border-border bg-secondary/5">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{filteredOrders.length}</span> of <span className="font-bold text-foreground">{orders.length}</span> orders
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
