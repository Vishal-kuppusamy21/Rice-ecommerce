import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Phone, Clock, MapPin, LogOut, Package, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useStore } from '@/store/useStore';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';
import { LanguageSwitcher } from './LanguageSwitcher';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const {
    isAuthenticated,
    isAdmin,
    user,
    cart,
    wishlist,
    setAuthModalOpen,
    setAuthModalTab,
    searchQuery,
    setSearchQuery,
    categories,
    logout
  } = useStore();

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAuthClick = (tab: 'login' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all duration-300">
      {/* Top bar */}
      <div className="bg-primary/95 text-primary-foreground py-2 text-sm font-medium">
        <div className="container-custom flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity cursor-default">
              <Phone className="h-4 w-4" />
              {t('header.phone')}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity cursor-default">
              <Clock className="h-4 w-4" />
              {t('header.timing')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity cursor-default">
            <MapPin className="h-4 w-4" />
            <span>{t('header.location')}</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-14 w-14 rounded-full flex items-center justify-center p-1 overflow-hidden">
              <img src="/logo.png" alt="Shree Kumaravel Logo" className="h-full w-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif text-2xl font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
                {t('header.title')}
              </h1>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{t('header.subtitle')}</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder={t('header.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-14 py-3.5 text-base rounded-full border-2 border-border focus:border-primary transition-colors"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full h-9 w-9"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Mobile search toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-6 w-6" />
            </Button>

            {/* Wishlist */}
            {isAuthenticated && !isAdmin && (
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="icon">
                  <Heart className="h-6 w-6" />
                  {wishlist.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent">
                      {wishlist.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Cart */}
            {isAuthenticated && !isAdmin && (
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {cartItemsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <>
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-5 w-5" />
                        <span className="hidden lg:inline text-base">{t('header.admin')}</span>
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      {t('header.logout')}
                    </Button>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-5 w-5" />
                        <span className="hidden lg:inline text-base">{user?.firstName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate('/account/profile')}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>{t('header.my_profile')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/account/orders')}>
                        <Package className="mr-2 h-4 w-4" />
                        <span>{t('header.my_orders')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('header.logout')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthClick('login')}
                  className="hidden min-[380px]:inline-flex"
                >
                  {t('header.login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAuthClick('signup')}
                  className="hidden sm:inline-flex"
                >
                  {t('header.signup')}
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="mt-4 md:hidden animate-slide-down">
            <div className="relative">
              <Input
                type="text"
                placeholder={t('header.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 rounded-full"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t border-border bg-secondary/50">
        <div className="container-custom">
          <ul className={`
            ${isMenuOpen ? 'flex' : 'hidden'} lg:flex
            flex-col lg:flex-row
            items-start lg:items-center
            gap-1 lg:gap-8
            py-3
          `}>
            <li>
              <Link
                to="/"
                className="block py-2 px-3 lg:px-0 text-base font-semibold text-foreground hover:text-primary transition-colors"
              >
                {t('header.nav.home')}
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className="block py-2 px-3 lg:px-0 text-base font-semibold text-foreground hover:text-primary transition-colors"
              >
                {t('header.nav.all_products')}
              </Link>
            </li>
            <li>
              <Link
                to="/wholesale"
                className={cn(
                  "flex items-center gap-2 py-2 px-3 lg:px-0 text-base font-bold transition-all group",
                  location.pathname === '/wholesale' ? 'text-primary' : 'text-foreground hover:text-primary'
                )}
              >
                <span>{t('header.nav.wholesale')}</span>
                <Badge className="h-5 px-2 text-xs font-black animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform bg-accent text-accent-foreground shadow-glow border-none">
                  {t('wholesale.hot')}
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="block py-2 px-3 lg:px-0 text-base font-semibold text-foreground hover:text-primary transition-colors"
              >
                {t('header.nav.about')}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="block py-2 px-3 lg:px-0 text-base font-semibold text-foreground hover:text-primary transition-colors"
              >
                {t('header.nav.contact')}
              </Link>
            </li>

          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
