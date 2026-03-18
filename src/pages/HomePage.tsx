import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Leaf, Gem, PackageCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import heroImage from '@/assets/hero-rice.jpg';
import riceCategory from '@/assets/rice-category.jpg';
import milletsCategory from '@/assets/millets-category.jpg';
import pulsesCategory from '@/assets/pulses-category.jpg';
import rawCategory from '@/assets/raw-category.jpg';
import healthyCategory from '@/assets/healthy-category.jpg';
import economyCategory from '@/assets/economy-category.jpg';
import traditionalCategory from '@/assets/traditional-category.jpg';
import ProductCard from '@/components/product/ProductCard';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';

const HomePage = () => {
  const { products, categories, setAuthModalOpen } = useStore();
  const { t, i18n } = useTranslation();

  const featuredProducts = products.slice(0, 8);
  
  // Mapping categories to their specific images
  const categoryImages: Record<string, string> = {
    'Traditional Rice': traditionalCategory,
    'Raw Rice': rawCategory,
    'Economy Rice': economyCategory,
    'Healthy Rice': healthyCategory,
  };

  const getCategoryImage = (category: any) => {
    // Check by name first as it's more reliable for this specific request
    const name = category.name;
    return categoryImages[name] || categoryImages[category.id] || riceCategory;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Premium Rice"
            className="w-full h-full object-cover scale-100 animate-slow-zoom opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float hidden lg:block" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float hidden lg:block" style={{ animationDelay: '2s' }} />

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-md rounded-full text-primary border border-primary/20 text-xs font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in">
              <Leaf className="h-4 w-4" />
              {t('home.hero.badge')}
            </div>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.95] tracking-tight animate-slide-up">
              <span className="text-foreground">{t('home.hero.title_prefix')}</span>
              <span className="block text-gradient mt-4">{t('home.hero.title_suffix')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
              {t('home.hero.description')}
            </p>
            <div className="flex flex-wrap gap-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <Link to="/products">
                <Button size="xl" className="gap-3 shadow-glow text-lg rounded-2xl px-10 btn-premium group">
                  {t('home.hero.shop_btn')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="xl" className="rounded-2xl text-lg px-10 border-primary/20 hover:bg-primary/5 transition-all">
                  {t('home.hero.story_btn')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-card border-y border-border/50 relative z-10 -mt-8 mx-auto max-w-7xl rounded-2xl shadow-strong">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: Truck, title: t('home.features.express_delivery'), desc: t('home.features.free_above'), color: 'text-primary' },
              { icon: Leaf, title: t('home.features.natural'), desc: t('home.features.natural_pure'), color: 'text-accent' },
              { icon: Shield, title: t('home.features.quality_assured'), desc: t('home.features.quality_desc'), color: 'text-primary' },
              { icon: Gem, title: t('home.features.premium'), desc: t('home.features.premium_desc'), color: 'text-accent' },
              { icon: PackageCheck, title: t('home.features.freshly_packed'), desc: t('home.features.fresh_desc'), color: 'text-primary' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-default">
                <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                  <feature.icon className={`h-6 w-6 ${feature.color} group-hover:text-primary-foreground transition-colors`} />
                </div>
                <div>
                  <h4 className="font-bold text-xs tracking-tight">{feature.title}</h4>
                  <p className="text-[10px] leading-tight text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3 block">{t('home.categories.badge')}</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                {t('home.categories.title')}
              </h2>
            </div>
            <p className="text-muted-foreground text-lg italic max-w-sm">
              {t('home.categories.quote')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => {
              const name = getLocalizedContent(category, 'name', i18n.language);
              const description = getLocalizedContent(category, 'description', i18n.language);

              return (
                <Link
                  key={category.id || index}
                  to={`/products?category=${category.id}`}
                  className="group relative h-[450px] overflow-hidden rounded-[2rem] shadow-medium hover:shadow-strong transition-all duration-700 animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <img
                    src={getCategoryImage(category)}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent group-hover:via-foreground/40 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-serif text-3xl font-bold text-primary-foreground mb-3">{name}</h3>
                    <p className="text-sm text-primary-foreground/70 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                      {description}
                    </p>
                    <Button variant="hero-outline" size="icon" className="h-12 w-12 rounded-full border-primary-foreground/50 group-hover:bg-primary group-hover:border-primary">
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-secondary/30">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                {t('home.featured.title')}
              </h2>
              <p className="text-muted-foreground">
                {t('home.featured.subtitle')}
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="hidden sm:inline-flex gap-2">
                {t('home.featured.view_all')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/products">
              <Button variant="outline" className="gap-2">
                {t('home.featured.view_all')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
              {t('home.why_choose.title')}
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              {t('home.why_choose.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-5 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/5 transition-all hover:bg-primary-foreground/15">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 shrink-0">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-base mb-1.5">{t('home.why_choose.trusted_title')}</h3>
              <p className="text-[13px] text-primary-foreground/80 leading-snug">
                {t('home.why_choose.trusted_desc')}
              </p>
            </div>
            <div className="text-center p-5 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/5 transition-all hover:bg-primary-foreground/15">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 shrink-0">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-base mb-1.5">{t('home.why_choose.experience_title')}</h3>
              <p className="text-[13px] text-primary-foreground/80 leading-snug">
                {t('home.why_choose.experience_desc')}
              </p>
            </div>
            <div className="text-center p-5 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/5 transition-all hover:bg-primary-foreground/15">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3 shrink-0">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-base mb-1.5">{t('home.why_choose.quality_title')}</h3>
              <p className="text-[13px] text-primary-foreground/80 leading-snug">
                {t('home.why_choose.quality_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container-custom">
          <div className="bg-secondary rounded-3xl p-8 md:p-12 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              {t('home.cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="px-8 btn-premium">
                  {t('home.cta.get_touch')}
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg" className="px-8 border-primary/20 hover:bg-primary/5">
                  {t('home.cta.browse_rice')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
