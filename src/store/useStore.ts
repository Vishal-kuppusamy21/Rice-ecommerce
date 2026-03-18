import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserAddress, Product, CartItem, WishlistItem, Category, Order, FilterState, SortOption } from '@/types';
import { api } from '@/lib/api';

interface StoreState {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Products
    products: Product[];
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    // Cart
    cart: CartItem[];

    // Wishlist
    wishlist: WishlistItem[];

    // Orders
    orders: Order[];

    // UI State
    isAuthModalOpen: boolean;
    authModalTab: 'login' | 'signup';
    searchQuery: string;
    filters: FilterState;
    sortBy: SortOption;
    page: number;
    pages: number;
    setPage: (page: number) => void;

    // Buy Now
    buyNowItem: CartItem | null;
    setBuyNowItem: (product: Product, quantity: number, selectedWeight?: string) => void;
    clearBuyNowItem: () => void;

    // Actions
    checkAuth: () => Promise<void>;
    initializeApp: () => Promise<void>;

    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    updateUserProfile: (userData: any) => Promise<void>;
    logout: () => void;

    fetchProducts: () => Promise<void>;
    fetchCategories: () => Promise<void>;

    addToCart: (product: Product, quantity: number, selectedWeight?: string) => void;
    updateCartQuantity: (cartItemId: string, quantity: number) => void;
    removeFromCart: (cartItemId: string) => void;
    clearCart: () => void;

    addToWishlist: (product: Product) => void;
    removeFromWishlist: (wishlistItemId: string) => void;
    addToCartFromWishlist: (wishlistItemId: string, selectedWeight?: string) => void;
    clearWishlist: () => void;

    addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
    updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    setAuthModalOpen: (open: boolean) => void;
    setAuthModalTab: (tab: 'login' | 'signup') => void;
    setSearchQuery: (query: string) => void;
    setFilters: (filters: Partial<FilterState>) => void;
    setSortBy: (sort: SortOption) => void;

    addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;

    addCategory: (category: any) => Promise<void>;
    updateCategory: (id: string, category: any) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    sendBulkEnquiry: (enquiryData: any) => Promise<void>;

