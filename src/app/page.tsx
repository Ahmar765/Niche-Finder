
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Bot, Compass, FileText, Sparkles, TrendingUp, Zap, LineChart, GanttChartSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { WebappPopup } from '@/components/webapp-popup';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const SectionHeader = ({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) => (
  <div className="mx-auto max-w-3xl text-center">
    <div className="text-xs uppercase tracking-[0.24em] text-primary/70">{eyebrow}</div>
    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">{title}</h2>
    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
  </div>
);

const statBlocks = [
    { value: "< 5 Minutes", label: "Average time from initial search to a validated, investor-grade niche idea." },
    { value: "3x Faster", label: "Venture planning and financial modeling compared to traditional research methods." },
    { value: "12,500+", label: "Founders and entrepreneurs actively building with Niche Finder outputs." },
    { value: "95%", label: "Of generated niche reports are deemed 'investor-ready' by our validation models." },
];

const whatYouGetItems = [
    { 
        title: 'Autonomous Opportunity Discovery', 
        description: 'Discover high-potential niches with data-backed scores and deep market insights.', 
        icon: Sparkles 
    },
    { 
        title: 'Automated Financial Modeling', 
        description: 'Instantly generate 3-year financial forecasts and cashflow projections for any niche.', 
        icon: LineChart 
    },
    { 
        title: 'Generative Investor Documents', 
        description: 'Produce professional business plans, financial models, and pitch decks automatically.', 
        icon: FileText 
    },
    { 
        title: 'Intelligent Execution Planning', 
        description: 'Turn strategy into action with AI-powered, step-by-step execution roadmaps.', 
        icon: GanttChartSquare 
    },
];

const howItWorksSteps = [
    { step: 1, title: 'Search', description: 'Enter your preferences and let our system find the best opportunities.', icon: Compass },
    { step: 2, title: 'Results', description: 'Explore top opportunities ranked by our proprietary scoring model.', icon: TrendingUp },
    { step: 3, title: 'Analyze', description: 'Generate financial models and validate profitability instantly.', icon: Bot },
    { step: 4, title: 'Create', description: 'Download investor-ready documents and pitch with confidence.', icon: FileText },
];

export default function HomePage() {
  const sectionMotion = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: 'easeOut' as const },
  };

  const homepageImage = PlaceHolderImages.find(img => img.id === 'investor-financial-dashboard');

  return (
    <div className="w-full bg-[#040b16] text-white">
      <WebappPopup />
      <main>
        <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32">
          <div
            className="absolute -top-48 left-1/2 -translate-x-1/2"
            style={{
              width: "150%",
              height: "800px",
              background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsla(var(--primary), 0.15), transparent)",
            }}
          />
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-4xl text-center"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Venture Creation OS</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                The Operating System for Venture Creation
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                From market signal to investor-ready venture — powered by an autonomous venture intelligence system that discovers, validates, and builds your next business.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" className="rounded-2xl bg-primary px-8 text-primary-foreground hover:bg-primary/90" asChild>
                  <Link href="/signup">Find My Opportunity</Link>
                </Button>
                <Button size="lg" variant="ghost" className="group rounded-2xl px-8 text-white hover:bg-transparent" asChild>
                  <Link href="/how-it-works">
                    How it Works <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
               <p className="mt-8 text-sm text-slate-400">
                Trusted by 12,500+ founders and entrepreneurs
              </p>
            </motion.div>

            {homepageImage && (
              <motion.div {...sectionMotion} className="mt-16 flow-root sm:mt-24">
                  <div className="relative -m-2 rounded-xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                      src={homepageImage.imageUrl}
                      alt={homepageImage.description}
                      width={2432}
                      height={1442}
                      data-ai-hint={homepageImage.imageHint}
                      className="rounded-md shadow-2xl ring-1 ring-slate-900/10"
                      priority
                  />
                  </div>
              </motion.div>
            )}
          </div>
        </section>

        <section id="what-you-get" className="py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div {...sectionMotion}>
                    <SectionHeader
                        eyebrow="WHAT YOU GET"
                        title="An End-to-End Venture OS"
                        description="Our platform gives you everything you need to go from idea to a validated, fundable venture."
                    />
                </motion.div>
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {whatYouGetItems.map((item) => (
                        <motion.div key={item.title} {...sectionMotion}>
                            <Card className="h-full rounded-[28px] border-white/10 bg-white/[0.03] text-white shadow-xl shadow-black/20 text-center">
                                <CardContent className="p-8">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                        <item.icon className="h-6 w-6"/>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <section id="how-it-works" className="py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                 <motion.div {...sectionMotion}>
                    <SectionHeader
                        eyebrow="How The System Operates"
                        title="From Idea to Investor-Ready — In Minutes"
                        description="Our OS streamlines the entire venture creation process, turning your initial spark into a fundable business plan with unprecedented speed."
                    />
                </motion.div>
                <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {howItWorksSteps.map((item) => (
                        <motion.div key={item.step} {...sectionMotion}>
                            <Card className="h-full rounded-[28px] border-white/10 bg-white/[0.03] text-white shadow-xl shadow-black/20">
                                <CardContent className="p-8">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                                        <item.icon className="h-6 w-6"/>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                                    <p className="mt-2 text-sm text-slate-400">{item.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <motion.div {...sectionMotion}>
              <SectionHeader
                eyebrow="ONE OPPORTUNITY. MULTIPLE OUTPUTS."
                title="Built for execution. Not ideas."
                description="Each project provides a full suite of investor-ready assets. Move from validation to fundraising with structured, professional documents generated in minutes."
              />
            </motion.div>
            <motion.div {...sectionMotion}>
              <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-[#081220] to-[#040b16] p-6 shadow-2xl shadow-black/30">
                <div className="absolute inset-x-12 top-8 h-20 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-lg">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Layer 01</div>
                  <div className="mt-2 text-lg font-semibold">Opportunity Validation</div>
                </div>
                <div className="absolute inset-x-16 top-28 h-20 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5 shadow-lg">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Layer 02</div>
                  <div className="mt-2 text-lg font-semibold">Financial Modeling</div>
                </div>
                <div className="absolute inset-x-20 top-48 h-20 rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-5 shadow-lg">
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Layer 03</div>
                  <div className="mt-2 text-lg font-semibold">Business Plan</div>
                </div>
                <div className="relative mt-64 rounded-3xl border border-primary/20 bg-primary/10 px-6 py-5 shadow-xl">
                  <div className="text-xs uppercase tracking-[0.22em] text-primary/70">Layer 04</div>
                  <div className="mt-2 text-lg font-semibold text-primary">Investor Pitch Deck</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="proof" className="border-y border-white/10 bg-white/[0.02] py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div {...sectionMotion}>
              <SectionHeader
                eyebrow="Operating proof"
                title="Trust built through measurable structure"
                description="No inflated claims. No synthetic testimonials. The proof comes from how quickly the platform converts exploration into decision-grade outputs."
              />
            </motion.div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {statBlocks.map((item) => (
                <motion.div key={item.label} {...sectionMotion}>
                  <Card className="rounded-[28px] border-white/10 bg-white/[0.03] text-white shadow-xl shadow-black/20">
                    <CardContent className="p-6">
                      <Sparkles className="mb-5 h-5 w-5 text-primary" />
                      <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
                      <div className="mt-3 text-sm leading-6 text-slate-400">{item.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <motion.div {...sectionMotion} className="rounded-[36px] border border-white/10 bg-gradient-to-r from-[#091224] via-[#0b1730] to-[#08111f] p-8 shadow-2xl shadow-black/30 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-primary/70">Final call</div>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Your Next Venture Is Waiting.</h3>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">No guesswork. Just execution. Choose the niche, structure the model, and move with outputs that look ready for serious conversations.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button size="lg" className="rounded-2xl bg-primary px-8 text-primary-foreground hover:bg-primary/90" asChild>
                    <Link href="/search">Start Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl border-white/10 bg-white/5 px-8 text-white hover:bg-white/10" asChild>
                    <Link href="/how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
