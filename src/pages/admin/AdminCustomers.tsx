import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Users,
    Search,
    MapPin,
    ShoppingBag,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
    Calendar,
    UserCircle,
} from 'lucide-react';

const AdminCustomers = () => {
    const { user } = useStore();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            if (!user || !(user as any).token) return;
            setLoading(true);
            try {
                const data = await api.getCustomers((user as any).token);
                setCustomers(data);
            } catch (error) {
                toast.error('Failed to fetch customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [user]);

    const filtered = customers.filter((c) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.firstName?.toLowerCase().includes(q) ||
            c.lastName?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phoneNumber?.toLowerCase().includes(q)
        );
    });

    const totalOrders = customers.reduce((sum, c) => sum + (c.orderCount || 0), 0);
    const activeCustomers = customers.filter((c) => (c.orderCount || 0) > 0).length;

    return (
        <div className="p-6 lg:p-8 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        Customer Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">{customers.length} registered customers</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 text-sm rounded-xl"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Customers</span>
                    </div>
                    <p className="text-3xl font-extrabold">{customers.length}</p>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Customers Who Ordered</span>
                    </div>
                    <p className="text-3xl font-extrabold">{activeCustomers}</p>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Total Orders Placed</span>
                    </div>
                    <p className="text-3xl font-extrabold">{totalOrders}</p>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/30">
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Addresses</th>
                                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50' : ''}>
                            {filtered.map((customer) => {
                                const isExpanded = expandedId === customer._id;
                                const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown';
                                const initials = (customer.firstName?.[0] || '?').toUpperCase();
                                return (
                                    <>
                                        <tr
                                            key={customer._id}
                                            className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs font-bold text-violet-700">{initials}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{fullName}</p>
                                                        <p className="text-[11px] text-muted-foreground font-mono">{customer._id?.slice(-8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{customer.email || '—'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{customer.phoneNumber || '—'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>
                                                        {customer.createdAt
                                                            ? new Date(customer.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                            : '—'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="text-xs font-semibold bg-secondary/50">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {customer.addresses?.length || 0} saved
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="gap-1.5 text-xs h-8 hover:bg-violet-50 hover:text-violet-700"
                                                        onClick={() => setExpandedId(isExpanded ? null : customer._id)}
                                                    >
                                                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                        {isExpanded ? 'Hide' : 'View'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Detail Row */}
                                        {isExpanded && (
                                            <tr key={`${customer._id}-expanded`} className="border-b border-border/50 bg-secondary/10">
                                                <td colSpan={5} className="p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Addresses */}
                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                                                <MapPin className="h-3.5 w-3.5" /> Saved Addresses
                                                            </h4>
                                                            {customer.addresses && customer.addresses.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {customer.addresses.map((addr: any, idx: number) => (
                                                                        <div key={idx} className="bg-card rounded-xl border border-border p-3 text-xs">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <Badge variant="outline" className="text-[9px] font-bold uppercase">{addr.type || 'Address'}</Badge>
                                                                                {addr.isDefault && <Badge className="text-[9px] font-bold bg-primary/10 text-primary border-primary/20">Default</Badge>}
                                                                            </div>
                                                                            <p className="font-medium text-foreground">{addr.street}</p>
                                                                            <p className="text-muted-foreground">{addr.city}, {addr.state} - {addr.postalCode}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-muted-foreground italic">No saved addresses.</p>
                                                            )}
                                                        </div>

                                                        {/* Account Info */}
                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                                                                <UserCircle className="h-3.5 w-3.5" /> Account Info
                                                            </h4>
                                                            <div className="bg-card rounded-xl border border-border p-3 space-y-2 text-xs">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-muted-foreground font-medium">Full Name</span>
                                                                    <span className="font-semibold">{fullName}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-muted-foreground font-medium">Email</span>
                                                                    <span className="font-semibold">{customer.email}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-muted-foreground font-medium">Phone</span>
                                                                    <span className="font-semibold">{customer.phoneNumber || '—'}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-muted-foreground font-medium">Role</span>
                                                                    <Badge variant="outline" className="text-[9px] font-bold uppercase">{customer.role || 'user'}</Badge>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-muted-foreground font-medium">Cart Items</span>
                                                                    <span className="font-semibold">{customer.cart?.length || 0}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-muted-foreground font-medium">Wishlist Items</span>
                                                                    <span className="font-semibold">{customer.wishlist?.length || 0}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {!loading && filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-7 w-7 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-semibold text-lg text-muted-foreground">No customers found</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery ? 'Try adjusting your search' : 'Customers will appear here once they register'}
                        </p>
                    </div>
                )}

                {/* Footer */}
                {filtered.length > 0 && (
                    <div className="p-4 border-t border-border bg-secondary/5">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{filtered.length}</span> of <span className="font-bold text-foreground">{customers.length}</span> customers
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCustomers;
