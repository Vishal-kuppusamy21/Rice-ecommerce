import { useState, useEffect } from 'react';
import { getImageUrl, cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';

const OrdersPage = () => {
    const { user, isAuthenticated } = useStore();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                if (user && (user as any).token) {
                    const data = await api.getMyOrders((user as any).token);
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, user, navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen container-custom py-12 flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                    <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold mb-2">{t('orders.no_orders')}</h1>
                <p className="text-muted-foreground mb-6">{t('orders.no_orders_desc')}</p>
                <Link to="/products">
                    <Button>{t('orders.start_shopping')}</Button>
                </Link>
            </div>
        );
    }

    const handleCancelOrder = async (orderId: string) => {
        try {
            if (user && (user as any).token) {
                await api.cancelOrder(orderId, (user as any).token);
                // Refresh orders
                const data = await api.getMyOrders((user as any).token);
                setOrders(data);
                toast.success(t('orders.cancel_success'));
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container-custom">
                <h1 className="font-serif text-3xl font-bold mb-8">{t('orders.title')}</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                            {/* Order Header */}
                            <div className="bg-muted/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-bold text-foreground">
                                            {t('orders.order_id')} <span className="uppercase text-primary">#{order._id.substring(order._id.length - 8)}</span>
                                        </p>
                                        <Badge variant={
                                            order.status === 'Delivered' ? 'default' :
                                                order.status === 'Cancelled' ? 'destructive' :
                                                    'secondary'
                                        } className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold shadow-sm">
                                            {t(`orders.status.${order.status.toLowerCase()}`, { defaultValue: order.status }) as string}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {t('orders.placed_on')} {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div className="text-left sm:text-right bg-white p-3 rounded-xl border border-border/40 shadow-sm">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Order Total</p>
                                    <p className="font-black text-xl text-primary">₹{order.totalPrice}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Order Items */}
                                <div className="space-y-5">
                                    {order.orderItems.map((item: any) => (
                                        <div key={item._id} className="flex items-center gap-4 bg-muted/10 p-4 rounded-xl border border-border/30">
                                            <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 border border-border/50 shadow-sm">
                                                <img src={getImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-foreground line-clamp-1 mb-1">
                                                    {item.product ? getLocalizedContent(item.product, 'name', i18n.language) : item.name}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md text-xs">
                                                        {item.weight || item.unit}
                                                    </span>
                                                    <span className="text-muted-foreground font-medium">
                                                        {t('orders.qty')} {item.qty} × ₹{item.price}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="font-black text-foreground text-right pl-4">
                                                ₹{item.price * item.qty}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary & Payment Info */}
                                <div className="mt-5 bg-muted/5 rounded-xl border border-border/40 p-5 flex flex-col sm:flex-row justify-between gap-6">
                                    <div className="flex-1 w-full">
                                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Payment Information
                                        </h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between sm:justify-start sm:gap-12">
                                                <span className="text-sm text-foreground/80 font-medium w-16">Method</span>
                                                <span className="text-sm font-bold text-foreground">
                                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between sm:justify-start sm:gap-12">
                                                <span className="text-sm text-foreground/80 font-medium w-16">Status</span>
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    order.isPaid ? "text-green-600" : "text-warning"
                                                )}>
                                                    {order.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full sm:w-64 space-y-2.5 bg-white p-4 rounded-xl border border-border/30 shadow-sm relative">
                                        {/* Decorative dashed border on left */}
                                        <div className="hidden sm:block absolute -left-6 top-4 bottom-4 w-px border-l-2 border-dashed border-border/60"></div>

                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Subtotal</span>
                                            <span className="font-semibold text-foreground">
                                                ₹{order.orderItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground font-medium">Delivery Fee</span>
                                            <span className="font-semibold text-foreground">
                                                {order.shippingPrice === 0 ? (
                                                    <span className="text-green-600 font-bold">Free</span>
                                                ) : (
                                                    `₹${order.shippingPrice || 0}`
                                                )}
                                            </span>
                                        </div>
                                        <div className="pt-3 mt-1 border-t border-border/50 flex justify-between items-center">
                                            <span className="font-bold text-foreground">Total</span>
                                            <span className="font-black text-xl text-primary">₹{order.totalPrice}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Footer */}
                                <div className="mt-6 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="bg-muted/20 p-4 rounded-xl flex-1 w-full border border-border/30">
                                        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                            <Truck className="h-3.5 w-3.5" />
                                            {t('orders.shipping_details')}
                                        </p>
                                        <p className="font-semibold text-foreground">{order.shippingAddress.addressLine1}</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {order.shippingAddress.city}, {order.shippingAddress.state} - <span className="font-medium text-foreground">{order.shippingAddress.pincode}</span>
                                        </p>
                                        {order.shippingAddress.phone && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                📞 {order.shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        {(order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'confirmed') && (
                                            <Button
                                                variant="outline"
                                                className="border-destructive/20 text-destructive hover:bg-destructive hover:text-white flex-1 md:flex-none shadow-sm transition-all"
                                                onClick={() => handleCancelOrder(order._id)}
                                            >
                                                {t('orders.cancel_order')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersPage;
