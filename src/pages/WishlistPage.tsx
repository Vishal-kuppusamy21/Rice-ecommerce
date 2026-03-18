import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { cn, getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';
import { formatPriceUnit } from '@/utils/format';

import riceImg from '@/assets/rice-category.jpg';
import milletsImg from '@/assets/millets-category.jpg';
import pulsesImg from '@/assets/pulses-category.jpg';

import ProductCard from '@/components/product/ProductCard';

const WishlistPage = () => {
  const { wishlist, isAuthenticated, clearWishlist } = useStore();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const validWishlist = wishlist.filter(item => item.product);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('wishlist.login_title')}</h1>
          <p className="text-muted-foreground mb-4">{t('wishlist.login_desc')}</p>
          <Link to="/">
            <Button>{t('cart.go_home')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('wishlist.empty_title')}</h1>
          <p className="text-muted-foreground mb-4">{t('wishlist.empty_desc')}</p>
          <Link to="/products">
            <Button>{t('cart.browse_products')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-12 bg-white">
        <div className="container-custom text-center">
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-2 font-medium">
            ~ {t('wishlist.title')} ~
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Your Favourite Product
          </h1>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-border/40 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground mr-2">{validWishlist.length} Items</span>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/40">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'grid' ? "bg-white shadow-soft text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewMode === 'list' ? "bg-white shadow-soft text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Clear Wishlist */}
            <Button
              variant="outline"
              className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
              onClick={() => {
                clearWishlist();
                toast.success('Wishlist cleared');
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className={cn(
          "grid gap-4 md:gap-6",
          viewMode === 'grid'
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
        )}>
          {validWishlist.map((item) => (
            <div key={item.id} className="animate-fade-in">
              <ProductCard product={item.product} viewMode={viewMode} isWishlist={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
