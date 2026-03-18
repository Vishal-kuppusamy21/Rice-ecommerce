import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Search, Filter, X, ChevronDown, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/product/ProductCard';
import { useStore } from '@/store/useStore';
import { SortOption } from '@/types';
import { useTranslation } from 'react-i18next';
import { getLocalizedContent } from '@/utils/i18nHelper';

interface FilterContentProps {
    categories: any[];
    filters: any;
    handleCategoryToggle: (id: string) => void;
    handleSubcategoryToggle: (id: string) => void;
    relevantSubcategories: any[];
    setFilters: (filters: any) => void;
    setPage: (page: number) => void;
    clearFilters: () => void;
    activeFiltersCount: number;
    t: any;
    i18n: any;
    localPriceRange: [number, number];
    setLocalPriceRange: (range: [number, number]) => void;
}

const FilterContent = ({
    categories,
    filters,
    handleCategoryToggle,
    handleSubcategoryToggle,
    relevantSubcategories,
    setFilters,
    setPage,
    clearFilters,
    activeFiltersCount,
    t,
    i18n,
    localPriceRange,
    setLocalPriceRange
}: FilterContentProps) => {
    // Local string state to handle "empty" input during typing without losing state
    const [minStr, setMinStr] = useState(localPriceRange[0].toString());
    const [maxStr, setMaxStr] = useState(localPriceRange[1].toString());

    // Sync strings when localPriceRange changes (e.g. from slider)
    useEffect(() => {
        setMinStr(localPriceRange[0].toString());
        setMaxStr(localPriceRange[1].toString());
    }, [localPriceRange]);

    const handleMinChange = (val: string) => {
        setMinStr(val);
        const num = parseInt(val) || 0;
        setLocalPriceRange([num, localPriceRange[1]]);
    };

    const handleMaxChange = (val: string) => {
        setMaxStr(val);
        const num = parseInt(val) || 0;
        setLocalPriceRange([localPriceRange[0], num]);
    };

    return (
        <div className="space-y-6">
            {/* Categories */}
            <div>
                <h4 className="font-semibold mb-3">{t('products_page.categories')}</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {categories.map(category => (
                        <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={filters.categories.includes(category.id)}
                                onCheckedChange={() => handleCategoryToggle(category.id)}
                            />
                            <span className="text-sm">{getLocalizedContent(category, 'name', i18n.language)}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Subcategories */}
            {relevantSubcategories.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-3">{t('products_page.subcategories')}</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        {relevantSubcategories.map(sub => (
                            <label key={sub.id} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={filters.subcategories.includes(sub.id)}
                                    onCheckedChange={() => handleSubcategoryToggle(sub.id)}
                                />
                                <span className="text-sm">{getLocalizedContent(sub, 'name', i18n.language)}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Range - theRiceStore Style */}
            <div>
                <div className="flex flex-col gap-1 mb-6">
                    <h4 className="font-bold text-xs tracking-widest text-foreground uppercase">{t('products_page.filter_by_price')}</h4>
                    <div className="h-[2px] w-8 bg-border" />
                </div>

                <div className="space-y-6">
                    {/* Slider */}
                    <div className="px-2">
                        <Slider
                            value={localPriceRange}
                            min={0}
                            max={10000}
                            step={10}
                            onValueChange={(value) => {
                                setLocalPriceRange(value as [number, number]);
                            }}
                            className="mb-2"
                        />
                    </div>

                    {/* TWO OPTIONS: START AND END PRICE */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                                {t('products_page.price_start')}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={minStr}
                                    onChange={(e) => handleMinChange(e.target.value)}
                                    className="pl-6 h-9 text-xs font-bold focus-visible:ring-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                                {t('products_page.price_end')}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">₹</span>
                                <Input
                                    type="number"
                                    value={maxStr}
                                    onChange={(e) => handleMaxChange(e.target.value)}
                                    className="pl-6 h-9 text-xs font-bold focus-visible:ring-1"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-[#666] hover:bg-[#444] text-white font-bold text-[10px] rounded-full px-5 h-8 transition-all active:scale-95"
                            onClick={() => {
                                setFilters({ priceRange: localPriceRange });
                                setPage(1);
                            }}
                        >
                            {t('products_page.filter')}
                        </Button>

                        <div className="text-muted-foreground font-medium text-[11px] whitespace-nowrap">
                            <span className="opacity-70 uppercase tracking-tighter">{t('products_page.price_label')}</span>
                            <span className="ml-1 text-foreground font-bold italic">
                                ₹{localPriceRange[0]} — ₹{localPriceRange[1]}
                            </span>
                        </div>
                    </div>
                </div>
            </div>



            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                    {t('products_page.clear_all_filters')}
                </Button>
            )}
        </div>
    );
};

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const { products, categories, searchQuery, setSearchQuery, filters, setFilters, sortBy, setSortBy, page, pages, setPage, fetchProducts } = useStore();
    const { t, i18n } = useTranslation();

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(filters.priceRange);

    // Sync local price range when filters change (e.g. on clear)
    useEffect(() => {
        setLocalPriceRange(filters.priceRange);
    }, [filters.priceRange]);

    // Get initial category from URL
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');

    // Initial sync from URL (only once or when URL changes?)
    // Actually, store state should drive the URL, or URL drive store?
    // Let's make URL drive store on mount/change.

    useEffect(() => {
        if (urlSearch && urlSearch !== searchQuery) setSearchQuery(urlSearch);
        if (urlCategory) {
            // If URL has category, set it in store if not present
            if (!filters.categories.includes(urlCategory)) {
                setFilters({ categories: [urlCategory] });
            }
        }
    }, [urlCategory, urlSearch]);

    // Fetch products when Store State changes
    useEffect(() => {
        fetchProducts();
        // Since we fetch on filter change, we should reset page to 1 if filters change (except page itself)
        // But useStore's fetchProducts reads 'page'.
        // We need to handle page reset logic.
        // It's better if `setFilters` resets page to 1 in store? - No, `setFilters` is simple setter.
        // We can do it here: if filters changed, setPage(1).
        // Too complex to track previous filters.
        // Let's assume user calls setPage(1) when changing filters in handlers.
    }, [filters, sortBy, page, searchQuery]); // Dependencies logic slightly risky if fetchProducts updates them?? 
    // No, fetchProducts updates 'products', 'page' (from server response), 'pages'. 
    // It reads 'filters', 'sortBy'.
    // Safe.


    // Handlers
    const handleCategoryToggle = (categoryId: string) => {
        const newCategories = filters.categories.includes(categoryId)
            ? filters.categories.filter(c => c !== categoryId)
            : [...filters.categories, categoryId];

        setFilters({ categories: newCategories, subcategories: [] });
        setPage(1);
    };

    const handleSubcategoryToggle = (subcategoryId: string) => {
        const newSubcategories = filters.subcategories.includes(subcategoryId)
            ? filters.subcategories.filter(s => s !== subcategoryId)
            : [...filters.subcategories, subcategoryId];

        setFilters({ subcategories: newSubcategories });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            categories: [],
            subcategories: [],
            priceRange: [0, 500],
        });
        setSearchQuery('');
        setSearchParams({});
        setPage(1);
    };

    const activeFiltersCount =
        filters.categories.length +
        filters.subcategories.length +
        (filters.priceRange[0] > 0 || filters.priceRange[1] < 500 ? 1 : 0);

    // Get relevant subcategories
    const relevantSubcategories = categories
        .filter(c => filters.categories.length === 0 || filters.categories.includes(c.id))
        .flatMap(c => c.subcategories);







    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-secondary/50 py-8">
                <div className="container-custom">
                    <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {urlCategory && categories.find(c => c.id === urlCategory)
                            ? getLocalizedContent(categories.find(c => c.id === urlCategory), 'name', i18n.language)
                            : t('products_page.all_products')}
                    </h1>
                    <p className="text-muted-foreground">
                        {products.length} {t('products_page.products_found')}
                    </p>
                </div>
            </div>

            <div className="container-custom py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-32 bg-card rounded-xl p-6 border border-border max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                            <h3 className="font-semibold text-lg mb-4">{t('products_page.filters')}</h3>
                            <FilterContent
                                categories={categories}
                                filters={filters}
                                handleCategoryToggle={handleCategoryToggle}
                                handleSubcategoryToggle={handleSubcategoryToggle}
                                relevantSubcategories={relevantSubcategories}
                                setFilters={setFilters}
                                setPage={setPage}
                                clearFilters={clearFilters}
                                activeFiltersCount={activeFiltersCount}
                                t={t}
                                i18n={i18n}
                                localPriceRange={localPriceRange}
                                setLocalPriceRange={setLocalPriceRange}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('products_page.search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10"
                                />
                            </div>

                            {/* Mobile Filter Button */}
                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden gap-2">
                                        <Filter className="h-4 w-4" />
                                        Filters
                                        {activeFiltersCount > 0 && (
                                            <Badge className="ml-1">{activeFiltersCount}</Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80">
                                    <SheetHeader>
                                        <SheetTitle>{t('products_page.filters')}</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-4">
                                        <FilterContent
                                            categories={categories}
                                            filters={filters}
                                            handleCategoryToggle={handleCategoryToggle}
                                            handleSubcategoryToggle={handleSubcategoryToggle}
                                            relevantSubcategories={relevantSubcategories}
                                            setFilters={setFilters}
                                            setPage={setPage}
                                            clearFilters={clearFilters}
                                            activeFiltersCount={activeFiltersCount}
                                            t={t}
                                            i18n={i18n}
                                            localPriceRange={localPriceRange}
                                            setLocalPriceRange={setLocalPriceRange}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Sort */}
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('products_page.sort_by')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">{t('products_page.sort.newest')}</SelectItem>
                                    <SelectItem value="price-asc">{t('products_page.sort.price_asc')}</SelectItem>
                                    <SelectItem value="price-desc">{t('products_page.sort.price_desc')}</SelectItem>
                                    <SelectItem value="name-asc">{t('products_page.sort.name_asc')}</SelectItem>
                                    <SelectItem value="name-desc">{t('products_page.sort.name_desc')}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* View Toggle */}
                            <div className="hidden sm:flex items-center border border-border rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="icon-sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="icon-sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFiltersCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="text-sm text-muted-foreground">{t('products_page.active_filters')}</span>
                                {filters.categories.map(catId => {
                                    const cat = categories.find(c => c.id === catId);
                                    return cat ? (
                                        <Badge key={catId} variant="secondary" className="gap-1">
                                            {getLocalizedContent(cat, 'name', i18n.language)}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => handleCategoryToggle(catId)}
                                            />
                                        </Badge>
                                    ) : null;
                                })}
                                {filters.subcategories.map(subId => {
                                    const sub = relevantSubcategories.find(s => s.id === subId);
                                    return sub ? (
                                        <Badge key={subId} variant="secondary" className="gap-1">
                                            {getLocalizedContent(sub, 'name', i18n.language)}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => handleSubcategoryToggle(subId)}
                                            />
                                        </Badge>
                                    ) : null;
                                })}

                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    {t('products_page.clear_all')}
                                </Button>
                            </div>
                        )}

                        {/* Products Grid */}
                        {products.length > 0 ? (
                            <>
                                <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid'
                                    ? 'grid-cols-2 md:grid-cols-3'
                                    : 'grid-cols-1'
                                    }`}>
                                    {products.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="animate-fade-in"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            <ProductCard product={product} viewMode={viewMode} />
                                        </div>
                                    ))}
                                </div>

                                {pages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                        >
                                            {t('products_page.previous')}
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                                                <Button
                                                    key={p}
                                                    variant={page === p ? 'default' : 'ghost'}
                                                    size="sm"
                                                    onClick={() => setPage(p)}
                                                    className="w-8"
                                                >
                                                    {p}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(Math.min(pages, page + 1))}
                                            disabled={page === pages}
                                        >
                                            {t('products_page.next')}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-lg text-muted-foreground mb-4">{t('products_page.no_products_found')}</p>
                                <Button variant="outline" onClick={clearFilters}>
                                    {t('products_page.clear_filters')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
