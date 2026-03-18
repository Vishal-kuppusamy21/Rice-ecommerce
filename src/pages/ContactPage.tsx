import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
    const [searchParams] = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: searchParams.get('subject') || '',
        message: ''
    });

    useEffect(() => {
        const subject = searchParams.get('subject');
        if (subject) {
            setFormData(prev => ({ ...prev, subject }));
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Use our robust backend API instead of direct EmailJS
            const { api } = await import('@/lib/api');
            await api.sendBulkEnquiry(formData);

            toast.success("Message received successfully! We'll get back to you soon.");
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        } catch (error: any) {
            console.error('Contact Error:', error);
            toast.error('Failed to send message. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-4xl font-bold mb-4">{t('contact.title')}</h1>
                        <p className="text-muted-foreground text-lg">
                            {t('contact.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="font-bold text-xl mb-4">{t('contact.get_in_touch')}</h3>
                                <p className="text-muted-foreground mb-6">
                                    {t('contact.get_in_touch_desc')}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('contact.store_address')}</h4>
                                        <p className="text-muted-foreground">
                                            {t('footer.address_line1')}<br />
                                            {t('footer.address_line2')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('contact.phone')}</h4>
                                        <p className="text-muted-foreground">{t('header.phone')}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('contact.email')}</h4>
                                        <p className="text-muted-foreground">info@shreekumaravel.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{t('contact.business_hours')}</h4>
                                        <p className="text-muted-foreground">{t('contact.business_hours_val')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card p-8 rounded-xl border border-border shadow-sm">
                            <h3 className="font-bold text-xl mb-6">{t('contact.send_message')}</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('contact.form.name')}</Label>
                                        <Input
                                            id="name"
                                            placeholder={t('contact.form.name')}
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                                        <Input
                                            id="phone"
                                            placeholder={t('contact.form.phone')}
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('contact.form.email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t('contact.form.email')}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                                    <Input
                                        id="subject"
                                        placeholder={t('contact.form.subject')}
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">{t('contact.form.message')}</Label>
                                    <Textarea
                                        id="message"
                                        placeholder={t('contact.form.message')}
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={4}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        t('contact.form.sending')
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {t('contact.form.send_btn')} <Send className="h-4 w-4" />
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

export default ContactPage;
