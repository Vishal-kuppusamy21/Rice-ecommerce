import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import ProductCard from '@/components/product/ProductCard';
import { getLocalizedContent } from '@/utils/i18nHelper';
import { formatPriceUnit } from '@/utils/format';

import riceImg from '@/assets/rice-category.jpg';
import milletsImg from '@/assets/millets-category.jpg';
import pulsesImg from '@/assets/pulses-category.jpg';
import { api } from '@/lib/api';
import { getImageUrl, cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, categories, addToCart, addToWishlist, removeFromWishlist, wishlist, isAuthenticated, setAuthModalOpen, isAdmin, user } = useStore();
  const { t, i18n } = useTranslation();

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Re-fetch product to get latest reviews if needed (ideally store should handle this, 
  // but for now we rely on the product list which might be stale regarding reviews).
  // Actually, let's fetch individual product details on mount or use a separate state if we want real-time updates.
  // For simplicity, we assume `products` lists updated data or we force a reload. 
  // Since we don't have a single-product fetcher in store easily exposed, let's use the one from list.

  const product = products.find(p => p.id === id);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (!product) return;

    setIsSubmitting(true);
    try {
      await api.createReview(product.id, { rating, comment }, (user as any).token);
      toast.success('Review submitted successfully');
      setComment('');
      setRating('5');
      // Trigger a re-fetch of products to show the new review (not ideal but works with current store structure)
      // useStore.getState().fetchProducts(); 
      // Better: Reload the page or force fetch
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === product.subcategoryId);

  const name = getLocalizedContent(product, 'name', i18n.language);
  const description = getLocalizedContent(product, 'description', i18n.language);
  const categoryName = getLocalizedContent(category, 'name', i18n.language);
  const subcategoryName = getLocalizedContent(subcategory, 'name', i18n.language);

  const isInWishlist = wishlist.some(item => item.productId === product.id);

  // Note: discountedPrice is now calculated below using weight selection logic

  // Related products
  const relatedProducts = products
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const getProductImage = () => {
    const imageUrl = getImageUrl(product.image);
    if (imageUrl) return imageUrl;
    if (product.categoryId === '1') return riceImg;
    if (product.categoryId === '2') return milletsImg;
    return pulsesImg;
  };

  // Weight selection
  const [selectedWeight, setSelectedWeight] = useState(
    product.availableWeights && product.availableWeights.length > 0
      ? product.availableWeights[0].weight
      : undefined
  );

  const activeWeight = product.availableWeights?.find(w => w.weight === selectedWeight);
  const basePrice = activeWeight ? activeWeight.price : (product.availableWeights?.[0]?.price || 0);

  const discountedPrice = product.discount
    ? basePrice - (basePrice * product.discount / 100)
    : basePrice;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (!product.isAvailable || (activeWeight?.stock ?? 0) <= 0) {
      toast.error(t('product.out_of_stock'));
      return;
    }

    if (quantity > (activeWeight?.stock ?? 0)) {
      toast.error(`Only ${activeWeight?.stock} bags available`);
      return;
    }

    addToCart(product, quantity, selectedWeight);
    toast.success(`${quantity} x ${selectedWeight || product.unit} ${name} ${t('product.added_to_cart')}`);
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (isInWishlist) {
      const wishlistItem = wishlist.find(item => item.productId === product.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id);
        toast.success(`${name} ${t('product.removed_from_wishlist')}`);
      }
      return;
    }

    addToWishlist(product);
    toast.success(`${name} ${t('product.added_to_wishlist')}`);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (!product.isAvailable || (activeWeight?.stock ?? 0) <= 0) {
      toast.error(t('product.out_of_stock'));
      return;
    }

    if (quantity > (activeWeight?.stock ?? 0)) {
      toast.error(`Only ${activeWeight?.stock} bags available`);
      return;
    }

    const { setBuyNowItem } = useStore.getState();
    setBuyNowItem(product, quantity, selectedWeight);
    navigate('/checkout?buyNow=true');
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-secondary/50 py-4">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">{t('header.nav.home')}</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">{t('header.nav.all_products')}</Link>
            {category && (
              <>
                <span className="text-muted-foreground">/</span>
                <Link to={`/products?category=${category.id}`} className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
                  {categoryName}
                </Link>
              </>
            )}
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium truncate">{name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 hover:bg-primary/5 transition-all">
          <ArrowLeft className="h-4 w-4" />
          {t('product_details.back')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative group">
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted shadow-strong border border-border/40">
              <img
                src={getProductImage() || riceImg}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = riceImg;
                }}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>

            {/* Badges removed from here to be inline with price */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
              {!product.isAvailable && (
                <Badge variant="secondary" className="backdrop-blur-md bg-white/80 text-black text-lg px-4 py-1.5 shadow-lg uppercase tracking-widest font-bold">
                  {t('product.out_of_stock')}
                </Badge>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8 animate-slide-up">
            <div>
              {/* Category */}
              {category && (
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold">{categoryName}</Badge>
                  {subcategory && <Badge variant="outline" className="font-semibold">{subcategoryName}</Badge>}
                </div>
              )}

              {/* Name */}
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight tracking-tight">
                {name}
              </h1>

              {/* Rating */}
              {product.numReviews > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-warning/10 rounded-full border border-warning/20">
                    <Star className="h-5 w-5 fill-warning text-warning" />
                    <span className="font-black text-warning text-lg">{product.rating}</span>
                  </div>
                  {product.numReviews ? (
                    <span className="text-muted-foreground font-medium underline underline-offset-4 cursor-pointer hover:text-primary transition-colors">
                      {product.numReviews} {t('product_details.reviews')}
                    </span>
                  ) : null}
                </div>
              )}

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border/40 w-fit">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    (activeWeight?.stock || 0) > product.lowStockThreshold ? 'bg-accent' : 'bg-warning animate-pulse'
                  )} />
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {(activeWeight?.stock ?? 0) > 0 ? `${activeWeight?.stock} bags in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-primary tracking-tighter">
                  ₹{discountedPrice.toFixed(0)}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-muted-foreground/40 line-through decoration-destructive/30">
                      ₹{basePrice}
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground font-medium">
                  {t('product.per').charAt(0).toUpperCase() + t('product.per').slice(1)} {formatPriceUnit(selectedWeight || product.unit)}
                </span>
              </div>
            </div>

            {/* Weight Selection - Image 2 & 3 */}
            {product.availableWeights && product.availableWeights.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Select Net Weight</Label>
                <div className="flex flex-wrap gap-3">
                  {product.availableWeights.map((w) => {
                    const wOutOfStock = (w.stock ?? 0) <= 0;
                    return (
                      <button
                        key={w.weight}
                        onClick={() => setSelectedWeight(w.weight)}
                        title={wOutOfStock ? 'Out of stock' : `${w.stock} bags in stock`}
                        className={cn(
                          "px-5 py-2 rounded-lg border-2 font-bold transition-all duration-300 active:scale-95",
                          selectedWeight === w.weight
                            ? wOutOfStock
                              ? "border-destructive/40 bg-destructive/10 text-destructive line-through"
                              : "border-primary bg-primary text-primary-foreground shadow-glow"
                            : wOutOfStock
                              ? "border-border/20 bg-white text-muted-foreground/40 line-through"
                              : "border-border/40 bg-white text-foreground hover:border-primary hover:text-primary"
                        )}
                      >
                        {w.weight}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            {!isAdmin && (
              <div className="flex items-center gap-4">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t('product_details.quantity')}</Label>
                <div className="flex items-center bg-muted/30 p-0.5 rounded-xl border border-border/40">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-soft transition-all active:scale-90"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center text-base font-black">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-soft transition-all active:scale-90"
                    onClick={() => setQuantity(q => Math.min(activeWeight?.stock || 0, q + 1))}
                    disabled={quantity >= (activeWeight?.stock || 0)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!isAdmin && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 h-14 text-lg font-bold rounded-xl gap-2 bg-gradient-to-r from-primary via-[#e67e22] to-primary bg-[length:200%_auto] text-white border-none shadow-[0_8px_25px_-5px_rgba(230,126,34,0.5)] hover:shadow-[0_12px_30px_-5px_rgba(230,126,34,0.6)] hover:bg-right hover:-translate-y-0.5 transition-all duration-500 active:scale-[0.98]"
                    onClick={handleAddToCart}
                    disabled={!product.isAvailable || (activeWeight?.stock ?? 0) <= 0}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {(activeWeight?.stock ?? 0) <= 0 ? 'Out of Stock' : t('product.add_to_cart')}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "h-12 w-12 rounded-xl transition-all active:scale-90",
                      isInWishlist ? "bg-destructive/10 border-destructive text-destructive" : "hover:border-primary hover:text-primary"
                    )}
                    onClick={handleAddToWishlist}
                  >
                    <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
                  </Button>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  className="h-12 text-base font-bold rounded-xl shadow-glow transition-all active:scale-[0.98]"
                  onClick={handleBuyNow}
                  disabled={!product.isAvailable || (activeWeight?.stock ?? 0) <= 0}
                >
                  {(activeWeight?.stock ?? 0) <= 0 ? 'Out of Stock' : t('product_details.buy_now')}
                </Button>
              </div>
            )}

            {/* Features Case */}
            <div className="grid grid-cols-3 gap-4 p-8 bg-secondary/30 rounded-3xl border border-secondary/50">
              <div className="text-center group">
                <div className="h-14 w-14 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-500">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <p className="text-xs font-black uppercase tracking-tight text-foreground mb-1">{t('product_details.free_delivery')}</p>
                <p className="text-[10px] font-medium text-muted-foreground leading-tight px-1">{t('product_details.free_delivery_desc')}</p>
              </div>
              <div className="text-center group">
                <div className="h-14 w-14 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-500">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <p className="text-xs font-black uppercase tracking-tight text-foreground mb-1">{t('product_details.quality_assured')}</p>
                <p className="text-[10px] font-medium text-muted-foreground leading-tight px-1">{t('product_details.quality_assured_desc')}</p>
              </div>
              <div className="text-center group">
                <div className="h-14 w-14 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-500">
                  <RotateCcw className="h-7 w-7 text-primary" />
                </div>
                <p className="text-xs font-black uppercase tracking-tight text-foreground mb-1">{t('product_details.easy_returns')}</p>
                <p className="text-[10px] font-medium text-muted-foreground leading-tight px-1">{t('product_details.easy_returns_desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b border-border bg-transparent h-auto p-0 rounded-none">
              <TabsTrigger
                value="description"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                {t('product_details.description')}
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                {t('product_details.details')}
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                {t('product_details.shipping')}
              </TabsTrigger>

              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                {t('product_details.reviews')} ({product.numReviews || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="py-6">
              {description && (
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground leading-relaxed mb-6">
                  {description.split('\n').filter((line: string) => line.trim() !== '').map((line: string, index: number) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              )}
              <p className="text-muted-foreground leading-relaxed mt-4">
                This premium quality {category?.name.toLowerCase()} is carefully sourced from trusted farmers
                and processed using traditional methods to preserve its natural goodness. Perfect for
                everyday cooking and special occasions alike.
              </p>
            </TabsContent>

            <TabsContent value="details" className="py-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Product ID</span>
                    <span className="font-medium">{product.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{categoryName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Unit</span>
                    <span className="font-medium">{product.unit}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{product.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Storage</span>
                    <span className="font-medium">Store in cool, dry place</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Shelf Life</span>
                    <span className="font-medium">12 months</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="py-6">
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('product_details.shipping_info.free_delivery_title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('product_details.shipping_info.free_delivery_desc')}
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('product_details.shipping_info.express_delivery_title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('product_details.shipping_info.express_delivery_desc')}
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{t('product_details.shipping_info.returns_refunds_title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('product_details.shipping_info.returns_refunds_desc')}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="py-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Reviews List */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">{t('product_details.reviews')}</h3>
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review: any, index: number) => (
                      <div key={index} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex text-warning">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'fill-muted text-muted'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : ''}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No reviews yet. Be the first to review!</p>
                  )}
                </div>

                {/* Review Form */}
                <div className="bg-secondary/30 p-6 rounded-xl h-fit">
                  <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
                  {isAuthenticated ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <Select value={rating} onValueChange={setRating}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                            <SelectItem value="4">4 - Very Good</SelectItem>
                            <SelectItem value="3">3 - Good</SelectItem>
                            <SelectItem value="2">2 - Fair</SelectItem>
                            <SelectItem value="1">1 - Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Comment</Label>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your experience..."
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <p className="mb-4 text-muted-foreground">Please login to write a review</p>
                      <Button variant="outline" onClick={() => setAuthModalOpen(true)}>Login Now</Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div >

        {/* Related Products */}
        {
          relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-2xl font-bold mb-6">{t('product_details.related_products')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default ProductDetailPage;
