import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, categories, addProduct, updateProduct, isAdmin, isAuthenticated, user } = useStore();

  const [uploading, setUploading] = useState(false);

  const isEditing = !!id;
  const existingProduct = isEditing ? products.find(p => p.id === id) : null;

  const [formData, setFormData] = useState({
    name: existingProduct?.name || '',
    description: existingProduct?.description || '',
    quantity: existingProduct?.quantity?.toString() || '',
    categoryId: existingProduct?.categoryId || '',
    subcategoryId: existingProduct?.subcategoryId || '',
    unit: existingProduct?.unit || 'kg',
    discount: existingProduct?.discount?.toString() || '',
    isAvailable: existingProduct?.isAvailable ?? true,
    lowStockThreshold: existingProduct?.lowStockThreshold?.toString() || '10',
    image: existingProduct?.image || '',
    availableWeights: existingProduct?.availableWeights || [
      { weight: '5kg', price: 0, stock: 0 },
      { weight: '10kg', price: 0, stock: 0 },
      { weight: '25kg', price: 0, stock: 0 }
    ],
  });

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

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  if (formData.categoryId) {
    console.log('ProductForm Render - Categories:', categories);
    console.log('ProductForm Render - Selected Category:', selectedCategory);
  }

  const handleWeightChange = (index: number, field: 'weight' | 'price' | 'stock', value: string | number) => {
    const newWeights = [...formData.availableWeights];
    newWeights[index] = { ...newWeights[index], [field]: value };

    // Auto-calculate total quantity
    const totalQty = newWeights.reduce((sum, w) => sum + (Number(w.stock) || 0), 0);

    setFormData({
      ...formData,
      availableWeights: newWeights,
      quantity: totalQty.toString()
    });
  };

  const addWeightRow = () => {
    setFormData({
      ...formData,
      availableWeights: [...formData.availableWeights, { weight: '', price: 0, stock: 0 }]
    });
  };

  const removeWeightRow = (index: number) => {
    const newWeights = formData.availableWeights.filter((_, i) => i !== index);
    setFormData({ ...formData, availableWeights: newWeights });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      setUploading(true);
      try {
        const token = (user as any)?.token || '';
        const imagePath = await api.uploadFile(uploadFormData, token);
        setFormData({ ...formData, image: imagePath });
        toast.success('Image uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload image');
        console.error(error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.quantity || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate weights
    if (formData.availableWeights.length === 0) {
      toast.error('Please add at least one weight and price');
      return;
    }

    if (formData.availableWeights.some(w => !w.weight || w.price <= 0)) {
      toast.error('All weight options must have a weight and a valid price');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId || undefined,
      unit: formData.unit,
      discount: formData.discount ? parseInt(formData.discount) : undefined,
      isAvailable: formData.isAvailable,
      image: formData.image,
      availableWeights: formData.availableWeights,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
    };

    if (isEditing && id) {
      updateProduct(id, productData as any);
      toast.success('Product updated successfully');
    } else {
      addProduct(productData as any);
      toast.success('Product added successfully');
    }

    navigate('/admin/products');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="bg-card rounded-xl p-8 border border-border">
            <h1 className="font-serif text-2xl font-bold mb-6">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Basmati Rice"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  rows={4}
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value, subcategoryId: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategory</Label>
                  <Select
                    value={formData.subcategoryId}
                    onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                    disabled={!selectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory?.subcategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Net Weight & Price */}
              <div className="space-y-4 border-t border-b py-6 my-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-bold">Net Weight & Price *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addWeightRow}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Weight Option
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.availableWeights.map((w, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Weight (e.g. 5kg)</Label>
                        <Input
                          value={w.weight}
                          onChange={(e) => handleWeightChange(index, 'weight', e.target.value)}
                          placeholder="5kg"
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          value={w.price || ''}
                          onChange={(e) => handleWeightChange(index, 'price', parseFloat(e.target.value))}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Stock (Bags)</Label>
                        <Input
                          type="number"
                          value={w.stock || '0'}
                          onChange={(e) => handleWeightChange(index, 'stock', parseInt(e.target.value))}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeWeightRow(index)}
                        disabled={formData.availableWeights.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unit & Discount */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Display Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground italic">
                    Used for search filters and generic displays
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Global Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-muted-foreground italic">
                    Applies to all weight options
                  </p>
                </div>
              </div>

              {/* Stock Quantity & Threshold */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Stock Quantity (Total) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="100"
                    min="0"
                    required
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-[10px] text-muted-foreground italic">Auto-calculated from weights above</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert at *</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL or Upload"
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img src={getImageUrl(formData.image)} alt="Preview" className="h-24 w-auto object-cover rounded border bg-muted" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image or paste a URL. Leave empty to use default category image.
                </p>
              </div>

              {/* Availability */}
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div>
                  <Label>Product Available</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this product visible on the store
                  </p>
                </div>
                <Switch
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {isEditing ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div >
    </div >
  );
};

export default ProductForm;
