import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import { cn, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';
import { formatPriceUnit } from '@/utils/format';

// Import placeholder images
import riceImg from '@/assets/rice-category.jpg';
import milletsImg from '@/assets/millets-category.jpg';
import pulsesImg from '@/assets/pulses-category.jpg';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  showQuantity?: boolean;
  isWishlist?: boolean;
}

const ProductCard = ({ product, viewMode = 'grid', showQuantity = true, isWishlist = false }: ProductCardProps) => {
  const { addToCart, addToWishlist, removeFromWishlist, addToCartFromWishlist, wishlist, isAuthenticated, setAuthModalOpen, isAdmin } = useStore();
  const { t, i18n } = useTranslation();

  // Weight Selection state for card
  const [selectedWeight, setSelectedWeight] = useState(
    product.availableWeights && product.availableWeights.length > 0
      ? product.availableWeights[0].weight
      : undefined
  );

  const name = getLocalizedContent(product, 'name', i18n.language);
  const description = getLocalizedContent(product, 'description', i18n.language);

  const isInWishlist = wishlist.some(item => item.productId === product.id);

  const activeWeight = product.availableWeights?.find(w => w.weight === selectedWeight);
  const basePrice = activeWeight ? activeWeight.price : (product.availableWeights?.[0]?.price || 0);

  // Use per-weight-variant stock if available, fallback to product.quantity
  const activeStock = activeWeight ? (activeWeight.stock ?? 0) : product.quantity;
  const isOutOfStock = !product.isAvailable || activeStock <= 0;

  const discountedPrice = product.discount
    ? basePrice - (basePrice * product.discount / 100)
    : basePrice;

  // Get appropriate image based on category
  const getProductImage = () => {
    const imageUrl = getImageUrl(product.image);
    if (imageUrl) return imageUrl;
    if (product.categoryId === '1') return riceImg;
    if (product.categoryId === '2') return milletsImg;
    return pulsesImg;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    if (isOutOfStock) {
      toast.error(t('product.out_of_stock'));
      return;
    }

    if (isWishlist) {
      const wishlistItem = wishlist.find(item => item.productId === product.id);
      if (wishlistItem) {
        addToCartFromWishlist(wishlistItem.id, selectedWeight);
        toast.success(`${name} ${t('wishlist.moved_to_cart')}`);
      }
    } else {
      addToCart(product, 1, selectedWeight);
      toast.success(`${name} (${selectedWeight || product.unit}) ${t('product.added_to_cart')}`);
    }
  };

  const handleWeightClick = (e: React.MouseEvent, weight: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWeight(weight);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  if (viewMode === 'list') {
    return (
      <Link to={`/product/${product.id}`} className="group block h-full">
        <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-500 border border-border/40 flex flex-row h-full group-hover:border-primary/20">
          {/* Image */}
          <div className="relative w-48 shrink-0 bg-muted overflow-hidden">
            <img
              src={getProductImage() || riceImg}
              alt={name}
              onError={(e) => {
                e.currentTarget.src = riceImg;
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Out of Stock Badge - List Mode */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isOutOfStock && (
                <Badge variant="secondary" className="backdrop-blur-md bg-white/80 text-black font-black text-[10px] uppercase tracking-widest shadow-lg">Out of Stock</Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1 justify-between">
            <div>
              {/* Stock Pill - List Mode */}
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 px-2 py-1 mb-2 rounded-lg bg-destructive/10 border border-destructive/20 w-fit">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  <span className="text-[10px] font-bold text-destructive uppercase">Out of Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 mb-2 rounded-lg bg-muted border border-border/40 w-fit">
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    activeStock <= (product.lowStockThreshold || 10) ? 'bg-warning animate-pulse' : 'bg-accent'
                  )} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{activeStock} left</span>
                </div>
              )}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors text-xl mb-1 line-clamp-1">
                    {name}
                  </h3>
                  {product.numReviews > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex text-warning">
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </div>
                      <span className="text-sm font-semibold text-foreground/80">{product.rating}</span>
                    </div>
                  )}
                </div>
                {!isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full shrink-0 transition-colors active:scale-90",
                      isWishlist
                        ? 'text-destructive hover:bg-destructive/10'
                        : isInWishlist ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:bg-secondary'
                    )}
                    onClick={(e) => {
                      if (isWishlist) {
                        e.preventDefault();
                        e.stopPropagation();
                        const wishlistItem = wishlist.find(item => item.productId === product.id);
                        if (wishlistItem) {
                          removeFromWishlist(wishlistItem.id);
                          toast.success(t('wishlist.removed_from_wishlist'));
                        }
                      } else {
                        handleAddToWishlist(e);
                      }
                    }}
                  >
                    {isWishlist ? (
                      <Trash2 className="h-4.5 w-4.5" />
                    ) : (
                      <Heart className={cn("h-4.5 w-4.5", isInWishlist && 'fill-current')} />
                    )}
                  </Button>
                )}
              </div>

              {/* Weights as Chips - List Mode */}
              {product.availableWeights && product.availableWeights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.availableWeights.map((w) => {
                    const wOutOfStock = (w.stock ?? 0) <= 0;
                    return (
                      <button
                        key={w.weight}
                        onClick={(e) => handleWeightClick(e, w.weight)}
                        title={wOutOfStock ? 'Out of stock' : `${w.stock} left`}
                        className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all active:scale-95 relative",
                          selectedWeight === w.weight
                            ? wOutOfStock
                              ? "bg-destructive/10 text-destructive border-destructive/40 line-through"
                              : "bg-primary text-primary-foreground border-primary"
                            : wOutOfStock
                              ? "bg-white text-muted-foreground/40 border-border/30 line-through"
                              : "bg-white text-muted-foreground border-border/60 hover:border-primary/40"
                        )}
                      >
                        {w.weight}
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground mb-1">
                  {t('product.per').charAt(0).toUpperCase() + t('product.per').slice(1)} {formatPriceUnit(selectedWeight || product.unit)}
                </p>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl font-bold text-primary">
                    ₹{discountedPrice.toFixed(0)}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-sm text-muted-foreground/60 line-through">
                        ₹{basePrice}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {!isAdmin && (
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="rounded-full px-6 shadow-[0_4px_12px_-2px_rgba(230,126,34,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(230,126,34,0.5)] bg-gradient-to-r from-primary via-[#e67e22] to-primary bg-[length:200%_auto] text-white border-none hover:bg-right hover:-translate-y-0.5 transition-all duration-500 active:scale-95 font-bold"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isWishlist ? t('wishlist.move_to_cart') : t('product.add')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <div className="premium-card h-full flex flex-col group-hover:border-primary/40 group-hover:-translate-y-2 transition-all duration-700">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={getProductImage() || riceImg}
            alt={name}
            onError={(e) => {
              e.currentTarget.src = riceImg;
            }}
            className="w-full h-full object-cover transition-transform duration-&lsqb;1.5s&rsqb; group-hover:scale-110"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {isOutOfStock && (
              <Badge variant="secondary" className="backdrop-blur-md bg-white/80 text-black font-black text-[10px] uppercase tracking-widest shadow-lg">{t('product.out_of_stock')}</Badge>
            )}
          </div>

          {/* Wishlist button */}
          {!isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-4 right-4 h-11 w-11 rounded-full backdrop-blur-md transition-all duration-500 z-10 active:scale-90",
                isWishlist
                  ? 'bg-black text-white hover:bg-black/80 shadow-lg'
                  : isInWishlist
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-white/40 text-foreground/70 hover:bg-white hover:text-primary'
              )}
              onClick={(e) => {
                if (isWishlist) {
                  e.preventDefault();
                  e.stopPropagation();
                  const wishlistItem = wishlist.find(item => item.productId === product.id);
                  if (wishlistItem) {
                    removeFromWishlist(wishlistItem.id);
                    toast.success(t('wishlist.removed_from_wishlist'));
                  }
                } else {
                  handleAddToWishlist(e);
                }
              }}
            >
              {isWishlist ? (
                <Trash2 className="h-5 w-5" />
              ) : (
                <Heart className={cn("h-5 w-5", isInWishlist && 'fill-current')} />
              )}
            </Button>
          )}

          {/* Quick add to cart overlay */}
          {!isAdmin && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <Button
                className="w-full font-bold h-10 rounded-xl border-none shadow-[0_5px_15px_-3px_rgba(230,126,34,0.4)] hover:shadow-[0_8px_20px_-3px_rgba(230,126,34,0.5)] bg-gradient-to-r from-primary via-[#e67e22] to-primary bg-[length:200%_auto] text-white hover:bg-right transition-all duration-500 group/btn active:scale-95"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
                {isWishlist ? t('wishlist.move_to_cart') : t('product.add_to_cart')}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 bg-white">
          <div className="flex items-center justify-between mb-2">
            {product.numReviews > 0 ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 rounded-lg">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span className="text-xs font-bold text-warning">{product.rating}</span>
              </div>
            ) : <div />}

            {/* Stock Pill - Grid Mode */}
            {isOutOfStock ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/20">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                <span className="text-[10px] font-bold text-destructive uppercase">Out of Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted border border-border/40">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  activeStock <= (product.lowStockThreshold || 10) ? 'bg-warning animate-pulse' : 'bg-accent'
                )} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{activeStock} left</span>
              </div>
            )}
          </div>

          <h3 className="font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-lg mb-2 flex-1 leading-tight">
            {name}
          </h3>

          {/* Weights as Chips - Grid Mode */}
          {product.availableWeights && product.availableWeights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {product.availableWeights.map((w) => {
                const wOutOfStock = (w.stock ?? 0) <= 0;
                return (
                  <button
                    key={w.weight}
                    onClick={(e) => handleWeightClick(e, w.weight)}
                    title={wOutOfStock ? 'Out of stock' : `${w.stock} left`}
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all active:scale-95",
                      selectedWeight === w.weight
                        ? wOutOfStock
                          ? "bg-destructive/10 text-destructive border-destructive/40 shadow-sm line-through"
                          : "bg-primary text-primary-foreground border-primary shadow-sm"
                        : wOutOfStock
                          ? "bg-white text-muted-foreground/40 border-border/30 line-through"
                          : "bg-white text-muted-foreground border-border/60 hover:border-primary/40"
                    )}
                  >
                    {w.weight}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-end justify-between gap-2 pt-2 border-t border-border/40">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground mb-1">
                {t('product.per').charAt(0).toUpperCase() + t('product.per').slice(1)} {formatPriceUnit(selectedWeight || product.unit)}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-primary">
                  ₹{discountedPrice.toFixed(0)}
                </span>
                {product.discount > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground/50 line-through decoration-destructive/50">
                      ₹{basePrice}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-[#e67e22] text-white shadow-[0_4px_12px_-2px_rgba(230,126,34,0.4)] hover:shadow-[0_6px_16px_-2px_rgba(230,126,34,0.5)] transition-all duration-300 md:hidden active:scale-90"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
