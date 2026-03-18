import React, { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    PackageCheck,
    Plus,
    Package,
    AlertTriangle,
    Layers,
    Warehouse,
    History,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingCart,
    RotateCcw
} from "lucide-react";

const reasonIcon: Record<string, React.ReactNode> = {
    "Restock": <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />,
    "Manual Adjustment": <ArrowDownRight className="h-3.5 w-3.5 text-amber-600" />,
    "Order Placed": <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />,
    "Order Cancelled": <RotateCcw className="h-3.5 w-3.5 text-purple-600" />,
};

const reasonColors: Record<string, string> = {
    "Restock": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Manual Adjustment": "bg-amber-50 text-amber-700 border-amber-200",
    "Order Placed": "bg-blue-50 text-blue-700 border-blue-200",
    "Order Cancelled": "bg-purple-50 text-purple-700 border-purple-200",
};

const AdminInventory = () => {
    const { user, products, fetchProducts } = useStore();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStockBags: 0,
        lowStockProducts: 0
    });
    const [formData, setFormData] = useState({
        productId: "",
        bagSize: "",
        quantity: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsData = await api.getInventoryStats((user as any).token);
            setStats(statsData);
            await fetchProducts();
        } catch (error) {
            toast.error("Failed to fetch inventory data");
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await api.getStockHistory((user as any).token);
            setHistory(data);
        } catch {
            toast.error("Failed to fetch stock history");
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchHistory();
    }, []);

    const selectedProduct = products.find(p => p.id === formData.productId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productId || !formData.bagSize || !formData.quantity) {
            toast.error("Please fill all fields");
            return;
        }

        setSubmitting(true);
        try {
            await api.addStockEntry({
                productId: formData.productId,
                bagSize: formData.bagSize,
                quantity: Number(formData.quantity)
            }, (user as any).token);

            toast.success("Stock updated successfully");
            setFormData({ productId: "", bagSize: "", quantity: "" });
            fetchData();
            fetchHistory();
        } catch (error: any) {
            toast.error(error.message || "Failed to update stock");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 bg-background min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
                            <Warehouse className="h-5 w-5 text-white" />
                        </div>
                        Inventory Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Monitor and manage your rice stock levels</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                            <p className="text-2xl font-black">{stats.totalProducts}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Layers className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Stock Bags</p>
                            <p className="text-2xl font-black">{stats.totalStockBags} Bags</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Low Stock Alert</p>
                            <p className="text-2xl font-black text-destructive">{stats.lowStockProducts} Items</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Current Stock Table */}
                <div className="xl:col-span-2">
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-border bg-secondary/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PackageCheck className="h-5 w-5 text-primary" />
                                <h2 className="font-bold text-lg">Current Stock Levels</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-secondary/5">
                                        <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Rice Type</th>
                                        <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Bag Size</th>
                                        <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Available Stock</th>
                                        <th className="p-4 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <React.Fragment key={product.id}>
                                            {product.availableWeights?.map((weight, idx) => (
                                                <tr key={`${product.id}-${weight.weight}`} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                                                    {idx === 0 && (
                                                        <td className="p-4 align-top" rowSpan={product.availableWeights.length}>
                                                            <span className="font-bold text-sm">{product.name}</span>
                                                        </td>
                                                    )}
                                                    <td className="p-4 text-sm font-medium text-muted-foreground">{weight.weight}</td>
                                                    <td className="p-4 text-sm font-black text-foreground">{weight.stock || 0} Bags</td>
                                                    <td className="p-4 text-center">
                                                        {(weight.stock || 0) <= 0 ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">Out of Stock</span>
                                                        ) : (weight.stock || 0) < (product.lowStockThreshold || 10) ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">Low Stock</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">In Stock</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!product.availableWeights || product.availableWeights.length === 0) && (
                                                <tr className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                                                    <td className="p-4 font-bold text-sm">{product.name}</td>
                                                    <td className="p-4 text-sm text-muted-foreground italic">No sizes set</td>
                                                    <td className="p-4 text-sm font-black">{product.quantity} Units</td>
                                                    <td className="p-4 text-center">
                                                        {product.quantity <= 0 ? (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">Out of Stock</span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">In Stock</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Stock Update Form */}
                <div className="xl:col-span-1">
                    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden sticky top-6">
                        <div className="p-6 border-b border-border bg-primary/5">
                            <div className="flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                <h2 className="font-bold text-lg">Quick Stock Update</h2>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Directly adjust inventory levels per bag size</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Select Product</Label>
                                    <Select
                                        value={formData.productId}
                                        onValueChange={(val) => {
                                            setFormData({ ...formData, productId: val, bagSize: "" });
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 border-border/60 bg-transparent">
                                            <SelectValue placeholder="Choose a product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Bag Size</Label>
                                    <Select
                                        value={formData.bagSize}
                                        onValueChange={(val) => setFormData({ ...formData, bagSize: val })}
                                        disabled={!formData.productId}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 border-border/60 bg-transparent">
                                            <SelectValue placeholder={formData.productId ? "Select bag size" : "Pick product first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedProduct?.availableWeights?.map((w) => (
                                                <SelectItem key={w.weight} value={w.weight}>{w.weight}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Update Quantity (Bags)</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Example: 50 or -10"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                            className="rounded-xl h-12 border-border/60 pl-4 font-black text-lg"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                            BAGS
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground italic mt-2 px-1">
                                        TIP: Enter a positive value to add stock, or negative to subtract.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl gap-2 shadow-glow font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={submitting || !formData.bagSize || !formData.quantity}
                                >
                                    {submitting ? (
                                        <>Updating...</>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5" />
                                            Update Inventory
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock History */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-secondary/10 flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-lg">Stock History</h2>
                    <span className="ml-auto text-xs text-muted-foreground">Last 100 entries</span>
                </div>
                <div className="overflow-x-auto">
                    {historyLoading ? (
                        <div className="p-12 text-center text-muted-foreground text-sm">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground text-sm">No stock history yet. History will appear here once you update stock or orders are placed.</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/5">
                                    <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Date & Time</th>
                                    <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Product</th>
                                    <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Bag Size</th>
                                    <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Change</th>
                                    <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">New Stock</th>
                                    <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Reason</th>
                                    <th className="text-left p-4 text-xs font-black text-muted-foreground uppercase tracking-widest">Updated By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((entry) => (
                                    <tr key={entry._id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                                        <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                                            {format(new Date(entry.createdAt), "dd MMM yyyy, hh:mm a")}
                                        </td>
                                        <td className="p-4 text-sm font-semibold">{entry.productName}</td>
                                        <td className="p-4 text-sm text-muted-foreground">{entry.bagSize}</td>
                                        <td className="p-4">
                                            <span className={`font-black text-sm ${entry.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange} Bags
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-bold">{entry.newStock} Bags</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${reasonColors[entry.reason] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                {reasonIcon[entry.reason]}
                                                {entry.reason}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{entry.performedBy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;
