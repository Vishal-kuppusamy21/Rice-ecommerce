import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useStore } from '@/store/useStore';
import { toast } from 'sonner';
import { Address } from '@/types';
import { api } from '@/lib/api';
import { cn, getImageUrl } from '@/lib/utils';
import riceImg from '@/assets/rice-category.jpg';

import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';
  const { cart, buyNowItem, clearBuyNowItem, clearCart, removeFromCart, addOrder, isAuthenticated, user } = useStore();
  const { t, i18n } = useTranslation();

  // Determine checkout items
  const checkoutItems = (isBuyNow && buyNowItem) ? [buyNowItem] : cart.filter(item => item.product);
  const validCart = checkoutItems; // Backwards compatibility for existing logic

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | 'paypal' | 'cod'>('cod');
  const [confirmedTotal, setConfirmedTotal] = useState<number | null>(null);

  const handlePaymentSuccess = async (details: any) => {
    setIsLoading(true);
    try {
      await addOrder({
        user: user?.id || 'guest',
        orderItems: validCart.map(item => {
          const activeWeight = item.product.availableWeights?.find(w => w.weight === item.selectedWeight);
          const basePrice = activeWeight ? activeWeight.price : (item.product.availableWeights?.[0]?.price || 0);
          const finalPrice = item.product.discount
            ? basePrice - (basePrice * item.product.discount / 100)
            : basePrice;
          return {
            name: `${item.product.name} (${item.selectedWeight || item.product.unit})`,
            qty: item.quantity,
            image: item.product.image,
            price: finalPrice,
            product: item.product.id || (item.product as any)._id,
          };
        }),
        totalPrice: total,
        isPaid: true,
        isDelivered: false,
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: deliveryFee,
        status: 'confirmed',
        paymentMethod,
        paymentResult: {
          id: details.razorpay_payment_id,
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: user?.email || '',
        },
        paymentStatus: 'completed',
        shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
      } as any); // Type assertion to bypass strict Omit checks if needed, but structure is now correct

      setConfirmedTotal(total);
      if (isBuyNow) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      setStep(3);
      toast.success('Order placed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };


  // Helper to map UserAddress to form Address
  const mapSavedAddress = (addr: any): Address => ({
    fullName: user?.firstName + ' ' + user?.lastName || '',
    phone: user?.phoneNumber || '',
    addressLine1: addr.street || '',
    addressLine2: '',
    city: addr.city || '',
    state: addr.state || 'Tamil Nadu',
    pincode: addr.postalCode || '',
  });

  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  const [billingAddress, setBillingAddress] = useState<Address>(
    defaultAddress ? mapSavedAddress(defaultAddress) : {
      fullName: user?.firstName + ' ' + user?.lastName || '',
      phone: user?.phoneNumber || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
    }
  );

  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
  });

  // Calculate totals
  const subtotal = validCart.reduce((total, item) => {
    const activeWeight = item.product.availableWeights?.find(w => w.weight === item.selectedWeight);
    const basePrice = activeWeight ? activeWeight.price : (item.product.availableWeights?.[0]?.price || 0);
    const price = item.product.discount
      ? basePrice - (basePrice * item.product.discount / 100)
      : basePrice;
    return total + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 899 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!billingAddress.fullName.trim() || !billingAddress.phone.trim() || !billingAddress.addressLine1.trim() ||
      !billingAddress.city.trim() || !billingAddress.pincode.trim() || !billingAddress.state.trim()) {
      toast.error('Please fill in all required billing address fields');
      return;
    }

    if (billingAddress.phone.replace(/\D/g, '').length !== 10) {
      toast.error('Please enter a valid 10-digit phone number for billing');
      return;
    }

    if (billingAddress.pincode.replace(/\D/g, '').length !== 6) {
      toast.error('Please enter a valid 6-digit pincode for billing');
      return;
    }

    if (!sameAsBilling) {
      if (!shippingAddress.fullName.trim() || !shippingAddress.phone.trim() || !shippingAddress.addressLine1.trim() ||
        !shippingAddress.city.trim() || !shippingAddress.pincode.trim() || !shippingAddress.state.trim()) {
        toast.error('Please fill in all required shipping address fields');
        return;
      }

      if (shippingAddress.phone.replace(/\D/g, '').length !== 10) {
        toast.error('Please enter a valid 10-digit phone number for shipping');
        return;
      }

      if (shippingAddress.pincode.replace(/\D/g, '').length !== 6) {
        toast.error('Please enter a valid 6-digit pincode for shipping');
        return;
      }
    }

    if (sameAsBilling) {
      setShippingAddress(billingAddress);
    }

    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      if (paymentMethod === 'cod') {
        await addOrder({
          user: user?.id || 'guest',
          orderItems: validCart.map(item => {
            const activeWeight = item.product.availableWeights?.find(w => w.weight === item.selectedWeight);
            const basePrice = activeWeight ? activeWeight.price : (item.product.availableWeights?.[0]?.price || 0);
            const finalPrice = item.product.discount
              ? basePrice - (basePrice * item.product.discount / 100)
              : basePrice;
            return {
              name: `${item.product.name} (${item.selectedWeight || item.product.unit})`,
              qty: item.quantity,
              image: item.product.image,
              price: finalPrice,
              product: item.product.id || (item.product as any)._id,
              selectedWeight: item.selectedWeight || item.product.unit,
            };
          }),
          totalPrice: total,
          itemsPrice: subtotal,
          taxPrice: 0,
          shippingPrice: deliveryFee,
          status: 'confirmed',
          paymentMethod,
          paymentStatus: 'pending',
          billingAddress,
          shippingAddress: sameAsBilling ? billingAddress : shippingAddress,
        } as any);

        setConfirmedTotal(total);
        if (isBuyNow) {
          clearBuyNowItem();
        } else {
          clearCart();
        }
        setStep(3);
        toast.success('Order placed successfully!');
        setIsLoading(false);
      } else if (paymentMethod === 'razorpay') {
        const data = await api.processPayment({ method: 'razorpay', amount: total }, (user as any).token);

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: "Shree Kumaravel",
          description: "Purchase Transaction",
          order_id: data.id,
          handler: function (response: any) {
            handlePaymentSuccess(response);
          },
          prefill: {
            name: billingAddress.fullName,
            email: user?.email,
            contact: billingAddress.phone
          },
          theme: {
            color: "#D97706"
          }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.open();
        setIsLoading(false); // Modal is open, so stop loading

        rzp1.on('payment.failed', function (response: any) {
          toast.error(response.error.description);
          setIsLoading(false);
        });
      } else {
        toast.info("This payment method is not implemented yet. Please choose Razorpay or COD.");
        setIsLoading(false);
      }
    } catch (error: any) {
      if (error.message && error.message.includes('Product not found:')) {
        const productName = error.message.split('Product not found: ')[1];
        if (productName) {
          const badItem = cart.find(i => i.product.name === productName);
          if (badItem) {
            removeFromCart(badItem.id);
            toast.error(`Removed unavailable item: ${productName}. Please place your order again.`);
            setIsLoading(false);
            return;
          }
        }
      }
      toast.error(error.message || 'Payment initiation failed');
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('checkout.login_title')}</h1>
          <Link to="/">
            <Button>{t('cart.go_home')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (validCart.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('cart.empty_title')}</h1>
          <Link to="/products">
            <Button>{t('cart.browse_products')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Order Success
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <CheckCircle className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-4">{t('checkout.order_confirmed')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('checkout.order_confirmed_desc')}
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">{t('checkout.order_total')}</p>
            <p className="text-2xl font-bold text-primary">₹{(confirmedTotal ?? total).toFixed(0)}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/products">
              <Button className="w-full">{t('cart.continue_shopping')}</Button>
            </Link>
            <Link to="/account/orders">
              <Button variant="outline" className="w-full">{t('checkout.view_orders')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Processing Overlay
  if (isLoading && step !== 3) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all animate-fade-in">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <Truck className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t('checkout.processing_title')}</h2>
        <p className="text-muted-foreground">{t('checkout.processing_desc')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-secondary/50 py-12 border-b border-border/40">
        <div className="container-custom">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 hover:bg-primary/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
            {t('checkout.back')}
          </Button>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
            {t('checkout.title')}
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-6 max-w-lg">
            <div className={`flex items-center gap-3 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-soft ${step >= 1 ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted'
                }`}>
                1
              </div>
              <span className="font-bold uppercase tracking-wider text-xs">{t('checkout.address_step')}</span>
            </div>
            <div className="flex-1 h-0.5 bg-border/60 rounded-full" />
            <div className={`flex items-center gap-3 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-soft ${step >= 2 ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted'
                }`}>
                2
              </div>
              <span className="font-bold uppercase tracking-wider text-xs">{t('checkout.payment_step')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <form onSubmit={handleAddressSubmit} className="space-y-8 animate-slide-up">
                {/* Billing Address */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-soft">
                  <h2 className="font-bold text-xl mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Truck className="h-5 w-5" />
                      </div>
                      {t('checkout.billing_address')}
                    </div>
                  </h2>

                  {/* Saved Addresses Section */}
                  {user?.addresses && user.addresses.length > 0 && (
                    <div className="mb-8 p-4 bg-muted/30 rounded-2xl border border-dashed border-border/60">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 block">
                        {t('checkout.use_saved_address') || 'Quick Select Saved Address'}
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.addresses.map((addr, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBillingAddress(mapSavedAddress(addr))}
                            className="text-left p-3 rounded-xl border bg-white hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold uppercase text-primary">{addr.type}</span>
                              {addr.isDefault && <CheckCircle className="h-3 w-3 text-accent" />}
                            </div>
                            <p className="text-xs font-bold text-foreground line-clamp-1">{addr.street}</p>
                            <p className="text-[10px] text-muted-foreground">{addr.city}, {addr.postalCode}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.full_name')} *</Label>
                      <Input
                        id="fullName"
                        className="h-12 rounded-xl"
                        value={billingAddress.fullName}
                        onChange={(e) => setBillingAddress({ ...billingAddress, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.phone')} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        className="h-12 rounded-xl"
                        value={billingAddress.phone}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                          setBillingAddress({ ...billingAddress, phone: val });
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine1" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.address_line1')} *</Label>
                      <Input
                        id="addressLine1"
                        className="h-12 rounded-xl"
                        value={billingAddress.addressLine1}
                        onChange={(e) => setBillingAddress({ ...billingAddress, addressLine1: e.target.value })}
                        placeholder="House/Flat No., Building Name"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine2" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.address_line2')}</Label>
                      <Input
                        id="addressLine2"
                        className="h-12 rounded-xl"
                        value={billingAddress.addressLine2}
                        onChange={(e) => setBillingAddress({ ...billingAddress, addressLine2: e.target.value })}
                        placeholder="Street, Locality"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.city')} *</Label>
                      <Input
                        id="city"
                        className="h-12 rounded-xl"
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.state')} *</Label>
                      <Input
                        id="state"
                        className="h-12 rounded-xl"
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.pincode')} *</Label>
                      <Input
                        id="pincode"
                        className="h-12 rounded-xl"
                        value={billingAddress.pincode}
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                          setBillingAddress({ ...billingAddress, pincode: val });
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-soft">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-bold text-xl">{t('checkout.shipping_address')}</h2>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <Checkbox
                        checked={sameAsBilling}
                        className="rounded-md border-2"
                        onCheckedChange={(checked) => setSameAsBilling(!!checked)}
                      />
                      <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">{t('checkout.same_as_billing')}</span>
                    </label>
                  </div>

                  {!sameAsBilling && (
                    <div className="grid md:grid-cols-2 gap-6 animate-slide-down">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.full_name')} *</Label>
                        <Input
                          className="h-12 rounded-xl"
                          value={shippingAddress.fullName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.phone')} *</Label>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          className="h-12 rounded-xl"
                          value={shippingAddress.phone}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                            setShippingAddress({ ...shippingAddress, phone: val });
                          }}
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.address_line1')} *</Label>
                        <Input
                          className="h-12 rounded-xl"
                          value={shippingAddress.addressLine1}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.address_line2')}</Label>
                        <Input
                          className="h-12 rounded-xl"
                          value={shippingAddress.addressLine2}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.city')} *</Label>
                        <Input
                          className="h-12 rounded-xl"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.state')} *</Label>
                        <Input
                          className="h-12 rounded-xl"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('checkout.pincode')} *</Label>
                        <Input
                          className="h-12 rounded-xl"
                          value={shippingAddress.pincode}
                          inputMode="numeric"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                            setShippingAddress({ ...shippingAddress, pincode: val });
                          }}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-glow transition-all active:scale-[0.98]" size="lg">
                  {t('checkout.continue_payment')}
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-slide-up">
                {/* Payment Method */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-soft">
                  <h2 className="font-bold text-xl mb-8 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    {t('checkout.payment_method')}
                  </h2>

                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className={cn(
                        "flex flex-col gap-3 p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300",
                        paymentMethod === 'cod' ? "border-primary bg-primary/5 shadow-soft" : "border-border/60 hover:border-primary/30"
                      )}>
                        <div className="flex items-center justify-between">
                          <RadioGroupItem value="cod" />
                          <span className="text-[10px] font-black uppercase tracking-widest bg-accent/20 text-accent px-2 py-1 rounded-md">{t('checkout.recommended')}</span>
                        </div>
                        <div>
                          <p className="font-black text-lg">{t('checkout.cod')}</p>
                          <p className="text-xs text-muted-foreground font-medium">{t('checkout.cod_desc')}</p>
                        </div>
                      </label>

                      <label className={cn(
                        "flex flex-col gap-3 p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300",
                        paymentMethod === 'razorpay' ? "border-primary bg-primary/5 shadow-soft" : "border-border/60 hover:border-primary/30"
                      )}>
                        <RadioGroupItem value="razorpay" />
                        <div>
                          <p className="font-black text-lg">{t('checkout.razorpay')}</p>
                          <p className="text-xs text-muted-foreground font-medium">{t('checkout.razorpay_desc')}</p>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Address Summary */}
                <div className="bg-card rounded-3xl p-8 border border-border shadow-soft relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Truck className="h-20 w-20" />
                  </div>
                  <h2 className="font-bold text-xl mb-4">{t('checkout.delivery_address')}</h2>
                  <div className="space-y-1">
                    <p className="font-black text-foreground text-lg mb-1">{billingAddress.fullName}</p>
                    <p className="text-muted-foreground font-medium">{billingAddress.addressLine1}</p>
                    {billingAddress.addressLine2 && <p className="text-muted-foreground font-medium">{billingAddress.addressLine2}</p>}
                    <p className="text-muted-foreground font-medium">{billingAddress.city}, {billingAddress.state} - {billingAddress.pincode}</p>
                    <p className="text-primary font-bold mt-2">Mobile: {billingAddress.phone}</p>
                  </div>
                  <Button variant="link" className="p-0 h-auto mt-4 text-primary font-bold hover:no-underline hover:text-primary/80 transition-colors" onClick={() => setStep(1)}>
                    {t('checkout.change_address')} →
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-14 rounded-2xl font-bold flex-1">
                    {t('checkout.back')}
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isLoading} className="h-14 rounded-2xl font-bold flex-1 shadow-glow" size="lg">
                    {isLoading ? t('checkout.processing') : t('checkout.place_order')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-strong sticky top-32">
              <h2 className="font-bold text-xl mb-6">{t('cart.order_summary')}</h2>

              <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {validCart.map((item) => {
                  const activeWeight = item.product.availableWeights?.find(w => w.weight === item.selectedWeight);
                  const basePrice = activeWeight ? activeWeight.price : (item.product.availableWeights?.[0]?.price || 0);
                  const price = item.product.discount
                    ? basePrice - (basePrice * item.product.discount / 100)
                    : basePrice;
                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden shrink-0">
                        <img src={getImageUrl(item.product.image) || riceImg} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-bold text-foreground line-clamp-1 truncate">{getLocalizedContent(item.product, 'name', i18n.language)}</p>
                          <span className="text-sm font-black text-primary">₹{(price * item.quantity).toFixed(0)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase">{item.quantity} x {item.selectedWeight || item.product.unit}</span>
                          <div className="h-1 w-1 rounded-full bg-border" />
                          <span className="text-[10px] text-muted-foreground font-bold italic">₹{price.toFixed(0)}/unit</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 pt-6 border-t border-border/60">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{t('cart.subtotal')}</span>
                  <span className="text-foreground">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{t('cart.delivery')}</span>
                  <span className="text-foreground">{deliveryFee === 0 ? t('cart.free') : `₹${deliveryFee}`}</span>
                </div>
                <div className="pt-4 mt-2 border-t-2 border-dashed border-border/60">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-lg uppercase tracking-tighter">{t('cart.total')}</span>
                    <div className="text-right">
                      <span className="block text-3xl font-black text-primary tracking-tighter leading-none">₹{total.toFixed(0)}</span>
                      <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Order Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
