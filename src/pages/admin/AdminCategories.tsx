import { useState } from 'react';
import { Plus, Pencil, Trash2, Upload, ImageIcon, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { api, getImageUrl } from '@/lib/api';
import Loader from '@/components/ui/loader';

const AdminCategories = () => {
    const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useStore();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        subcategories: [] as { name: string }[]
    });

    const [uploading, setUploading] = useState(false);

    const handleOpenDialog = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                description: category.description || '',
                image: category.image || '',
                subcategories: category.subcategories?.map((s: any) => ({ name: s.name })) || []
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                image: '',
                subcategories: []
            });
        }
        setIsDialogOpen(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const uploadFormData = new FormData();
            uploadFormData.append('image', file);
            setUploading(true);
            try {
                const state = useStore.getState();
                const token = (state.user as any)?.token || '';

                // Allow upload to proceed; backend auth middleware will handle validation
                const imagePath = await api.uploadFile(uploadFormData, token);
                setFormData({ ...formData, image: imagePath });
                toast.success('Image uploaded successfully');
            } catch (error: any) {
                console.error("Upload error:", error);
                toast.error(error.message || 'Upload failed. Check server logs.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                toast.success('Category updated successfully');
            } else {
                await addCategory(formData);
                toast.success('Category added successfully');
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                toast.success('Category deleted');
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Categories</h1>
                    <p className="text-muted-foreground mt-1">Organize your products with categories</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-md hover:shadow-lg transition-all">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader size="lg" text="Loading categories..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                            <Card
                                key={category.id}
                                className="group overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 animate-scale-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="aspect-video relative overflow-hidden bg-muted">
                                    {category.image ? (
                                        <img
                                            src={getImageUrl(category.image)}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.src = ''; // Clear source to show fallback
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`absolute inset-0 flex items-center justify-center bg-secondary/30 ${category.image ? 'hidden' : ''}`}>
                                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                                    </div>

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-9 w-9 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                            onClick={() => handleOpenDialog(category)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-9 w-9 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {category.description || 'No description provided'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-medium text-lg">No categories found</h3>
                            <p className="text-muted-foreground mt-1 mb-4">
                                {searchQuery ? 'Try adjusting your search query' : 'Create your first category to get started'}
                            </p>
                            {!searchQuery && (
                                <Button variant="outline" onClick={() => handleOpenDialog()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Category
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Name</Label>
                            <Input
                                id="cat-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Rice, Spices"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Textarea
                                id="cat-desc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this category..."
                                className="resize-none"
                            />
                        </div>

                        {/* Subcategories */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <Label>Subcategories</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormData(prev => ({ ...prev, subcategories: [...prev.subcategories, { name: '' }] }))}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Subcategory
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {formData.subcategories.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No subcategories added yet.</p>
                                ) : (
                                    formData.subcategories.map((sub, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input
                                                value={sub.name}
                                                onChange={(e) => {
                                                    const newSubs = [...formData.subcategories];
                                                    newSubs[index] = { name: e.target.value };
                                                    setFormData({ ...formData, subcategories: newSubs });
                                                }}
                                                placeholder={`Subcategory ${index + 1}`}
                                                className="h-9 text-sm"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={() => {
                                                    const newSubs = formData.subcategories.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, subcategories: newSubs });
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <Label>Category Image</Label>
                            <div className="flex gap-4 items-start">
                                <div className="h-20 w-20 rounded-md border bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                                    {formData.image ? (
                                        <img src={getImageUrl(formData.image)} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="cat-img-upload"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full gap-2"
                                            onClick={() => document.getElementById('cat-img-upload')?.click()}
                                            disabled={uploading}
                                        >
                                            {uploading ? <Loader size="sm" /> : <Upload className="h-4 w-4" />}
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                        </Button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border" />
                                        <span className="relative z-10 bg-background px-2 text-xs text-muted-foreground ml-2">OR</span>
                                    </div>
                                    <Input
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="Paste image URL..."
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={uploading}>
                                {editingCategory ? 'Update Category' : 'Create Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminCategories;
