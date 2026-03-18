const SERVER_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${SERVER_BASE}/api`;
export const SERVER_URL = SERVER_BASE;

export const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Legacy/Seed data check: If path has no slashes, it's likely a seed filename (e.g. "rice.jpg") which we can't serve.
    // Return empty so that UI components use their hardcoded imports/fallbacks.
    if (!path.includes('/') && !path.includes('\\')) {
        return '';
    }

    // Remove leading slash if exists
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${SERVER_URL}/${cleanPath}`;
};

const fetchWithCreds = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
        ...options,
        credentials: 'include',
    });
};

export const api = {
    // Products
    getProducts: async ({
        pageNumber = 1,
        keyword = '',
        category = '',
        subcategory = '',
        minPrice = 0,
        maxPrice = 10000,
        sort = 'newest'
    } = {}) => {
        const params = new URLSearchParams();
        params.append('pageNumber', pageNumber.toString());
        if (keyword) params.append('keyword', keyword);
        if (category) params.append('category', category);
        if (subcategory) params.append('subcategory', subcategory);
        if (minPrice) params.append('minPrice', minPrice.toString());
        if (maxPrice) params.append('maxPrice', maxPrice.toString());
        if (sort) params.append('sort', sort);

        const response = await fetchWithCreds(`${API_URL}/products?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        if (data.products) {
            data.products = data.products.map((p: any) => ({
                ...p,
                id: p._id,
                categoryId: p.category?._id || p.category,
                subcategoryId: p.subcategory
            }));
        }
        return data;
    },

    getProductById: async (id: string) => {
        const response = await fetchWithCreds(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    createReview: async (id: string, reviewData: any, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/products/${id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add review');
        }
        return response.json();
    },

    getCategories: async () => {
        const response = await fetchWithCreds(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        return data.map((c: any) => ({
            ...c,
            id: c._id,
            subcategories: c.subcategories?.map((s: any) => ({
                ...s,
                id: s._id,
                categoryId: c._id
            }))
        }));
    },

    createCategory: async (categoryData: any, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },

    updateCategory: async (id: string, categoryData: any, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoryData)
        });
        if (!response.ok) throw new Error('Failed to update category');
        return response.json();
    },

    deleteCategory: async (id: string, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete category');
        return response.json();
    },

    // Auth
    login: async (email, password) => {
        const response = await fetchWithCreds(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    register: async (userData) => {
        const response = await fetchWithCreds(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    },

    createUser: async (userData, token) => {
        const response = await fetchWithCreds(`${API_URL}/users/admin-create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Action failed');
        }
        return response.json();
    },

    getProfile: async () => {
        const response = await fetchWithCreds(`${API_URL}/users/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    updateProfile: async (userData: any, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Profile update failed');
        }
        return response.json();
    },

    addAddress: async (addressData: any, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/users/profile/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
        });
        if (!response.ok) throw new Error('Failed to add address');
        return response.json();
    },

    updateAddress: async (id: string, addressData: any, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/users/profile/addresses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(addressData)
        });
        if (!response.ok) throw new Error('Failed to update address');
        return response.json();
    },

    deleteAddress: async (id: string, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/users/profile/addresses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete address');
        return response.json();
    },

    setDefaultAddress: async (id: string, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/users/profile/addresses/${id}/default`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to set default address');
        return response.json();
    },

    getAdmins: async (token: string) => {
        const response = await fetchWithCreds(`${API_URL}/users?role=admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch admins');
        return response.json();
    },

    getCustomers: async (token: string) => {
        const response = await fetchWithCreds(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        // Filter to show only non-admin users
        return Array.isArray(data) ? data.filter((u: any) => u.role !== 'admin') : data;
    },

    logout: async () => {
        await fetchWithCreds(`${API_URL}/users/logout`, { method: 'POST' });
    },

    deleteUser: async (id, token) => {
        const response = await fetchWithCreds(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete user');
        return response.json();
    },

    updateUser: async (id, userData, token) => {
        const response = await fetchWithCreds(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    forgotPassword: async (email: string) => {
        const response = await fetchWithCreds(`${API_URL}/users/forgotpassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send reset link');
        }
        return response.json();
    },

    verifyOTP: async (email: string, otp: string) => {
        const response = await fetchWithCreds(`${API_URL}/users/verifyotp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid OTP');
        }
        return response.json();
    },

    resetPassword: async (data: any) => {
        const response = await fetchWithCreds(`${API_URL}/users/resetpassword`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to reset password');
        }
        return response.json();
    },

    // Cart Sync
    syncCart: async (cart, token) => {
        const response = await fetchWithCreds(`${API_URL}/users/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cart })
        });
        if (!response.ok) throw new Error('Failed to sync cart');
        return response.json();
    },

    syncWishlist: async (wishlist, token) => {
        const response = await fetchWithCreds(`${API_URL}/users/wishlist`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ wishlist })
        });
        if (!response.ok) throw new Error('Failed to sync wishlist');
        return response.json();
    },

    // Orders
    // Orders
    createOrder: async (orderData, token) => {
        const response = await fetchWithCreds(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create order');
        }
        return response.json();
    },

    getOrders: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    getOrderById: async (id: string, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/orders/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch order');
        return response.json();
    },

    deliverOrder: async (id, token) => {
        const response = await fetchWithCreds(`${API_URL}/orders/${id}/deliver`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return response.json();
    },

    updateOrderStatus: async (id: string, status: string, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return response.json();
    },

    markOrderAsPaidAdmin: async (id: string, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/orders/${id}/pay-admin`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to mark order as paid');
        return response.json();
    },

    getMyOrders: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/orders/myorders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch my orders');
        return response.json();
    },

    cancelOrder: async (id: string, token: string) => {
        const response = await fetchWithCreds(`${API_URL}/orders/${id}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to cancel order');
        }
        return response.json();
    },

    // Products (Admin)
    createProduct: async (productData, token) => {
        const response = await fetchWithCreds(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    updateProduct: async (id, productData, token) => {
        const response = await fetchWithCreds(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    deleteProduct: async (id, token) => {
        const response = await fetchWithCreds(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete product');
        return response.json();
    },

    // Suppliers (Admin)
    getSuppliers: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/suppliers`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch suppliers');
        return response.json();
    },

    createSupplier: async (supplierData, token) => {
        const response = await fetchWithCreds(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(supplierData)
        });
        if (!response.ok) throw new Error('Failed to create supplier');
        return response.json();
    },

    updateSupplier: async (id, supplierData, token) => {
        const response = await fetchWithCreds(`${API_URL}/suppliers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(supplierData)
        });
        if (!response.ok) throw new Error('Failed to update supplier');
        return response.json();
    },

    deleteSupplier: async (id, token) => {
        const response = await fetchWithCreds(`${API_URL}/suppliers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete supplier');
        return response.json();
    },

    // Inventory (Admin)
    addStockEntry: async (stockData, token) => {
        const response = await fetchWithCreds(`${API_URL}/inventory/stock-entry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(stockData)
        });
        if (!response.ok) throw new Error('Failed to add stock entry');
        return response.json();
    },

    getStockEntries: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/inventory/stock-entry`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch stock entries');
        return response.json();
    },

    getInventoryStats: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/inventory/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory stats');
        return response.json();
    },

    // Reports (Admin)
    getDashboardStats: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/reports/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    getSalesReport: async (token, startDate?: string, endDate?: string) => {
        let url = `${API_URL}/reports/sales`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (startDate || endDate) url += `?${params.toString()}`;

        const response = await fetchWithCreds(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch sales report');
        return response.json();
    },

    getMonthlyReport: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/reports/monthly`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch monthly report');
        return response.json();
    },

    getProductPerformanceReport: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/reports/products`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch product report');
        return response.json();
    },

    getUserPurchaseReport: async (token) => {
        const response = await fetchWithCreds(`${API_URL}/reports/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user report');
        return response.json();
    },

    // Payment
    processPayment: async (paymentData, token) => {
        const response = await fetchWithCreds(`${API_URL}/payment/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        if (!response.ok) throw new Error('Payment failed');
        return response.json();
    },

    uploadFile: async (formData: FormData, token: string) => {
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetchWithCreds(`${API_URL}/upload`, {
            method: 'POST',
            headers,
            body: formData
        });
        if (!response.ok) throw new Error('File upload failed');
        return response.text();
    },

    // Enquiries
    sendBulkEnquiry: async (enquiryData: any) => {
        const response = await fetchWithCreds(`${API_URL}/enquiries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enquiryData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send enquiry');
        }
        return response.json();
    },

    getEnquiries: async (token: string) => {
        const response = await fetchWithCreds(`${API_URL}/enquiries`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch enquiries');
        return response.json();
    },

    getStockHistory: async (token: string) => {
        const response = await fetchWithCreds(`${API_URL}/inventory/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch stock history');
        return response.json();
    }
};
