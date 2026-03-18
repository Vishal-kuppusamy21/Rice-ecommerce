import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Outlet } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import WishlistPage from "@/pages/WishlistPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import ProfilePage from "@/pages/ProfilePage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminOrderDetail from "@/pages/admin/AdminOrderDetail";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";
import ProductForm from "@/pages/admin/ProductForm";
import WholesalePage from "@/pages/WholesalePage";
import NotFound from "@/pages/NotFound";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import { ShippingPage, ReturnsPage, ReturnPolicyPage, FAQPage, PrivacyPage, TermsPage } from "@/pages/InfoPages";
import { useStore } from "@/store/useStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();


class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Global Error Caught:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
                    <h1 className="text-2xl font-bold mb-4 text-destructive">Something went wrong</h1>
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-w-full text-sm">
                        {this.state.error?.message}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const AppContent = () => {
    const { isAdmin, initializeApp } = useStore();
    const location = useLocation();
    const navigate = useNavigate();
    const isAdminRoute = location.pathname.startsWith('/admin');

    console.log("AppContent Rendering", { location: location.pathname, isAdmin });

    // Initialize app on mount
    React.useEffect(() => {
        console.log("Initializing App...");
        initializeApp().then(() => {
            console.log("App Initialized Successfully");
        }).catch(err => {
            console.error("Failed to initialize app:", err);
        });
    }, [initializeApp]);

    // Redirect admin to dashboard if trying to access public routes
    React.useEffect(() => {
        if (isAdmin && !location.pathname.startsWith('/admin')) {
            console.log("Redirecting Admin to /admin");
            navigate('/admin', { replace: true });
        }
    }, [isAdmin, location, navigate]);


    return (
        <div className="min-h-screen flex flex-col rice-pattern">
            <ScrollToTop />
            {!isAdminRoute && <Header />}
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                    <Route path="/product/:id" element={<ProtectedRoute><ProductDetailPage /></ProtectedRoute>} />
                    <Route path="/wholesale" element={<WholesalePage />} />

                    {/* User Protected Routes */}
                    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                    <Route path="/account/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
                    <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                    <Route path="/shipping" element={<ProtectedRoute><ShippingPage /></ProtectedRoute>} />
                    <Route path="/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
                    <Route path="/return-policy" element={<ProtectedRoute><ReturnPolicyPage /></ProtectedRoute>} />
                    <Route path="/faq" element={<ProtectedRoute><FAQPage /></ProtectedRoute>} />
                    <Route path="/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
                    <Route path="/terms" element={<ProtectedRoute><TermsPage /></ProtectedRoute>} />

                    {/* Admin Protected Routes */}
                    <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/products" element={<AdminProducts />} />
                        <Route path="/admin/categories" element={<AdminCategories />} />
                        <Route path="/admin/product-form" element={<ProductForm />} />
                        <Route path="/admin/products/edit/:id" element={<ProductForm />} />
                        <Route path="/admin/orders" element={<AdminOrders />} />
                        <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                        <Route path="/admin/customers" element={<AdminCustomers />} />
                        <Route path="/admin/payments" element={<AdminPayments />} />

                        <Route path="/admin/inventory" element={<AdminInventory />} />
                        <Route path="/admin/reports" element={<AdminReports />} />
                        <Route path="/admin/settings" element={<AdminSettings />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            {!isAdminRoute && <Footer />}
            <AuthModal />
        </div >
    );
};

const App = () => (
    <GlobalErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <AppContent />
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    </GlobalErrorBoundary>
);

export default App;

