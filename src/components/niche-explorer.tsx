
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, Briefcase, Building, HandCoins, CircleHelp, Layers, Lightbulb, Loader2, MapPin, Monitor, Search, SlidersHorizontal, Sparkles, Store, Wrench, LayoutGrid, Zap, Target, ArrowUpRight } from 'lucide-react';

import { countries } from '@/shared/countries';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { NicheDetailView } from '@/components/niche-detail-view';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { useUser } from '@/firebase/auth/use-user';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { useLocale } from '@/i18n';
import { generateNicheIdeas } from '@/backend/actions';
import type { Recommendation, SearchRequest } from '@nichefinder/domain-types';
import { ScoreBadge } from './ui/score-badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { getCurrencySettings } from '@/config/currencyConfig';

// --- CUSTOM SVG ICONS ---
const CloudCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 13 2 2 4-4"/>
  </svg>
);

const FormSchema = z.object({
  discoveryMode: z.enum(['no_idea', 'around_me', 'skills_based', 'budget_based', 'problem_based', 'trend_based', 'boring_business']).optional(),
  businessGoal: z.enum(['micro_cashflow', 'investor_startup']).default('investor_startup'),
  searchPriority: z.enum(['standard', 'high_profit', 'low_competition', 'breakthrough', 'balanced']).default('balanced'),
  country: z.string({
    required_error: 'Please select a country.',
  }),
  city: z.string().optional(),
  sectors: z.array(z.string()).max(3, { message: "You can select up to 3 sectors." }).optional().default([]),
  businessType: z.enum(['digital', 'non_digital', 'boring_business', 'hybrid', 'any']).default('any'),
  maxInvestment: z.number().min(500).max(10000).default(10000),
  context: z.string().max(260, { message: "Context must be 260 characters or less." }).optional(),
  isInvestorMode: z.boolean().default(false),
  experienceLevel: z.enum(["beginner", "intermediate", "experienced", "expert"]).default("beginner"),
  fundingGoal: z.enum(["self_funded", "grant", "loan", "angel_investment", "vc_investment", "not_sure"]).default("self_funded"),
  timeline: z.enum(["start_immediately", "within_30_days", "within_90_days", "within_6_months", "research_only"]).default("research_only"),
  preferredModel: z.enum(["recurring_revenue", "high_margin", "low_startup_cost", "local_demand", "scalable", "cashflow_stable", "any"]).default("any"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const discoveryModeOptions = [
    { id: 'no_idea', title: 'I have no idea', subtitle: 'Best for beginners. The OS will guide you.', icon: Lightbulb },
    { id: 'around_me', title: 'Around Me', subtitle: 'Find opportunities in your local area.', icon: MapPin },
    { id: 'skills_based', title: 'From My Skills', subtitle: 'Turn your existing skills into a business.', icon: Wrench },
    { id: 'problem_based', title: 'From a Problem', subtitle: 'Solve a real-world problem you\'ve noticed.', icon: CircleHelp },
    { id: 'boring_business', title: 'Boring Businesses', subtitle: 'Focus on practical, cashflow-first businesses.', icon: Building },
    { id: 'budget_based', title: 'From My Budget', subtitle: 'Find ideas that fit what you can afford.', icon: HandCoins },
];

const sectorGroups = [
    { name: 'Primary', sectors: ["Agribusiness & Forestry", "Fishing & Aquaculture", "Infrastructure Supporting Agriculture & Mining", "Mining & Quarrying", "Oil & Gas Extraction"] },
    { name: 'Secondary', sectors: ["Bulk Storage & Warehousing", "Construction", "Construction Consultancy", "Cost Management", "Design Management", "Energy Utilities", "Manufacturing", "Renewable Energy", "Social Infrastructure", "Transmission & Distribution", "Transportation Infrastructure"] },
    { name: 'Tertiary', sectors: ["Creative Industries", "Digital Marketing", "Education", "Estate Agency", "Financial Institutions", "Food Delivery", "Graphic Design", "Health", "Hospitality & Tourism", "Logistics & Supply Chain", "Public-Private Partnerships", "Retail & Property", "Trade & Supply Chain Finance"] },
    { name: 'Quaternary', sectors: ["AI-Powered Services", "Data & Analytics", "Fintech", "Information Technology", "Research & Development", "Software & SaaS", "Venture Capital & Funds"] },
    { name: 'Quinary', sectors: ["Executive Management", "Government & Public Policy", "High-Level Consulting", "NGOs & Development Programs"] }
];

const businessTypeUIConfig = {
  options: [
    { id: 'digital', title: 'Digital', subtitle: 'Online, SaaS, apps, AI', icon: Monitor },
    { id: 'non_digital', title: 'Non-Digital', subtitle: 'Physical, local, service', icon: Store },
    { id: 'boring_business', title: 'Boring Business', subtitle: 'High-demand, cashflow-focused', icon: Briefcase },
    { id: 'hybrid', title: 'Hybrid', subtitle: 'Physical + Digital systems', icon: Layers },
    { id: 'any', title: 'Any', subtitle: 'System recommended', icon: Sparkles },
  ],
};

const searchPriorityUIConfig = {
  options: [
    { id: 'standard', title: 'Standard', subtitle: 'Proven reliable', icon: Briefcase },
    { id: 'high_profit', title: 'High-Profit', subtitle: 'Maximize margins', icon: HandCoins },
    { id: 'low_competition', title: 'Low-Competition', subtitle: 'Market gaps', icon: Search },
    { id: 'breakthrough', title: 'Breakthrough', subtitle: 'Innovation first', icon: Lightbulb, badge: 'NEW' },
    { id: 'balanced', title: 'Balanced', subtitle: 'Optimal mix', icon: Sparkles },
  ],
};

const LOCAL_STORAGE_KEY = 'nicheExplorerFormState_v5';

export function NicheExplorer() {
  const [nicheIdeas, setNicheIdeas] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAutosaving, setIsAutosaving] = useState(false);
  
  const { toast } = useToast();
  const { user, isLoading: isUserLoading } = useUser();
  const { t, formatCurrency } = useLocale();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      businessGoal: 'investor_startup',
      searchPriority: 'balanced',
      businessType: "any",
      maxInvestment: 10000,
      isInvestorMode: false,
      experienceLevel: 'beginner',
      fundingGoal: 'self_funded',
      timeline: 'research_only',
      preferredModel: 'any',
    }
  });

  const discoveryMode = form.watch('discoveryMode');
  const selectedCountry = form.watch('country');

  const currencySettings = useMemo(() => {
    return getCurrencySettings(selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedStateJSON) {
        try {
            const savedState = JSON.parse(savedStateJSON);
            form.reset(savedState);
        } catch (e) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
        setIsAutosaving(true);
        try {
            const stateJSON = JSON.stringify(value);
            localStorage.setItem(LOCAL_STORAGE_KEY, stateJSON);
            setTimeout(() => setIsAutosaving(false), 500);
        } catch (e) {
            setIsAutosaving(false);
        }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(data: FormSchemaType) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Required", description: "Create a free account to generate venture projects." });
        return;
    }
    setIsLoading(true);
    setNicheIdeas([]);

    const searchRequest: SearchRequest = {
        countryCode: data.country,
        cityId: data.city || undefined,
        sectorSlugs: data.sectors,
        businessType: data.businessType,
        searchPriority: data.searchPriority,
        maxCapitalUsd: data.maxInvestment,
        note260: data.context || undefined,
        discoveryMode: data.discoveryMode,
        businessGoal: data.businessGoal,
        experienceLevel: data.experienceLevel,
        fundingGoal: data.fundingGoal,
        timeline: data.timeline,
        preferredModel: data.preferredModel === 'any' ? undefined : data.preferredModel,
    };

    try {
        const result = await generateNicheIdeas(searchRequest, data.isInvestorMode);
        if ('error' in result) throw new Error(result.error);
        if (result && result.recommendations) {
            setNicheIdeas(result.recommendations.sort((a, b) => a.rank - b.rank));
        }
    } catch (error: any) {
         toast({ variant: 'destructive', title: t('toasts.nicheGeneratedError'), description: error.message });
    } finally {
        setIsLoading(false);
    }
  }

  const handleNicheClick = (nicheId: string) => {
    setSelectedNicheId(nicheId);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-12 mt-8 md:mt-12 pb-24">
      {!isUserLoading && !user && (
        <Card className="max-w-4xl mx-auto border-primary/30 bg-primary/5 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center sm:flex-row sm:text-left sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Create your free account to get started</h2>
              <p className="text-sm text-muted-foreground">
                Sign up to search opportunities and receive bonus credits on your first run.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/signup">Sign Up Free</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="max-w-4xl mx-auto shadow-2xl shadow-primary/10 border-primary/20">
        <CardHeader className="flex flex-row items-start justify-between border-b bg-secondary/10">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-primary" />
                {t('searchCanvas.title')}
            </CardTitle>
            <CardDescription>{t('searchCanvas.titleDescription')}</CardDescription>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 ${isAutosaving ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
            <CloudCheck className={`h-3 w-3 ${isAutosaving ? 'animate-pulse' : ''}`} />
            {isAutosaving ? 'OS SYNCING...' : 'OS SYNC ACTIVE'}
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="discoveryMode"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <LayoutGrid className="h-3.5 w-3.5" />
                                1. Discovery Starting Point
                            </FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {discoveryModeOptions.map((option) => (
                                    <FormItem key={option.id}>
                                        <RadioGroupItem value={option.id} id={`discovery_${option.id}`} className="peer sr-only" />
                                        <Label htmlFor={`discovery_${option.id}`} className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all shadow-sm">
                                            <option.icon className="mb-3 h-6 w-6" />
                                            <span className="font-bold text-sm text-center">{option.title}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium mt-1 text-center leading-tight">{option.subtitle}</span>
                                        </Label>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />

                {discoveryMode && (
                    <>
                        <FormField
                            control={form.control}
                            name="businessGoal"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Zap className="h-3.5 w-3.5" />
                                    2. Primary Venture Goal
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormItem>
                                        <RadioGroupItem value="investor_startup" id="investor_startup" className="peer sr-only" />
                                        <Label htmlFor="investor_startup" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                            <span className="font-bold text-sm">{t('searchCanvas.businessGoal_investor_startup')}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter">High growth • Scalable • Fundable</span>
                                        </Label>
                                    </FormItem>
                                    <FormItem>
                                        <RadioGroupItem value="micro_cashflow" id="micro_cashflow" className="peer sr-only" />
                                        <Label htmlFor="micro_cashflow" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                                            <span className="font-bold text-sm">{t('searchCanvas.businessGoal_micro_cashflow')}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tighter">Practical • Fast Revenue • Local</span>
                                        </Label>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                        <FormField
                            control={form.control}
                            name="searchPriority"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                        <Target className="h-3.5 w-3.5" />
                                        3. Intelligence Routing (Priority)
                                    </FormLabel>
                                    <FormDescription className="text-[10px] font-medium uppercase tracking-tighter">{t('searchCanvas.searchPriorityDescription')}</FormDescription>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {searchPriorityUIConfig.options.map((option) => (
                                            <FormItem key={option.id}>
                                                <RadioGroupItem value={option.id} id={`priority_${option.id}`} className="peer sr-only" />
                                                <Label htmlFor={`priority_${option.id}`} className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all relative overflow-hidden text-center shadow-sm">
                                                    {option.badge && <div className="absolute top-0 right-0 bg-primary text-[8px] font-bold text-primary-foreground px-2 py-0.5 rounded-bl-lg tracking-widest">{option.badge}</div>}
                                                    <option.icon className="mb-3 h-5 w-5 opacity-80" />
                                                    <span className="font-bold text-xs uppercase tracking-tight">{t(`searchCanvas.priority_${option.id}`)}</span>
                                                    <span className="text-[9px] text-muted-foreground font-medium mt-1 leading-tight opacity-70">{option.subtitle}</span>
                                                </Label>
                                            </FormItem>
                                        ))}
                                        </RadioGroup>
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Market Focus (Mandatory)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="h-12 bg-secondary/20 border-border/60"><SelectValue placeholder={t('searchCanvas.countryPlaceholder')} /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {countries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">City/Region (Optional)</FormLabel>
                                <FormControl><Input placeholder={t('searchCanvas.cityPlaceholder')} className="h-12 bg-secondary/20 border-border/60" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="businessType"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Operational Mode</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {businessTypeUIConfig.options.map((option) => (
                                            <FormItem key={option.id}>
                                                <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                                                <Label htmlFor={option.id} className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all shadow-sm">
                                                    <option.icon className="mb-3 h-5 w-5 opacity-70" />
                                                    <span className="font-bold text-xs text-center uppercase tracking-tight">{option.title}</span>
                                                    <span className="text-[9px] text-muted-foreground font-medium mt-1 text-center opacity-70 leading-tight">{option.subtitle}</span>
                                                </Label>
                                            </FormItem>
                                        ))}
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="optional-filters" className="border-none bg-secondary/10 rounded-xl px-4">
                            <AccordionTrigger className="text-xs font-bold uppercase tracking-widest hover:no-underline">
                                <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-primary"/>{t('searchCanvas.optionalFilters')}</div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 pb-8 space-y-8">
                                <FormField
                                control={form.control}
                                name="sectors"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-[11px] font-bold uppercase tracking-widest">{t('searchCanvas.sectorsLabel')}</FormLabel>
                                        <FormDescription className="text-[10px]">{t('searchCanvas.sectorsDescription')}</FormDescription>
                                    </div>
                                    <Accordion type="multiple" className="w-full rounded-md border bg-background/50">
                                        {sectorGroups.map((group) => (
                                        <AccordionItem value={group.name} key={group.name} className="px-4 border-b last:border-b-0">
                                            <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tighter opacity-80">{group.name}</AccordionTrigger>
                                            <AccordionContent>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-2">
                                                {group.sectors.map((item) => (
                                                <FormField key={item} control={form.control} name="sectors" render={({ field }) => (
                                                        <FormItem key={item} className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value?.includes(item)} disabled={!field.value?.includes(item) && field.value?.length >= 3}
                                                            onCheckedChange={(checked) => {
                                                                const currentValue = field.value || [];
                                                                return checked ? field.onChange([...currentValue, item]) : field.onChange(currentValue.filter((value) => value !== item));
                                                            }} />
                                                        </FormControl>
                                                        <FormLabel className="font-medium text-xs opacity-90 cursor-pointer">{item}</FormLabel>
                                                        </FormItem>
                                                    )}
                                                />
                                                ))}
                                            </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        ))}
                                    </Accordion>
                                    </FormItem>
                                )}
                                />

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Experience</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>{["beginner", "intermediate", "experienced", "expert"].map((level) => <SelectItem key={level} value={level}>{level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                                        </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="fundingGoal" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Funding Goal</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>{["self_funded", "grant", "loan", "angel_investment", "vc_investment", "not_sure"].map((goal) => <SelectItem key={goal} value={goal}>{goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                                        </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="timeline" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Timeline</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>{["start_immediately", "within_30_days", "within_90_days", "within_6_months", "research_only"].map((time) => <SelectItem key={time} value={time}>{time.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                                        </Select>
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="preferredModel" render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60">Model Preference</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>{["recurring_revenue", "high_margin", "low_startup_cost", "scalable", "any"].map((model) => <SelectItem key={model} value={model}>{model.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                                        </Select>
                                        </FormItem>
                                    )} />
                                </div>
                                
                                <FormField control={form.control} name="maxInvestment" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-[11px] font-bold uppercase tracking-[0.2em]">{t('searchCanvas.investmentLabel', { amount: formatCurrency(field.value, 'USD', currencySettings.code, currencySettings.parityMode === 'FACE_VALUE')})}</FormLabel>
                                    <FormControl className="pt-2"><Slider min={500} max={10000} step={500} value={[field.value]} onValueChange={(value) => field.onChange(value[0])} /></FormControl>
                                    <FormDescription className="text-[9px] uppercase font-bold text-muted-foreground opacity-60">Standard Rule: Constraints mapped to 10k USD global equivalent (Local Parity logic active).</FormDescription>
                                    </FormItem>
                                )} />
                                
                                <FormField control={form.control} name="context" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest">{t('searchCanvas.contextLabel')}</FormLabel>
                                    <FormControl><Textarea placeholder={t('searchCanvas.contextPlaceholder')} className="resize-none bg-background focus:ring-primary/20 h-24" {...field} value={field.value ?? ''} /></FormControl>
                                    <FormDescription className="text-[10px] opacity-60">{t('searchCanvas.contextDescription')}</FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                
                                <FormField control={form.control} name="isInvestorMode" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-primary/20 p-4 bg-primary/5 shadow-inner">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-primary"><Sparkles className="h-4 w-4 animate-pulse" />Investor Production Mode</FormLabel>
                                            <FormDescription className="text-[10px] font-medium leading-tight">Upgrades reasoning density for high-stakes conversations. (+40% ACU consumption)</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )} />
                            </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        
                        <Button type="submit" disabled={isLoading || isUserLoading} className="w-full h-14 text-sm font-bold uppercase tracking-[0.2em] shadow-2xl shadow-primary/20" size="lg">
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                            <span className="ml-2">{t('searchCanvas.findButton')}</span>
                        </Button>
                    </>
                )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) setSelectedNicheId(null); }}>
        <SheetContent className="sm:max-w-2xl w-full p-0">
          {selectedNicheId && <NicheDetailView nicheId={selectedNicheId} />}
        </SheetContent>
      </Sheet>

      <section className="max-w-6xl mx-auto">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent></Card>)}
          </div>
        )}

        {!isLoading && nicheIdeas.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Generated Venture Opportunities</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Engine Run Complete • {nicheIdeas.length} Recommendations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nicheIdeas.map((rec) => (
                 <Card key={rec.recommendationId} className="cursor-pointer group hover:border-primary/80 transition-all duration-300 flex flex-col bg-gradient-to-br from-card to-secondary/30 shadow-md border-border/40 relative overflow-hidden" onClick={() => handleNicheClick(rec.niche.id)}>
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="h-4 w-4 text-primary" /></div>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-4">
                            <CardTitle className="text-base font-bold group-hover:text-primary transition-colors leading-tight">{rec.niche.title}</CardTitle>
                            <Badge variant="secondary" className="flex-shrink-0 mt-0.5 bg-primary/10 text-primary border-primary/20 font-bold text-[10px]">RANK #{rec.rank}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-medium">{rec.niche.summary}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border/40">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">Confidence</p>
                                <ScoreBadge score={rec.scores.overallConfidenceScore} />
                            </div>
                            {rec.confidenceScore && (
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">AI Certainty</p>
                                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary">{rec.confidenceScore}%</Badge>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
