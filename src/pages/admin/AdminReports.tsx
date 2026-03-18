import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Download, Printer, FileText, Calendar, Users, ShoppingBag,
    TrendingUp, IndianRupee, BarChart2, Package, ArrowUpRight,
    ArrowDownRight, Filter, RefreshCw, Receipt
} from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

// --------------- Custom Tooltip ---------------
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                {payload.map((entry: any, i: number) => (
                    <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
                        {entry.name}: {entry.name?.includes('₹') || entry.dataKey?.toLowerCase().includes('sale') || entry.dataKey?.toLowerCase().includes('revenue') || entry.dataKey?.toLowerCase().includes('spent') ? `₹${Number(entry.value).toLocaleString()}` : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --------------- KPI Card ---------------
const KpiCard = ({
    title, value, icon: Icon, color, sub, trend
}: {
    title: string; value: string | number; icon: any; color: string; sub?: string; trend?: 'up' | 'down';
}) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group`}>
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color}`} />
        <div className="flex items-start justify-between">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color} bg-opacity-15`}>
                <Icon className="h-5 w-5 text-current" />
            </div>
            {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    Live
                </span>
            )}
        </div>
        <p className="text-sm text-muted-foreground font-medium mt-4">{title}</p>
        <p className="text-2xl font-extrabold text-foreground mt-0.5 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
);

// --------------- Section Header ---------------
const SectionHeader = ({ title, desc, onExport, onRefresh }: { title: string; desc?: string; onExport?: () => void; onRefresh?: () => void; }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{title}</h2>
            {desc && <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>}
        </div>
        <div className="flex items-center gap-2">
            {onRefresh && (
                <Button variant="ghost" size="sm" onClick={onRefresh} className="gap-2 text-xs">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
            )}
            {onExport && (
                <Button variant="outline" size="sm" onClick={onExport} className="gap-2 text-xs">
                    <Download className="h-3.5 w-3.5" /> Export Excel
                </Button>
            )}
        </div>
    </div>
);

// --------------- DataTable ---------------
const DataTable = ({ columns, rows }: { columns: { label: string; align?: string }[]; rows: React.ReactNode[][] }) => (
    <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-secondary/50 border-b border-border">
                        {columns.map((col, i) => (
                            <th key={i} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
                                No data available
                            </td>
                        </tr>
                    ) : rows.map((row, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className={`px-4 py-3.5 text-sm ${columns[j]?.align === 'right' ? 'text-right' : ''}`}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// --------------- CHART COLORS ---------------
const CHART_COLORS = ['#c2622a', '#4f9e6f', '#5b8dd9', '#e8a940', '#9b59b6'];

// ================================================================
//  Main Component
// ================================================================
const AdminReports = () => {
    const { user } = useStore();
    const [salesData, setSalesData] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [productData, setProductData] = useState<any[]>([]);
    const [userData, setUserData] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (user && (user as any).token) fetchAllReports();
    }, [user]);

    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const token = (user as any).token;
            const [sales, monthly, products, users, allOrders] = await Promise.all([
                api.getSalesReport(token, startDate, endDate),
                api.getMonthlyReport(token),
                api.getProductPerformanceReport(token),
                api.getUserPurchaseReport(token),
                api.getOrders(token)
            ]);
            setSalesData(sales);
            setMonthlyData(monthly);
            setProductData(products);
            setUserData(users);
            setOrders(allOrders.filter((o: any) => o.isPaid));
        } catch {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const handleDateFilter = async () => {
        if (!user || !(user as any).token) return;
        try {
            const data = await api.getSalesReport((user as any).token, startDate, endDate);
            setSalesData(data);
            toast.success("Filter applied");
        } catch {
            toast.error("Failed to filter sales");
        }
    };

    const downloadExcel = (data: any[], fileName: string) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        toast.success(`${fileName}.xlsx downloaded`);
    };

    const printInvoice = (order: any) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${order._id}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; background: #fff; }
              .header { text-align: center; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
              .header h1 { font-size: 28px; font-weight: 800; color: #9a3412; letter-spacing: -0.5px; }
              .header p { color: #6b7280; margin-top: 4px; font-size: 14px; }
              .badge { display: inline-block; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 99px; border: 1px solid #fde68a; margin-top: 8px; }
              .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
              .meta-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
              .meta-box h3 { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
              .meta-box p { font-size: 14px; color: #111827; margin-bottom: 4px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
              th { background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
              td { border: 1px solid #e5e7eb; padding: 10px 14px; font-size: 14px; }
              .total-row td { font-weight: 700; background: #fff7ed; font-size: 15px; }
              .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>INVOICE</h1>
              <p>Shree Kumaravel Premium Rice</p>
              <span class="badge">PAID</span>
            </div>
            <div class="meta">
              <div class="meta-box">
                <h3>Invoice Details</h3>
                <p><strong>Order ID:</strong> #${order._id.substring(order._id.length - 8).toUpperCase()}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div class="meta-box">
                <h3>Customer</h3>
                <p>${order.user?.firstName || ''} ${order.user?.lastName || ''}</p>
                <p>${order.user?.email || ''}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:center">Qty</th>
                  <th style="text-align:right">Unit Price</th>
                  <th style="text-align:right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map((item: any) => `
                  <tr>
                    <td>${item.name}</td>
                    <td style="text-align:center">${item.qty}</td>
                    <td style="text-align:right">₹${item.price}</td>
                    <td style="text-align:right">₹${item.qty * item.price}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="3" style="text-align:right">Grand Total</td>
                  <td style="text-align:right">₹${order.totalPrice}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">Thank you for your business! · Shree Kumaravel Modern Rice Mill</div>
            <script>window.print();</script>
          </body>
        </html>
      `);
            printWindow.document.close();
        }
    };

    // ---- Summary KPIs ----
    const totalRevenue = salesData.reduce((s, d) => s + (d.totalSales || 0), 0);
    const totalOrders = salesData.reduce((s, d) => s + (d.orderCount || 0), 0);
    const topProduct = productData[0]?.productName || '—';
    const totalUsers = userData.length;

    if (loading && salesData.length === 0) {
        return (
            <div className="p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-muted-foreground font-medium">Loading reports…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 bg-background min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                            <BarChart2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        Reports & Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Track sales performance, product insights, and customer activity</p>
                </div>
                <Button onClick={fetchAllReports} variant="outline" className="gap-2 self-start sm:self-auto" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh All
                </Button>
            </div>

            {/* KPI Summary Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    icon={IndianRupee}
                    color="bg-primary text-primary"
                    trend="up"
                />
                <KpiCard
                    title="Total Orders"
                    value={totalOrders}
                    icon={ShoppingBag}
                    color="bg-blue-500 text-blue-600"
                    sub="Paid orders"
                />
                <KpiCard
                    title="Top Product"
                    value={topProduct}
                    icon={Package}
                    color="bg-emerald-500 text-emerald-600"
                    sub="By revenue"
                />
                <KpiCard
                    title="Active Customers"
                    value={totalUsers}
                    icon={Users}
                    color="bg-violet-500 text-violet-600"
                    sub="With purchases"
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="sales" className="space-y-6">
                <TabsList className="bg-card border border-border p-1 rounded-xl gap-1 h-auto flex-wrap">
                    {[
                        { value: 'sales', label: 'Daily Sales', icon: TrendingUp },
                        { value: 'monthly', label: 'Monthly', icon: Calendar },
                        { value: 'products', label: 'Products', icon: Package },
                        { value: 'users', label: 'Customers', icon: Users },
                        { value: 'bills', label: 'Bills', icon: Receipt },
                    ].map(({ value, label, icon: Icon }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className="gap-1.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4 py-2"
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* ── DAILY SALES ── */}
                <TabsContent value="sales" className="space-y-6 animate-fade-in">
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="pt-6">
                            <SectionHeader
                                title="Daily Transactions"
                                desc="Revenue and order volume by day"
                                onExport={() => downloadExcel(salesData, 'daily_sales')}
                                onRefresh={fetchAllReports}
                            />

                            {/* Date Filter */}
                            <div className="flex flex-wrap gap-3 items-end mb-6 p-4 bg-secondary/40 rounded-xl border border-border">
                                <Filter className="h-4 w-4 text-muted-foreground mt-auto mb-1.5" />
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">From</label>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm w-40" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wide">To</label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-sm w-40" />
                                </div>
                                <Button onClick={handleDateFilter} size="sm" className="h-9">Apply Filter</Button>
                                {startDate && (
                                    <Button variant="ghost" size="sm" className="h-9" onClick={() => { setStartDate(""); setEndDate(""); fetchAllReports(); }}>
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Bar Chart */}
                            <div className="h-[280px] mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData} barSize={28}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="hsl(18 64% 38%)" stopOpacity={1} />
                                                <stop offset="100%" stopColor="hsl(18 64% 38%)" stopOpacity={0.5} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(25 15% 88%)" vertical={false} />
                                        <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={60} tickFormatter={v => `₹${v}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="totalSales" fill="url(#barGrad)" name="Revenue (₹)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <DataTable
                                columns={[{ label: 'Date' }, { label: 'Orders' }, { label: 'Revenue', align: 'right' }]}
                                rows={salesData.map(d => [
                                    <span className="font-medium">{d._id}</span>,
                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">{d.orderCount}</Badge>,
                                    <span className="font-bold text-primary">₹{Number(d.totalSales).toLocaleString()}</span>
                                ])}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── MONTHLY ── */}
                <TabsContent value="monthly" className="animate-fade-in">
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="pt-6">
                            <SectionHeader
                                title="Monthly Transactions"
                                desc="Revenue trend over months"
                                onExport={() => downloadExcel(monthlyData, 'monthly_sales')}
                                onRefresh={fetchAllReports}
                            />

                            <div className="h-[280px] mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(18 64% 38%)" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="hsl(18 64% 38%)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(25 15% 88%)" vertical={false} />
                                        <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={60} tickFormatter={v => `₹${v}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="totalSales" stroke="hsl(18 64% 38%)" strokeWidth={2.5} fill="url(#areaGrad)" name="Revenue (₹)" dot={{ r: 4, fill: 'hsl(18 64% 38%)' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <DataTable
                                columns={[{ label: 'Month' }, { label: 'Orders' }, { label: 'Revenue', align: 'right' }]}
                                rows={monthlyData.map(m => [
                                    <span className="font-semibold">{m._id}</span>,
                                    <span>{m.totalOrders}</span>,
                                    <span className="font-bold text-primary">₹{Number(m.totalSales).toLocaleString()}</span>
                                ])}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── PRODUCTS ── */}
                <TabsContent value="products" className="animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Bar chart */}
                        <Card className="lg:col-span-3 rounded-2xl border-border shadow-sm">
                            <CardContent className="pt-6">
                                <SectionHeader
                                    title="Product Performance"
                                    desc="Units sold & revenue per product"
                                    onExport={() => downloadExcel(productData, 'product_performance')}
                                />
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={productData.slice(0, 8)} layout="vertical" barSize={16}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(25 15% 88%)" horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                                            <YAxis type="category" dataKey="productName" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={100} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="totalRevenue" name="Revenue (₹)" fill="hsl(18 64% 38%)" radius={[0, 6, 6, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pie chart */}
                        <Card className="lg:col-span-2 rounded-2xl border-border shadow-sm">
                            <CardContent className="pt-6">
                                <SectionHeader title="Revenue Share" />
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={productData.slice(0, 5)}
                                                dataKey="totalRevenue"
                                                nameKey="productName"
                                                cx="50%" cy="50%"
                                                innerRadius={60} outerRadius={90}
                                                paddingAngle={3}
                                            >
                                                {productData.slice(0, 5).map((_: any, i: number) => (
                                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card className="lg:col-span-5 rounded-2xl border-border shadow-sm">
                            <CardContent className="pt-6">
                                <DataTable
                                    columns={[{ label: 'Product' }, { label: 'Units Sold' }, { label: 'Revenue', align: 'right' }]}
                                    rows={productData.map((p, i) => [
                                        <div className="flex items-center gap-3">
                                            <span className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>#{i + 1}</span>
                                            <span className="font-semibold">{p.productName}</span>
                                        </div>,
                                        <Badge variant="outline" className="bg-secondary text-secondary-foreground text-xs">{p.totalQuantitySold} units</Badge>,
                                        <span className="font-bold text-primary">₹{Number(p.totalRevenue).toLocaleString()}</span>
                                    ])}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── CUSTOMERS ── */}
                <TabsContent value="users" className="animate-fade-in">
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="pt-6">
                            <SectionHeader
                                title="Customer Insights"
                                desc="Purchase activity per customer"
                                onExport={() => downloadExcel(userData, 'user_report')}
                                onRefresh={fetchAllReports}
                            />
                            <DataTable
                                columns={[
                                    { label: 'Customer' },
                                    { label: 'Email' },
                                    { label: 'Orders' },
                                    { label: 'Last Purchase' },
                                    { label: 'Total Spent', align: 'right' }
                                ]}
                                rows={userData.map((u) => [
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {(u.user?.firstName?.[0] || '?').toUpperCase()}
                                        </div>
                                        <span className="font-semibold">{u.user?.firstName} {u.user?.lastName}</span>
                                    </div>,
                                    <span className="text-muted-foreground text-xs">{u.user?.email}</span>,
                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">{u.orderCount}</Badge>,
                                    <span className="text-muted-foreground text-xs">{new Date(u.lastOrderDate).toLocaleDateString('en-IN')}</span>,
                                    <span className="font-bold text-primary">₹{Number(u.totalSpent).toLocaleString()}</span>
                                ])}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── BILLS ── */}
                <TabsContent value="bills" className="animate-fade-in">
                    <Card className="rounded-2xl border-border shadow-sm">
                        <CardContent className="pt-6">
                            <SectionHeader
                                title="Bills & Invoices"
                                desc="Generate and print bills for completed orders"
                                onExport={() => downloadExcel(orders.map(o => ({
                                    OrderID: o._id,
                                    Customer: `${o.user?.firstName} ${o.user?.lastName}`,
                                    Email: o.user?.email,
                                    Date: new Date(o.createdAt).toLocaleDateString(),
                                    Amount: o.totalPrice
                                })), 'invoices')}
                            />
                            <DataTable
                                columns={[
                                    { label: 'Invoice #' },
                                    { label: 'Date' },
                                    { label: 'Customer' },
                                    { label: 'Amount' },
                                    { label: 'Status' },
                                    { label: 'Action', align: 'right' }
                                ]}
                                rows={orders.map((order) => [
                                    <span className="font-mono font-bold text-xs tracking-widest text-primary">
                                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                                    </span>,
                                    <span className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>,
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {(order.user?.firstName?.[0] || '?').toUpperCase()}
                                        </div>
                                        <span className="font-medium text-sm">{order.user?.firstName} {order.user?.lastName}</span>
                                    </div>,
                                    <span className="font-bold">₹{Number(order.totalPrice).toLocaleString()}</span>,
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs font-semibold">Paid</Badge>,
                                    <Button size="sm" variant="outline" onClick={() => printInvoice(order)} className="gap-1.5 text-xs h-8">
                                        <Printer className="h-3.5 w-3.5" /> Print
                                    </Button>
                                ])}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminReports;
