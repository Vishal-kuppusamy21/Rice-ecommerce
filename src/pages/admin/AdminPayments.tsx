import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    CreditCard,
    Search,
    CheckCircle,
    Check,
    Clock,
    XCircle,
    Banknote,
    TrendingUp,
    IndianRupee,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PAYMENT_TABS = [
    { label: 'All', value: 'all', icon: CreditCard },
    { label: 'Paid', value: 'paid', icon: CheckCircle },
    { label: 'COD Pending', value: 'cod_pending', icon: Banknote },
    { label: 'Failed / Unpaid', value: 'failed', icon: XCircle },
];

const getPaymentStatusStyle = (isPaid: boolean, method: string) => {
    if (isPaid) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (method === 'cod') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
};

const getPaymentStatusLabel = (isPaid: boolean, method: string, paymentStatus?: string) => {
    if (isPaid) return 'Paid';
    if (paymentStatus === 'failed') return 'Failed';
    if (method === 'cod') return 'COD Pending';
    return 'Unpaid';
};

const AdminPayments = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = async () => {
        if (!user || !(user as any).token) return;
        setLoading(true);
        try {
            const data = await api.getOrders((user as any).token);
            setOrders(data);
        } catch (error) {
            toast.error('Failed to fetch payment records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const handleMarkPaid = async (orderId: string) => {
        if (!user || !(user as any).token) return;
        try {
            await api.markOrderAsPaidAdmin(orderId, (user as any).token);
            toast.success("Order marked as Paid");
            fetchOrders();
        } catch (error: any) {
            toast.error(error.message || "Failed to update payment status");
        }
    };

    const filterByTab = (order: any) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'paid') return order.isPaid;
        if (activeTab === 'cod_pending') return !order.isPaid && order.paymentMethod === 'cod';
        if (activeTab === 'failed') return !order.isPaid && order.paymentMethod !== 'cod';
        return true;
    };

    const filtered = orders
        .filter(filterByTab)
        .filter((o) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                o._id?.toLowerCase().includes(q) ||
                o.user?.firstName?.toLowerCase().includes(q) ||
                o.user?.email?.toLowerCase().includes(q)
            );
        });

    // Stats
    const totalRevenue = orders.filter(o => o.isPaid).reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const codPendingCount = orders.filter(o => !o.isPaid && o.paymentMethod === 'cod').length;
    const codPendingTotal = orders.filter(o => !o.isPaid && o.paymentMethod === 'cod').reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const onlinePaidCount = orders.filter(o => o.isPaid && o.paymentMethod !== 'cod').length;

    const tabCounts = {
        all: orders.length,
        paid: orders.filter(o => o.isPaid).length,
        cod_pending: codPendingCount,
        failed: orders.filter(o => !o.isPaid && o.paymentMethod !== 'cod').length,
    };

    return (
        <div className="p-6 lg:p-8 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        Payment Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">{orders.length} total payment records</p>
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-lg">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <IndianRupee className="h-4 w-4" />
                            </div>
                        </div>
                        <p className="text-sm opacity-80 font-medium">Total Revenue Collected</p>
                        <p className="text-2xl font-extrabold mt-0.5">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Online Payments</span>
                    </div>
                    <p className="text-2xl font-extrabold">{onlinePaidCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">via Razorpay</p>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">COD Pending</span>
                    </div>
                    <p className="text-2xl font-extrabold">{codPendingCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">₹{codPendingTotal.toLocaleString()} pending collection</p>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Transactions</span>
                    </div>
                    <p className="text-2xl font-extrabold">{orders.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">All payment modes</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {PAYMENT_TABS.map((tab) => {
                    const count = tabCounts[tab.value as keyof typeof tabCounts] || 0;
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

            {/* Payments Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30">
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Status</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Status</th>
                                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50' : ''}>
                            {filtered.map((order) => {
                                const statusLabel = getPaymentStatusLabel(order.isPaid, order.paymentMethod, order.paymentStatus);
                                const statusStyle = getPaymentStatusStyle(order.isPaid, order.paymentMethod);
                                return (
                                    <tr key={order._id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="p-4">
                                            <span className="font-mono font-bold text-xs text-primary tracking-wider">
                                                #{order._id?.substring(order._id.length - 6).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-sm">{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</p>
                                                <p className="text-[11px] text-muted-foreground">{order.user?.email || ''}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={`text-[11px] font-semibold ${order.paymentMethod === 'cod'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Razorpay'}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-sm">₹{Number(order.totalPrice).toLocaleString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="text-[11px] font-semibold bg-secondary/50">
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={`text-[11px] font-semibold ${statusStyle}`}>
                                                {statusLabel}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                {!order.isPaid && order.paymentMethod === 'cod' && order.status !== 'Cancelled' && (
                                                    <Button
                                                        size="sm"
                                                        className="gap-1.5 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => handleMarkPaid(order._id)}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                        Mark Paid
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="gap-1.5 text-xs h-8 hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                >
                                                    View Order
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!loading && filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="h-7 w-7 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-semibold text-lg text-muted-foreground">No payment records found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery || activeTab !== 'all' ? 'Try adjusting your filters' : 'Payment records will appear here once orders are placed'}
                        </p>
                    </div>
                )}

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="p-4 border-t border-border bg-secondary/5">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{filtered.length}</span> of <span className="font-bold text-foreground">{orders.length}</span> records
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPayments;
