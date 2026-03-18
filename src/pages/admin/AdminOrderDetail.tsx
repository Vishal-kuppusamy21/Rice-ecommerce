import { useState, useEffect } from "react";
import Loader from "@/components/ui/loader";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft, Check, Truck, CreditCard, User, MapPin, Box,
    Clock, Package, XCircle, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";

const STATUS_STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Pending': return Clock;
        case 'Confirmed': return Check;
        case 'Shipped': return Truck;
        case 'Delivered': return Package;
        case 'Cancelled': return XCircle;
        default: return Clock;
    }
};

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

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        if (!id || !user || !(user as any).token) return;
        try {
            const data = await api.getOrderById(id, (user as any).token);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order", error);
            toast.error("Failed to load order details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchOrder();
    }, [id, user]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!order || !id) return;
        try {
            await api.updateOrderStatus(id, newStatus, (user as any).token);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrder();
        } catch (e: any) {
            toast.error(e.message || "Failed to update order");
        }
    };

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader size="lg" text="Loading order details..." />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Box className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <p className="text-muted-foreground mb-4">Order not found</p>
                <Button onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
            </div>
        );
    }

    const currentStepIndex = STATUS_STEPS.indexOf(order.status);
    const isCancelled = order.status === 'Cancelled';
    const StatusIcon = getStatusIcon(order.status);

    return (
        <div className="p-6 lg:p-8 bg-background min-h-screen">
            {/* Back button */}
            <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground -ml-2" onClick={() => navigate('/admin/orders')}>
                <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                            Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </h1>
                        <Badge variant="outline" className={`text-xs font-semibold ${getStatusStyle(order.status)}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {order.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="w-[200px]">
                    <Select value={order.status} onValueChange={(value) => handleStatusUpdate(value)}>
                        <SelectTrigger className="rounded-xl h-10">
                            <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Shipped">Shipped</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Status Timeline */}
            {!isCancelled && (
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between relative">
                        {/* Background line */}
                        <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
                        <div
                            className="absolute top-5 left-8 h-0.5 bg-primary transition-all duration-500"
                            style={{ width: `calc(${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}% - 64px)` }}
                        />

                        {STATUS_STEPS.map((step, i) => {
                            const isCompleted = currentStepIndex >= i;
                            const isCurrent = currentStepIndex === i;
                            const Icon = getStatusIcon(step);

                            return (
                                <div key={step} className="flex flex-col items-center relative z-10">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300
                                        ${isCompleted
                                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                                            : 'bg-card border-2 border-border text-muted-foreground'
                                        }
                                        ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                                    `}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                                        {step}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Cancelled Banner */}
            {isCancelled && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-red-800 text-sm">Order Cancelled</p>
                        <p className="text-xs text-red-600">This order has been cancelled.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-border flex items-center gap-2">
                            <Box className="h-4 w-4 text-muted-foreground" />
                            <h2 className="font-bold text-base">Order Items</h2>
                            <Badge variant="outline" className="ml-auto text-[10px]">{order.orderItems.length} items</Badge>
                        </div>
                        <div className="divide-y divide-border">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors">
                                    <div className="h-14 w-14 bg-muted rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-border">
                                        <img
                                            src={item.image?.startsWith('/') ? `http://localhost:5000${item.image}` : item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.qty} × ₹{item.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">₹{(item.qty * item.price).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Price Summary */}
                        <div className="p-5 bg-secondary/20 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Items Price</span>
                                <span className="font-medium">₹{order.itemsPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium">₹{order.taxPrice}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-medium">₹{order.shippingPrice}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-3 border-t border-border mt-2">
                                <span>Total</span>
                                <span className="text-primary">₹{Number(order.totalPrice).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Customer */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-sm">Customer</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary">
                                    {((order.user as any).firstName?.[0] || '?').toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{(order.user as any).firstName} {(order.user as any).lastName}</p>
                                <p className="text-xs text-muted-foreground">{(order.user as any).email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-sm">Shipping Address</h3>
                        </div>
                        <div className="text-sm space-y-1 text-muted-foreground">
                            <p className="text-foreground font-medium">{order.shippingAddress.addressLine1}</p>
                            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            <p>{order.shippingAddress.phone}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                            <Badge variant="outline" className={`text-[11px] font-semibold ${order.isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {order.isDelivered ? "✓ Delivered" : "⏳ Not Delivered"}
                            </Badge>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-emerald-600" />
                            </div>
                            <h3 className="font-bold text-sm">Payment</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Method</span>
                                    <span className="text-sm font-medium">{order.paymentMethod}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant="outline" className={`text-[11px] font-semibold ${order.isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {order.isPaid ? "✓ Paid" : "✗ Not Paid"}
                                    </Badge>
                                </div>
                                {order.isPaid && order.paidAt && (
                                    <p className="text-[11px] text-muted-foreground pt-1">
                                        Paid on {new Date(order.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                )}
                            </div>

                            {/* Mark as Paid Button for COD */}
                            {!order.isPaid && order.paymentMethod === 'cod' && order.status !== 'Cancelled' && (
                                <Button 
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl h-10 shadow-sm"
                                    onClick={async () => {
                                        try {
                                            await api.markOrderAsPaidAdmin(order._id, (user as any).token);
                                            toast.success("Order marked as Paid");
                                            fetchOrder();
                                        } catch (error: any) {
                                            toast.error(error.message || "Failed to update payment status");
                                        }
                                    }}
                                >
                                    <Check className="h-4 w-4" />
                                    Mark as Paid
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
