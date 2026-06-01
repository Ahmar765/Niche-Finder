
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { submitContactForm } from '@/backend/actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';


const contactFormSchema = z.object({
    fullName: z.string().min(1, "Full name is required."),
    email: z.string().email("Please enter a valid email address."),
    enquiryType: z.string().min(1, "Please select an inquiry type."),
    message: z.string().min(10, "Message must be at least 10 characters long."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            enquiryType: "",
            message: "",
        },
    });

    async function onSubmit(data: ContactFormValues) {
        setIsSubmitting(true);
        try {
            const result = await submitContactForm(data);
            if (result.error) {
                throw new Error(result.error);
            }
            toast.success('Message Sent!', {
                description: "Thank you for contacting us. We'll get back to you shortly.",
            });
            form.reset();
        } catch (error: any) {
            toast.error('Submission Failed', {
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }


  return (
    <article className="prose prose-invert prose-lg max-w-4xl mx-auto prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground">
      <h1>Contact Us</h1>
      <p className="lead">
        We’re here to help. Whether you have a question about our platform, a billing inquiry, or a partnership proposal, please reach out using the options below.
      </p>

      <Card className="my-8 not-prose">
        <CardHeader>
          <CardTitle>Send Us a Message</CardTitle>
          <CardDescription>
            This is the most efficient way to reach the right team. We aim to respond to all inquiries within one business day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
               <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="enquiryType"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                       <FormLabel>Inquiry Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a topic..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="general">General Question</SelectItem>
                                <SelectItem value="support">Technical Support</SelectItem>
                                <SelectItem value="billing">Billing & ACU Wallet</SelectItem>
                                <SelectItem value="partnership">Partnership or Business Inquiry</SelectItem>
                                <SelectItem value="privacy">Privacy & Data Inquiry</SelectItem>
                            </SelectContent>
                        </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Message</FormLabel>
                      <FormControl><Textarea rows={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             <div className="sm:col-span-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit
                </Button>
            </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <section>
        <h2>Contact Details</h2>
        <p>
            For specific inquiries, you can also email us directly.
        </p>
        <ul>
            <li><strong>General & Support Enquiries:</strong> <a href="mailto:support@nichefinder.io">support@nichefinder.io</a></li>
            <li><strong>Business & Partnership Enquiries:</strong> <a href="mailto:business@nichefinder.io">business@nichefinder.io</a></li>
            <li><strong>Data & Privacy Enquiries:</strong> <a href="mailto:privacy@nichefinder.io">privacy@nichefinder.io</a></li>
        </ul>
      </section>

      <section>
        <h2>Our Commitment</h2>
        <p>
          We value your feedback and questions. Our team is committed to providing timely and helpful responses. Please note that we cannot provide business, financial, or legal advice. For support requests, please be as detailed as possible about the issue you are facing, including any relevant niche or session IDs.
        </p>
      </section>
      
      <section>
        <h2>Registered Address</h2>
        <p>
            Niche Finder Ltd.
            <br />
            71-75 Shelton Street, Covent Garden
            <br />
            London, United Kingdom
            <br />
            WC2H 9JQ
        </p>
      </section>
    </article>
  );
}
