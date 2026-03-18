import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    FileText,
    Settings,
    PackageCheck,
    LogOut,
    Tags,
    Menu,
    X,
    ChevronLeft,
    Users,
    CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useStore();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: Tags, label: 'Categories', path: '/admin/categories' },
        { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
        { icon: Users, label: 'Customers', path: '/admin/customers' },
        { icon: PackageCheck, label: 'Inventory', path: '/admin/inventory' },
        { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
        { icon: FileText, label: 'Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className={`p-4 ${collapsed ? 'px-3' : 'px-5'} border-b border-border/50`}>
                <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-sm flex-shrink-0">
                        <img src="/logo.png" alt="SK Logo" className="h-full w-full object-contain" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h3 className="font-serif font-bold text-sm leading-tight truncate">SHREE KUMARAVEL</h3>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Modern Rice Mill</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 py-4 ${collapsed ? 'px-2' : 'px-3'} space-y-1 overflow-y-auto`}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed ? item.label : undefined}
                            className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3.5'} py-2.5 rounded-xl transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                                    : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <item.icon className={`h-[18px] w-[18px] flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                            {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={`p-3 ${collapsed ? 'px-2' : 'px-3'} border-t border-border/50`}>
                {/* Collapse toggle - desktop only */}
                <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full mb-1.5 ${collapsed ? 'justify-center px-0' : 'justify-start gap-2'} text-muted-foreground hover:text-foreground hidden lg:flex`}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span className="text-xs font-medium">Collapse</span>}
                </Button>
                <Button
                    variant="ghost"
                    className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start gap-2.5'} text-destructive hover:text-destructive hover:bg-destructive/10 h-9`}
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span className="font-medium text-sm">Logout</span>}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute top-3 right-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <SidebarContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className={`hidden lg:block fixed inset-y-0 left-0 ${sidebarWidth} bg-card border-r border-border z-30 transition-all duration-300 ease-in-out`}>
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/50">
                    <div className="flex items-center justify-between h-14 px-4 lg:px-6">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 lg:hidden"
                                onClick={() => setMobileOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Welcome back{user ? `, ${(user as any).firstName || 'Admin'}` : ''}! 👋
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">
                                    {user ? ((user as any).firstName?.[0] || 'A').toUpperCase() : 'A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
