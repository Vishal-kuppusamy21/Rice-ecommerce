import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Search,
  PackageCheck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';

import riceImg from '@/assets/rice-category.jpg';
import milletsImg from '@/assets/millets-category.jpg';
import pulsesImg from '@/assets/pulses-category.jpg';

const AdminProducts = () => {
  const navigate = useNavigate();
  const {
    products,
    categories,
    deleteProduct,
    isAdmin,
    isAuthenticated,
    page,
    pages,
    setPage,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    fetchProducts,
    isLoading
  } = useStore();

  // Load products on mount or when page/filters change
  useEffect(() => {
    fetchProducts();
  }, [page, filters.categories, searchQuery]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <Link to="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getProductImage = (categoryId: string, image?: string) => {
    const imageUrl = getImageUrl(image);
    if (imageUrl) return imageUrl;
    if (categoryId === '1') return riceImg;
    if (categoryId === '2') return milletsImg;
    return pulsesImg;
  };

  const handleDelete = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProduct(productId);
      toast.success('Product deleted successfully');
    }
  };

  const handleCategoryChange = (val: string) => {
    setFilters({ categories: val === 'all' ? [] : [val] });
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2 gap-2 p-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="font-serif text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">{products.length} products on this page</p>
          </div>
          <Link to="/admin/product-form">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.categories[0] || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className={isLoading ? 'opacity-50' : ''}>
                {products.map((product) => {
                  const category = categories.find(c => c.id === product.categoryId);
                  return (
                    <tr key={product.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product.categoryId, product.image)}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover ring-1 ring-border"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (product.categoryId === '1') target.src = riceImg;
                              else if (product.categoryId === '2') target.src = milletsImg;
                              else target.src = pulsesImg;
                            }}
                          />
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">ID: {product.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="font-normal">{category?.name || 'N/A'}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          {(() => {
                            if (product.price) return <span className="font-semibold text-primary">₹{product.price}</span>;
                            if (!product.availableWeights || product.availableWeights.length === 0) return <span className="font-semibold text-primary">₹0</span>;
                            if (product.availableWeights.length === 1) return <span className="font-semibold text-primary">₹{product.availableWeights[0].price}</span>;

                            const prices = product.availableWeights.map((w: any) => w.price);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            return <span className="font-semibold text-primary">₹{minPrice} - ₹{maxPrice}</span>;
                          })()}
                          {(!product.availableWeights || product.availableWeights.length <= 1 || product.price) && (
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Per {product.unit}</span>
                          )}
                          {product.discount > 0 && (
                            <span className="text-[10px] text-accent font-bold mt-1">-{product.discount}% OFF</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${product.quantity < product.lowStockThreshold ? 'bg-destructive animate-pulse' : 'bg-green-500'}`} />
                            <span className={`text-sm ${product.quantity < product.lowStockThreshold ? 'text-destructive font-bold' : 'font-medium'}`}>
                              {product.quantity} Bags
                            </span>
                          </div>
                          {product.availableWeights && product.availableWeights.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.availableWeights.map((w: any) => (
                                <Badge key={w.weight} variant="outline" className={`text-[10px] px-1 py-0 ${w.stock < 5 ? 'border-destructive/50 text-destructive' : ''}`}>
                                  {w.weight}: {w.stock || 0}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {(() => {
                          // Compute real stock from weight-level data (product.quantity can be stale)
                          const realStock = product.availableWeights && product.availableWeights.length > 0
                            ? product.availableWeights.reduce((sum: number, w: any) => sum + (w.stock || 0), 0)
                            : product.quantity;
                          if (!product.isAvailable) {
                            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">Inactive</span>;
                          } else if (realStock <= 0) {
                            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">Out of Stock</span>;
                          } else if (realStock < (product.lowStockThreshold || 10)) {
                            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">Low Stock</span>;
                          } else {
                            return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">In Stock</span>;
                          }
                        })()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/edit/${product.id}`}>
                            <Button variant="ghost" size="icon-sm" className="hover:bg-primary/10 hover:text-primary">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {products.length === 0 && !isLoading && (
            <div className="text-center py-20 bg-secondary/10">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No products found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between bg-secondary/5">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-bold text-foreground">{page}</span> of <span className="font-bold text-foreground">{pages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || isLoading}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={page === p ? 'default' : 'ghost'}
                      size="icon-sm"
                      onClick={() => setPage(p)}
                      disabled={isLoading}
                      className="w-8 h-8"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pages || isLoading}
                  className="gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