    addAddress: (addressData: Partial<UserAddress>) => Promise<void>;
    updateAddress: (id: string, addressData: Partial<UserAddress>) => Promise<void>;
    deleteAddress: (id: string) => Promise<void>;
    setDefaultAddress: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            products: [], // Empty initially, fetched via API
            categories: [], // Empty initially
            isLoading: false,
            error: null,
            cart: [],
            wishlist: [],
            orders: [],
            isAuthModalOpen: false,
            authModalTab: 'login',
            searchQuery: '',
            filters: {
                categories: [],
                subcategories: [],
                priceRange: [0, 5000],
            },
            sortBy: 'newest',
            page: 1,
            pages: 1,
            buyNowItem: null,

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const user = await api.getProfile();
                    set({
                        user,
                        isAuthenticated: true,
                        isAdmin: user.role === 'admin',
                        isLoading: false,
                        cart: user.cart || [],
                        wishlist: user.wishlist || []
                    });
                } catch (error) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isAdmin: false,
                        isLoading: false
                    });
                    // Don't clear cart/wishlist here if we want to keep guest cart? 
                    // But if session check failed, we are guest.
                }
            },

            // Init
            initializeApp: async () => {
                await get().checkAuth();
                await get().fetchCategories();
                await get().fetchProducts();
            },

            setPage: (page) => {
                set({ page });
                get().fetchProducts();
            },

            fetchProducts: async () => {
                set({ isLoading: true });
                const { page, searchQuery, filters, sortBy } = get();

                // Convert filters to API params
                // Note: API only supports single category for now, we take the first one if multiple
                const category = filters.categories[0] || '';
                const subcategory = filters.subcategories[0] || '';
                const minPrice = filters.priceRange[0];
                const maxPrice = filters.priceRange[1];

                try {
                    const data = await api.getProducts({
                        pageNumber: page,
                        keyword: searchQuery,
                        category,
                        subcategory,
                        minPrice,
                        maxPrice,
                        sort: sortBy
                    });
                    set({
                        products: data.products || [],
                        page: data.page,
                        pages: data.pages,
                        isLoading: false
                    });
                } catch (error) {
                    set({ error: 'Failed to fetch products', isLoading: false });
                    console.error(error);
                }
            },

            fetchCategories: async () => {
                try {
                    const data = await api.getCategories();
                    set({ categories: data });
                } catch (error) {
                    console.error(error);
                }
            },

            // Auth actions
            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await api.login(email, password);
                    // Login API now returns user data and sets session cookie
                    set({
                        user: data,
                        isAuthenticated: true,
                        isAdmin: data.role === 'admin',
                        isLoading: false,
                        isAuthModalOpen: false,
                        cart: data.cart || [],
                        wishlist: data.wishlist || []
                    });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await api.register(userData);
                    set({
                        user: data,
                        isAuthenticated: true,
                        isAdmin: data.role === 'admin',
                        isLoading: false,
                        isAuthModalOpen: false
                    });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            updateUserProfile: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const { user } = get();
                    // We don't strictly need the token anymore for session-based, 
                    // but if the API still expects it in argument, we might need to update api.ts signature or pass something.
                    // api.updateProfile signature is (userData, token).
                    // But now we use session. The token arg might be ignored or we pass empty.
                    // Let's pass user.token if it exists (from login response) or empty string.
                    const token = (user as any)?.token || '';
                    const data = await api.updateProfile(userData, token);
                    set({
                        user: data,
                        isLoading: false
                    });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    await api.logout();
                } catch (error) {
                    console.error('Logout failed', error);
                }
                set({
                    user: null,
                    isAuthenticated: false,
                    isAdmin: false,
                    cart: [],
                    wishlist: []
                });
            },

            // Cart actions
            addToCart: (product, quantity, selectedWeight) => {
                const { cart, user, isAuthenticated } = get();

                // If no weight selected but product has weights, use the first one as default
                const weight = selectedWeight || (product.availableWeights && product.availableWeights.length > 0 ? product.availableWeights[0].weight : undefined);

                // Inventory Check
                if (product.quantity < quantity) {
                    set({ error: `Only ${product.quantity} items in stock` });
                    return;
                }

                // Treat (productId, weight) as unique
                const existingItem = cart.find(item => item.productId === product.id && item.selectedWeight === weight);

                if (existingItem && (existingItem.quantity + quantity > product.quantity)) {
                    set({ error: `Cannot add more. Only ${product.quantity} items in stock` });
                    return;
                }

                let newCart = [...cart];

                if (existingItem) {
                    newCart = cart.map(item =>
                        (item.productId === product.id && item.selectedWeight === weight)
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    newCart = [
                        ...cart,
                        {
                            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            productId: product.id,
                            product,
                            quantity,
                            selectedWeight: weight,
                            userId: user?.id || 'guest',
                        },
                    ];
                }

                set({ cart: newCart, error: null });

                if (isAuthenticated && user && (user as any).token) {
                    api.syncCart(newCart, (user as any).token).catch(console.error);
                }
            },

            updateCartQuantity: (cartItemId, quantity) => {
                const { cart, user, isAuthenticated } = get();
                const item = cart.find(i => i.id === cartItemId);

                if (item && quantity > item.product.quantity) {
                    set({ error: `Only ${item.product.quantity} items in stock` });
                    return;
                }

                let newCart;
                if (quantity <= 0) {
                    newCart = cart.filter(item => item.id !== cartItemId);
                } else {
                    newCart = cart.map(item =>
                        item.id === cartItemId ? { ...item, quantity } : item
                    );
                }
                set({ cart: newCart, error: null });

                if (isAuthenticated && user && (user as any).token) {
                    api.syncCart(newCart, (user as any).token).catch(console.error);
                }
            },

            removeFromCart: (cartItemId) => {
                const { cart, user, isAuthenticated } = get();
                const newCart = cart.filter(item => item.id !== cartItemId);
                set({ cart: newCart });

                if (isAuthenticated && user && (user as any).token) {
                    api.syncCart(newCart, (user as any).token).catch(console.error);
                }
            },

            clearCart: () => {
                set({ cart: [] });
                const { user, isAuthenticated } = get();
                if (isAuthenticated && user && (user as any).token) {
                    api.syncCart([], (user as any).token).catch(console.error);
                }
            },

            // Wishlist actions
            addToWishlist: (product) => {
                const { wishlist, user, isAuthenticated } = get();
                const exists = wishlist.some(item => item.productId === product.id);

                if (!exists) {
                    const newWishlist = [
                        ...wishlist,
                        {
                            id: Date.now().toString(),
                            productId: product.id,
                            product,
                            userId: user?.id || 'guest',
                        },
                    ];
                    set({ wishlist: newWishlist });

                    if (isAuthenticated && user && (user as any).token) {
                        api.syncWishlist(newWishlist, (user as any).token).catch(console.error);
                    }
                }
            },

            removeFromWishlist: (wishlistItemId) => {
                const { wishlist, user, isAuthenticated } = get();
                const newWishlist = wishlist.filter(item => item.id !== wishlistItemId);
                set({ wishlist: newWishlist });

                if (isAuthenticated && user && (user as any).token) {
                    api.syncWishlist(newWishlist, (user as any).token).catch(console.error);
                }
            },

            addToCartFromWishlist: (wishlistItemId, selectedWeight) => {
                const { wishlist } = get();
                const item = wishlist.find(i => i.id === wishlistItemId);
                if (item && item.product) {
                    get().addToCart(item.product, 1, selectedWeight);
                    // We no longer remove from wishlist as per user request
                }
            },

            clearWishlist: () => {
                const { user, isAuthenticated } = get();
                set({ wishlist: [] });
                if (isAuthenticated && user && (user as any).token) {
                    api.syncWishlist([], (user as any).token).catch(console.error);
                }
            },

            // Address actions
            addAddress: async (addressData) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        const response = await api.addAddress(addressData, (user as any).token);
                        set({ user: response.user, isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                }
            },

            updateAddress: async (id, addressData) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        const response = await api.updateAddress(id, addressData, (user as any).token);
                        set({ user: response.user, isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                }
            },

            deleteAddress: async (id) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        const response = await api.deleteAddress(id, (user as any).token);
                        set({ user: response.user, isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                }
            },

            setDefaultAddress: async (id) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        const response = await api.setDefaultAddress(id, (user as any).token);
                        set({ user: response.user, isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                }
            },

            // Product actions (Admin)
            addProduct: async (productData) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        await api.createProduct(productData, (user as any).token);
                        await get().fetchProducts();
                        set({ isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        console.error(error);
                    }
                }
            },

            updateProduct: async (id, productData) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        await api.updateProduct(id, productData, (user as any).token);
                        await get().fetchProducts();
                        set({ isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        console.error(error);
                    }
                }
            },

            deleteProduct: async (id) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        await api.deleteProduct(id, (user as any).token);
                        await get().fetchProducts();
                        set({ isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        console.error(error);
                    }
                }
            },

            addCategory: async (categoryData) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        await api.createCategory(categoryData, (user as any).token);
                        await get().fetchCategories();
                        set({ isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                }
            },

            updateCategory: async (id, categoryData) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        await api.updateCategory(id, categoryData, (user as any).token);
                        await get().fetchCategories();
                        set({ isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                }
            },

            deleteCategory: async (id) => {
                const { user } = get();
                if (user && (user as any).token) {
                    set({ isLoading: true });
                    try {
                        await api.deleteCategory(id, (user as any).token);
                        await get().fetchCategories();
                        set({ isLoading: false });
                    } catch (error: any) {
                        set({ error: error.message, isLoading: false });
                        throw error;
                    }
                }
            },

            // UI actions
            setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
            setAuthModalTab: (tab) => set({ authModalTab: tab }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setFilters: (newFilters) => {
                const { filters } = get();
                set({ filters: { ...filters, ...newFilters } });
            },
            setSortBy: (sort) => set({ sortBy: sort }),

            // Order actions
            addOrder: async (orderData) => {
                const { user } = get();
                if (user && (user as any).token) {
                    await api.createOrder(orderData, (user as any).token);
                }
            },

            updateOrderStatus: (orderId, status) => {
                const { orders } = get();
                set({
                    orders: orders.map(o =>
                        o.id === orderId ? { ...o, status } : o
                    ),
                });
            },

            sendBulkEnquiry: async (enquiryData) => {
                // Since contact form uses EmailJS on frontend, we can do the same or call backend if we wanted.
                // But the instruction said "send a email to the email that is already configured".
                // Existing contact form uses EmailJS. Let's provide a hook or use api.ts if we want to centralize.
                // For now, let's just create a placeholder in store or logic if needed.
                // Actually, let's just handle it in the WholesalePage component directly if it uses EmailJS.
                // But having it here is fine for consistency.
            },

            setBuyNowItem: (product, quantity, selectedWeight) => {
                const { user } = get();
                // If no weight selected but product has weights, use the first one as default
                const weight = selectedWeight || (product.availableWeights && product.availableWeights.length > 0 ? product.availableWeights[0].weight : undefined);

                const item: CartItem = {
                    id: `buynow-${Date.now()}`,
                    productId: product.id,
                    product,
                    quantity,
                    selectedWeight: weight,
                    userId: user?.id || 'guest',
                };
                set({ buyNowItem: item });
            },

            clearBuyNowItem: () => set({ buyNowItem: null }),
        }),
        {
            name: 'rice-shop-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                isAdmin: state.isAdmin,
                cart: state.cart,
                wishlist: state.wishlist,
                buyNowItem: state.buyNowItem,
                // Don't persist products to force refresh on load
            }),
        }
    )
);
