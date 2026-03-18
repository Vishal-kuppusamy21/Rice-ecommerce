import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';

import { Package, Truck, BadgePercent, Building2, Send, CheckCircle2 } from 'lucide-react';

const WholesalePage = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.target as HTMLFormElement;

        const enquiryData = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
            business_name: (form.elements.namedItem('business_name') as HTMLInputElement).value,
            quantity: (form.elements.namedItem('quantity') as HTMLInputElement).value,
            message: (form.elements.namedItem('requirement') as HTMLTextAreaElement).value,
            subject: 'Wholesale Enquiry'
        };

        try {
            // Use our backend API which handles both DB storage and EmailJS with Private Key
            await api.sendBulkEnquiry(enquiryData);

            toast.success("Enquiry received successfully! Our team will contact you shortly.");
            form.reset();
        } catch (error: any) {
            console.error('Enquiry Error:', error);
            toast.error('Failed to send enquiry. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-32 bg-primary text-primary-foreground overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://raw.githubusercontent.com/sengottuvel-dev/rice-hub-assets/main/wholesale_rice_bg.jpg"
                        alt="Wholesale Rice Trading"
                        className="w-full h-full object-cover scale-100 animate-slow-zoom opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
                </div>
                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 text-xs font-bold uppercase tracking-[0.2em] mb-8 animate-fade-in">
                            <Building2 className="h-4 w-4" />
                            B2B & Wholesale Division
                        </div>
                        <h1 className="font-serif text-5xl md:text-8xl font-black mb-8 animate-slide-up leading-[0.9]">
                            {t('wholesale.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-primary-foreground/90 mb-0 animate-slide-up font-medium leading-relaxed max-w-2xl" style={{ animationDelay: '100ms' }}>
                            {t('wholesale.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="container-custom py-20">
                <div className="grid lg:grid-cols-2 gap-20">
                    {/* Left: Info & Benefits */}
                    <div className="space-y-16">
                        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <h2 className="text-4xl font-serif font-bold mb-6 text-foreground tracking-tight">{t('wholesale.why_title')}</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                {t('wholesale.why_desc')}
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                            <div className="p-8 bg-card rounded-[2rem] border border-border/40 shadow-soft transition-all duration-500 hover:shadow-strong hover:-translate-y-1 group">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                                    <BadgePercent className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-foreground">{t('wholesale.competitive_pricing')}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{t('wholesale.competitive_pricing_desc')}</p>
                            </div>

                            <div className="p-8 bg-card rounded-[2rem] border border-border/40 shadow-soft transition-all duration-500 hover:shadow-strong hover:-translate-y-1 group">
                                <div className="h-14 w-14 rounded-2xl bg-secondary/20 text-secondary-foreground flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-500 group-hover:rotate-6">
                                    <Package className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-foreground">{t('wholesale.quality_assurance')}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{t('wholesale.quality_assurance_desc')}</p>
                            </div>

                            <div className="p-8 bg-card rounded-[2rem] border border-border/40 shadow-soft transition-all duration-500 hover:shadow-strong hover:-translate-y-1 group">
                                <div className="h-14 w-14 rounded-2xl bg-accent/20 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 group-hover:rotate-6">
                                    <Truck className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-foreground">{t('wholesale.flexible_logistics')}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{t('wholesale.flexible_logistics_desc')}</p>
                            </div>

                            <div className="p-8 bg-card rounded-[2rem] border border-border/40 shadow-soft transition-all duration-500 hover:shadow-strong hover:-translate-y-1 group">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                                    <Building2 className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-foreground">{t('wholesale.b2b_support')}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{t('wholesale.b2b_support_desc')}</p>
                            </div>
                        </div>

                        <div className="p-10 bg-secondary/20 rounded-[2.5rem] border border-secondary transition-all hover:bg-secondary/30">
                            <h4 className="font-bold text-xl mb-6 flex items-center gap-3 text-foreground">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                </div>
                                {t('wholesale.variety_highlights')}
                            </h4>
                            <ul className="grid grid-cols-2 gap-x-8 gap-y-4 text-base text-muted-foreground font-bold italic">
                                {(t('wholesale.varieties', { returnObjects: true }) as string[]).map((variety, index) => (
                                    <li key={index}>• {variety}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Enquiry Form */}
                    <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                        <div className="bg-card/70 backdrop-blur-xl p-10 md:p-14 rounded-[3.5rem] border border-white/20 shadow-strong sticky top-32 group hover:shadow-glow transition-all duration-700">
                            <div className="mb-12">
                                <h2 className="text-3xl font-serif font-bold mb-3 text-foreground tracking-tight">{t('wholesale.enquiry_title')}</h2>
                                <p className="text-muted-foreground font-medium">{t('wholesale.enquiry_subtitle')}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-primary mb-2 block">{t('wholesale.form.name')}</Label>
                                        <Input id="name" name="name" placeholder="John Doe" required className="h-14 rounded-2xl bg-background/50 border-2 focus:border-primary transition-all text-lg shadow-inner-soft" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t('wholesale.form.phone')}</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder="9876543210"
                                            required
                                            className="rounded-xl"
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="[0-9]{10}"
                                            maxLength={10}
                                            onKeyDown={(e) => {
                                                if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                                            }}
                                            onChange={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                            }}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Enter 10 digit mobile number without any symbols</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('wholesale.form.email')}</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@example.com" required className="rounded-xl shadow-inner-soft" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="business_name">{t('wholesale.form.business')}</Label>
                                    <Input id="business_name" name="business_name" placeholder="E.g., Star Enterprises" required className="rounded-xl shadow-inner-soft" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quantity">{t('wholesale.form.quantity')}</Label>
                                    <Input id="quantity" name="quantity" placeholder="E.g., 500kg per month" required className="rounded-xl shadow-inner-soft" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="requirement">{t('wholesale.form.requirements')}</Label>
                                    <Textarea
                                        id="requirement"
                                        name="requirement"
                                        placeholder="List the varieties and quantities you're interested in..."
                                        rows={4}
                                        required
                                        className="rounded-xl shadow-inner-soft resize-none"
                                    />
                                </div>

                                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-glow transition-all active:scale-[0.98]" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        t('wholesale.form.processing')
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {t('wholesale.form.submit')} <Send className="h-5 w-5" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesalePage;
