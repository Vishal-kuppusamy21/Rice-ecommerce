import React from 'react';
import { Truck, RotateCcw, ShieldCheck, HelpCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export const ShippingPage = () => (
    <div className="bg-background min-h-screen py-12">
        <div className="container-custom max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Truck className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Shipping and Payments Policy</h1>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border space-y-6 text-foreground/80">
                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">1. Delivery Area</h2>
                    <p>We currently deliver exclusively within <strong>Kangayam</strong>. We do not ship to other locations at this moment.</p>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">2. Delivery Charges</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Free Delivery:</strong> On all orders above ₹899.</li>
                        <li><strong>Delivery Fee:</strong> A flat fee of ₹50 applies to orders below ₹899.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">3. Delivery Speed</h2>
                    <p>Orders are delivered on the same day or the next working day.</p>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">3. Delivery Handling</h2>
                    <p>All deliveries are handled directly by our team to ensure timely and safe delivery.</p>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">4. Returns Pick-up</h2>
                    <p className="mb-4">All products are quality checked before dispatch.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>If you receive a defective product and want to return or exchange it within 7 days of delivery, you do not need to pay for reverse pick-up.</li>
                        <li>For returns or exchanges for other reasons, the customer is responsible for reverse pick-up costs, which will be arranged by us.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">5. Payment Gateway</h2>
                    <div className="flex items-center gap-4">
                        <p>We securely process payments through <strong>Razorpay</strong>.</p>
                        <img src="https://razorpay.com/assets/razorpay-logo-white.svg" alt="Razorpay" className="h-6 filter invert brightness-0" />
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export const ReturnsPage = () => (
    <div className="bg-background min-h-screen py-12">
        <div className="container-custom max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <RotateCcw className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Refund and Cancellation Policy</h1>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border space-y-6 text-foreground/80">
                <section>
                    <p>
                        At Shree Kumaravel, our focus is complete customer satisfaction. If you are not satisfied with the products received, we offer refunds or exchanges, provided the reasons are genuine and the product is returned in its original packaging. Please read each product’s description carefully before making a purchase.
                    </p>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">1. Cancellation Policy</h2>
                    <p className="mb-4">To cancel an order, please contact us with your Order ID via the <Link to="/contact" className="text-primary hover:underline font-medium">Contact Us</Link> link or WhatsApp.</p>
                    <p>Cancellations must be requested before the product is dispatched.</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <Link to="/contact?subject=Order%20Cancellation%20Request">
                            <Button className="w-full sm:w-auto px-6 py-5 text-base font-bold shadow-md hover:scale-105 transition-transform">
                                Contact via Form
                            </Button>
                        </Link>
                        <a
                            href="https://wa.me/919442426565?text=Hello%2C%20I%20would%20like%20to%20cancel%20my%20order.%20Order%20ID%3A%20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto"
                        >
                            <Button variant="outline" className="w-full sm:w-auto px-6 py-5 text-base font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 shadow-sm">
                                Contact via WhatsApp
                            </Button>
                        </a>
                    </div>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">2. Refund and Exchange Policy</h2>
                    <p className="mb-4">We strive to provide high-quality products to all customers.</p>
                    <p className="mb-4">If you are not satisfied with a product, you may request a refund or exchange within 7 days of delivery.</p>
                    <p className="mb-6">Returned products will be inspected at our warehouse, and the refund will be processed within 7 days after verification.</p>

                    <h3 className="font-bold text-foreground mb-3 text-lg">Eligibility:</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li><strong>Full refund / full exchange:</strong> Only for unopened products.</li>
                        <li><strong>Partial refund / partial exchange:</strong> For opened or used products, the refund will be calculated based on the weight of the product.</li>
                        <li><strong>Non-refundable / non-exchangeable:</strong> Spoiled, damaged, or misused products.</li>
                    </ul>

                    <h3 className="font-bold text-foreground mb-3 text-lg">Refund Method:</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li><strong>Online payments:</strong> Refunds will be issued to the original payment method. For Paytm payments, refunds will be credited to the same account.</li>
                        <li><strong>Cash payments:</strong> Refunds will be credited to your bank account.</li>
                    </ul>

                    <p className="font-medium text-foreground">For returns or exchanges, please contact us with your Order ID via the <Link to="/contact" className="text-primary hover:underline">Contact Us</Link> link or WhatsApp.</p>
                </section>
            </div>
        </div>
    </div>
);

export const ReturnPolicyPage = () => (
    <div className="bg-background min-h-screen py-12">
        <div className="container-custom max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <RotateCcw className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Return Policy</h1>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border space-y-6 text-foreground/80">
                <section>
                    <p>
                        At Shree Kumaravel, customer satisfaction is our priority. Please read our Return Policy carefully.
                    </p>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">1. Return Window</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Our refund and returns policy lasts 7 days from the date of delivery.</li>
                        <li>If more than 7 days have passed since your purchase, we cannot offer a full refund or exchange.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">2. Eligibility for Returns</h2>
                    <p className="mb-4">To be eligible for a return:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>The product must be unused and in the same condition as received.</li>
                        <li>It must be in its original packaging.</li>
                        <li>You must provide a receipt or proof of purchase.</li>
                    </ul>
                    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <p className="text-sm"><strong>Important:</strong> Please do not send products back to the manufacturer. Reverse pick-up will be arranged by us. You may need to pay for the reverse pick-up, but the cost will be reimbursed if the product is found defective after verification at our warehouse.</p>
                    </div>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">3. Partial Refunds</h2>
                    <p className="mb-4 text-foreground font-semibold">Partial refunds may be granted in the following situations:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>If you are not satisfied with the product quality after using it. The product will be weighed at our warehouse, and the refund amount will be calculated proportionately after deducting reverse pick-up costs.</li>
                        <li>Refunds are not applicable if the item is damaged, altered, or missing parts for reasons not due to our error.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">4. Refund Process</h2>
                    <p className="mb-4">Once your return is received and inspected, we will send you an email notification regarding the approval or rejection of your refund.</p>
                    <p className="mb-4">Approved refunds will be processed to your original payment method within 7 days.</p>

                    <div className="mt-6">
                        <h3 className="font-bold text-foreground mb-3">Late or Missing Refunds:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Check your bank account first.</li>
                            <li>Contact your credit card company or bank if the refund is delayed; processing times may vary.</li>
                            <li>If you still haven’t received your refund, contact us via the options below.</li>
                        </ul>
                    </div>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">5. Sale Items</h2>
                    <p>Only regular-priced items are eligible for a refund. Sale items cannot be refunded.</p>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">6. Exchanges</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>We replace items only if they are defective or damaged within 7 days of delivery.</li>
                        <li>The returned product will be weighed at our warehouse. Any difference in weight will be adjusted proportionately, and the customer must pay or receive the difference if applicable.</li>
                        <li>Replaced products will be delivered within 7 days (subject to stock availability).</li>
                    </ul>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">7. Shipping Returns</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>To return your product, request a reverse pick-up within 7 days of delivery.</li>
                        <li>You are responsible for reverse pick-up costs unless the product is defective.</li>
                        <li>Shipping costs are non-refundable unless the product is confirmed defective.</li>
                    </ul>
                </section>

                <hr className="border-border" />

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">8. Need Help?</h2>
                    <p className="text-lg font-bold mb-4 text-foreground">For returns or exchanges, contact us with your Order ID via the options below:</p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <Link to="/contact?subject=Return/Exchange%20Request">
                            <Button className="w-full sm:w-auto px-8 py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform">
                                Contact via Form
                            </Button>
                        </Link>
                        <a
                            href="https://wa.me/919442426565?text=Hello%2C%20I%20would%20like%20to%20request%20a%20return/exchange.%20Order%20ID%3A%20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto"
                        >
                            <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 shadow-md">
                                Contact via WhatsApp
                            </Button>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    </div>
);

export const FAQPage = () => (
    <div className="bg-background min-h-screen py-12">
        <div className="container-custom max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <HelpCircle className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Frequently Asked Questions</h1>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">Where do you deliver?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        We currently deliver our rice products only within Kangayam.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">What payment methods do you accept?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        We accept secure online payments through Razorpay, including UPI, Credit/Debit Cards, and Net Banking. Cash on Delivery (COD) is also available.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">How long does delivery take?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        Orders are usually delivered on the same day or the next working day, depending on the order time.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">What rice varieties do you sell?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        We offer premium quality rice varieties such as Ponni Rice, Basmati Rice, Brown Rice, Broken Rice, and traditional rice varieties.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">What pack sizes are available?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        Our rice products are available in 5 kg, 10 kg, and 25 kg packs.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">Do you provide wholesale orders?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        Yes, we accept wholesale and bulk orders for restaurants, retailers, and businesses.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">Can I return or exchange a product?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        If you receive a damaged or incorrect product, please contact us within 7 days of delivery for assistance.
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="border border-border px-4 rounded-lg bg-card">
                    <AccordionTrigger className="text-lg font-medium">How can I contact customer support?</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                        You can contact us through the Contact Us page on our website for any questions or support.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="mt-12 p-8 bg-secondary/20 rounded-xl text-center">
                <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
                <p className="text-muted-foreground mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                <Link to="/contact">
                    <Button>Contact Support</Button>
                </Link>
            </div>
        </div>
    </div>
);

export const PrivacyPage = () => (
    <div className="bg-background min-h-screen py-12">
        <div className="container-custom max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Privacy Policy</h1>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border space-y-6 text-foreground/80">
                <p className="text-sm text-muted-foreground">Last Updated: March 5, 2026</p>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us when you place an order or contact us. This may include:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Name</li>
                        <li>Mobile number</li>
                        <li>Email address (if provided)</li>
                        <li>Delivery address</li>
                        <li>Order details</li>
                    </ul>
                    <p className="mt-4">Payment information, if applicable, is processed securely through trusted payment partners. We do not store your payment details.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
                    <p>We use the information collected to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Process and deliver your orders</li>
                        <li>Communicate with you regarding order status and support</li>
                        <li>Improve our services and customer experience</li>
                    </ul>
                    <p className="mt-4">We contact customers only for service-related purposes unless promotional communication is explicitly opted into.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">3. Data Security</h2>
                    <p>We take reasonable and appropriate measures to protect your personal information. Our website uses secure technologies to safeguard data transmission. However, no online platform can guarantee complete security.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">4. Third-Party Sharing</h2>
                    <p>We do not sell or rent your personal information. We may share limited information only with trusted third parties such as:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Delivery partners for order fulfillment</li>
                        <li>Payment gateways for transaction processing</li>
                        <li>Technical service providers for website maintenance</li>
                    </ul>
                    <p className="mt-4">All third parties are required to handle your data responsibly.</p>
                </section>
            </div>
        </div>
    </div>
);

export const TermsPage = () => (
    <div className="bg-background min-h-screen py-12">
        <div className="container-custom max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-6 w-6" />
                </div>
                <h1 className="font-serif text-3xl font-bold">Terms & Conditions</h1>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border space-y-6 text-foreground/80">
                <p className="text-sm text-muted-foreground">Last Updated: March 5, 2026</p>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
                    <p>These Terms & Conditions govern the use of the website operated by Shree Kumaravel Modern Rice Mill (“We”, “Us”, “Our”). By accessing or using this website, you agree to be bound by these terms.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">2. Use of Website</h2>
                    <p>This website is intended to provide information about our rice products and services. You agree to use the website only for lawful purposes and in a manner that does not violate applicable laws or regulations.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">3. Product Information</h2>
                    <p>We make every effort to display accurate product details, pricing, and availability. However, prices and availability are subject to change without prior notice.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">4. Orders & Payments</h2>
                    <p>Orders placed through the website are subject to acceptance and availability. Payments, if applicable, are processed securely through third-party payment gateways. We do not store payment card details.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">5. Delivery</h2>
                    <p>Delivery services are currently available only within Kangayam and nearby areas, as mentioned on the website. Delivery timelines may vary based on location and order volume.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">6. Returns & Refunds</h2>
                    <p>Returns or exchanges are accepted only as per our Returns & Refund Policy. Please review the policy before placing an order.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">7. Intellectual Property</h2>
                    <p>All content on this website, including text, logos, images, and design, is the property of Shree Kumaravel Modern Rice Mill and may not be copied or used without written permission.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">8. Limitation of Liability</h2>
                    <p>We shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or our products.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">9. External Links</h2>
                    <p>Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of those websites.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">10. Changes to Terms</h2>
                    <p>We reserve the right to update or modify these Terms & Conditions at any time. Changes will be effective once posted on the website.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-foreground mb-3">11. Contact Information</h2>
                    <p className="mb-4">For any questions regarding these Terms & Conditions, please contact:</p>
                    <div className="bg-secondary/20 p-6 rounded-lg space-y-2">
                        <p className="font-bold">Shree Kumaravel Modern Rice Mill</p>
                        <p>Kangayam, Tamil Nadu</p>
                        <p>📞 Phone: 9442426565, 9443281822</p>
                        <p>📧 Email: info.shreekumaravel@gmail.com</p>
                    </div>
                </section>
            </div>
        </div>
    </div>
);
