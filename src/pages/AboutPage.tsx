import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Wheat, HeartHandshake, Leaf, Truck, Shield } from 'lucide-react';
import riceBucket from '@/assets/our-mission.jpg'; // Using existing assets
import { useTranslation } from 'react-i18next';

const AboutPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-primary/5 py-10 md:py-14">
                <div className="container-custom text-center max-w-5xl mx-auto">
                    <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
                        {t('about.hero.title')}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        {t('about.hero.description')}
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="container-custom py-12 md:py-20">
                <div className="grid lg:grid-cols-[2fr_3fr] gap-12 items-center">
                    <div className="relative group">
                        <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3] h-64 md:h-80 lg:h-72 mx-auto max-w-sm">
                            <img src={riceBucket} alt="Rice Field" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                        </div>
                    </div>
                    <div>
                        <h2 className="font-serif text-3xl font-bold mb-6">{t('about.mission.title')}</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            {t('about.mission.description1')}
                        </p>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            {t('about.mission.description2')}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <span className="font-medium">{t('about.mission.features.natural')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <span className="font-medium">{t('about.mission.features.farmers')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <span className="font-medium">{t('about.mission.features.premium')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <span className="font-medium">{t('about.mission.features.prices')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-secondary/30 py-16">
                <div className="container-custom">
                    <h2 className="font-serif text-3xl font-bold text-center mb-12">{t('about.values.title')}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
                        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 pb-6 px-4 text-center h-full">
                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-base mb-2">{t('about.values.premium_title')}</h3>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    {t('about.values.premium_desc')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 pb-6 px-4 text-center h-full">
                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Wheat className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-base mb-2">{t('about.values.specialist_title')}</h3>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    {t('about.values.specialist_desc')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 pb-6 px-4 text-center h-full">
                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Truck className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-base mb-2">{t('about.values.delivery_title')}</h3>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    {t('about.values.delivery_desc')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 pb-6 px-4 text-center h-full">
                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HeartHandshake className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-base mb-2">{t('about.values.customer_title')}</h3>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    {t('about.values.customer_desc')}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-background border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="pt-6 pb-6 px-4 text-center h-full">
                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Leaf className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-base mb-2">{t('about.values.organic_title')}</h3>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    {t('about.values.organic_desc')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
