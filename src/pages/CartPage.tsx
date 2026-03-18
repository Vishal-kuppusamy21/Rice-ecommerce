import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { getImageUrl, cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';
import { formatPriceUnit } from '@/utils/format';

import riceImg from '@/assets/rice-category.jpg';
import milletsImg from '@/assets/millets-category.jpg';
import pulsesImg from '@/assets/pulses-category.jpg';

const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, isAuthenticated } = useStore();
  const { t, i18n } = useTranslation();

  const validCart = cart.filter(item => item.product);

  const getProductImage = (categoryId: string, image?: string) => {
    const imageUrl = getImageUrl(image);
    if (imageUrl) return imageUrl;
    if (categoryId === '1') return riceImg;
    if (categoryId === '2') return milletsImg;
    return pulsesImg;
  };

  const calculateSubtotal = () => {
    return validCart.reduce((total, item) => {
      const activeWeight = item.product.availableWeights?.find(w => w.weight === item.selectedWeight);
      const basePrice = activeWeight ? activeWeight.price : (item.product.availableWeights?.[0]?.price || 0);
      return total + basePrice * item.quantity;
    }, 0);
  };

  const calculateDiscount = () => {
    return validCart.reduce((total, item) => {
      if (item.product.discount) {
        const activeWeight = item.product.availableWeights?.find(w => w.weight === item.selectedWeight);
        const basePrice = activeWeight ? activeWeight.price : (item.product.availableWeights?.[0]?.price || 0);
        return total + (basePrice * item.product.discount / 100) * item.quantity;
      }
      return total;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const discountedSubtotal = subtotal - discount;
  const deliveryFee = subtotal > 899 ? 0 : 50;
  const total = discountedSubtotal + deliveryFee;

  const handleQuantityChange = (cartItemId: string, newQuantity: number, maxQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      toast.success('Item removed from cart');
    } else if (newQuantity > maxQuantity) {
      toast.error(t('product_details.only_left', { count: maxQuantity, unit: '' }));
    } else {
      updateCartQuantity(cartItemId, newQuantity);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('cart.login_title')}</h1>
          <p className="text-muted-foreground mb-4">{t('cart.login_desc')}</p>
          <Link to="/">
            <Button>{t('cart.go_home')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (validCart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('cart.empty_title')}</h1>
          <p className="text-muted-foreground mb-4">{t('cart.empty_desc')}</p>
          <Link to="/products">
            <Button>{t('cart.browse_products')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* Header */}
      <div className="py-12 md:py-16 bg-muted/20 relative">
        <div className="container-custom flex flex-col md:block items-center justify-center gap-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Cart</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground capitalize">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">cart</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-12 md:py-20">
        <div className="flex justify-end mb-6 -mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearCart();
              toast.success("Cart cleared");
            }}
            className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/5 uppercase tracking-widest rounded-sm"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cart
          </Button>
        </div>
        <div className="overflow-x-auto border rounded-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-6 w-16"></th>
                <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-foreground border-l">PRODUCT</th>
                <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-foreground border-l">PRICE</th>
                <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-foreground border-l">QUANTITY</th>
                <th className="p-6 text-center text-xs font-bold uppercase tracking-widest text-foreground border-l">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {validCart.map((item) => {
                const activeWeight = item.product.availableWeights?.find(w => w.weight === item.selectedWeight);
                const basePrice = activeWeight ? activeWeight.price : (item.product.availableWeights?.[0]?.price || 0);
                const discountedPrice = item.product.discount
                  ? basePrice - (basePrice * item.product.discount / 100)
                  : basePrice;

                return (
                  <tr key={item.id} className="border-b last:border-b-0 hover:bg-muted/5 transition-colors">
                    <td className="p-6 text-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-black transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="p-6 border-l">
                      <div className="flex items-center gap-6">
                        <Link to={`/product/${item.product.id}`} className="shrink-0 w-24 aspect-square bg-muted overflow-hidden rounded-sm">
                          <img
                            src={getProductImage(item.product.categoryId, item.product.image)}
                            alt={getLocalizedContent(item.product, 'name', i18n.language)}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="text-left font-medium">
                          <Link to={`/product/${item.product.id}`} className="block text-[15px] text-foreground hover:text-primary transition-colors mb-1">
                            {getLocalizedContent(item.product, 'name', i18n.language)}
                          </Link>
                          {item.selectedWeight && (
                            <p className="text-sm text-muted-foreground">
                              Size: <span className="ml-2 font-medium text-foreground">{item.selectedWeight}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center border-l font-medium text-foreground">
                      Rs. {discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-center border-l">
                      <div className="inline-flex items-center justify-center gap-6 text-muted-foreground">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.product.quantity)}
                          className="hover:text-black transition-colors disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-foreground font-medium tabular-nums">
                          {item.quantity.toString().padStart(2, '0')}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.product.quantity)}
                          disabled={item.quantity >= item.product.quantity}
                          className="hover:text-black transition-colors disabled:opacity-30"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-6 text-center border-l font-medium text-foreground">
                      Rs. {(discountedPrice * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 px-1">
          <Link to="/products">
            <Button variant="default" className="bg-black text-white hover:bg-black/90 h-14 px-10 text-[13px] font-bold uppercase tracking-widest rounded-sm transition-all shadow-none">
              CONTINUE SHOPPING
            </Button>
          </Link>
        </div>

        {/* Summary */}
        <div className="mt-16 flex justify-end">
          <div className="w-full max-w-sm border p-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">Rs. {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-green-600">-Rs. {discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-foreground">
                {deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            <div className="flex justify-between items-baseline border-t pt-4 mt-2">
              <span className="text-xl font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">Rs. {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <Link to="/checkout" className="block w-full pt-4">
              <Button className="w-full h-14 text-[13px] font-bold uppercase tracking-widest rounded-sm">
                PROCEED TO CHECKOUT
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
