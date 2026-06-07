'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ShieldCheck, FileText, Loader2, UserSearch, 
  Coins, ClipboardCopy, CreditCard, BrainCircuit, Newspaper, Send, Eye, 
  MessageSquare, Check, X, Zap, Info, ShieldAlert,
  Save, Activity, Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase/provider';
import { collection, query, orderBy, limit, doc, where, getDocs, updateDoc } from 'firebase/firestore';
import { adminModifyAcu, generateAndSaveBlogPostDraft, publishBlogPost } from '@/backend/actions';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { format, formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useUser } from '@/firebase/auth/use-user';
import { useUserRoles } from '@/hooks/use-user-roles';
import { Textarea } from './ui/textarea';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { cn } from '@/shared/utils';
import { Separator } from './ui/separator';

const modifyAcuFormSchema = z.object({
  targetUid: z.string().min(1, "Target UID is required."),
  actionType: z.enum(['grant', 'deduct']).default('grant'),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  reason: z.string().min(1, "A reason for the modification is required."),
});

type ModifyAcuFormValues = z.infer<typeof modifyAcuFormSchema>;

const blogPostFormSchema = z.object({
    topic: z.string().min(10, 'Please enter a topic at least 10 characters long.'),
});
type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;


const SystemIntelligenceWidget = () => (
    <Card className="border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
        <CardHeader className="pb-3 border-b border-primary/10">
            <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center justify-between text-primary">
                <div className="flex items-center gap-2"><Bot className="h-4 w-4" /> System Intelligence brief</div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] tracking-tighter uppercase">Initializing</Badge>
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-2 rounded bg-background/50 border border-border/40 space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Info className="h-3 w-3" /> AI Insight</span>
                    <p className="text-[11px] font-medium leading-snug">System ready for signal ingestion. Calibration in progress.</p>
                </div>
                <div className="p-2 rounded bg-background/50 border border-border/40 space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><ShieldAlert className="h-3 w-3 text-amber-500" /> AI Alert</span>
                    <p className="text-[11px] font-medium leading-snug">Awaiting initial administrative commands.</p>
                </div>
            </div>
            <div className="p-3 rounded-lg border-2 border-primary bg-primary/10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <span className="text-[9px] font-bold text-primary uppercase flex items-center gap-1.5"><Zap className="h-3 w-3 animate-pulse" /> AI Next Action</span>
                    <p className="text-xs font-bold leading-tight">Sync ledger to establish operational baseline.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Confidence</span>
                    <Badge className="bg-primary text-primary-foreground text-[10px]">SYNCING</Badge>
                </div>
            </div>
        </CardContent>
    </Card>
);

export function AdminDashboard() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const { isAnyAdmin } = useUserRoles();
  const [isSubmittingAcu, setIsSubmittingAcu] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [updatingCaseId, setUpdatingCaseId] = useState<string | null>(null);

  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const acuForm = useForm<ModifyAcuFormValues>({
    resolver: zodResolver(modifyAcuFormSchema),
    defaultValues: {
      targetUid: '',
      actionType: 'grant',
      amount: 1000,
      reason: '',
    },
  });

  const blogForm = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
  });

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!searchEmail || !firestore) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', searchEmail.trim()));
      const querySnapshot = await getDocs(q);
      
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (users.length === 0) {
        setSearchError('No user found with that email.');
      } else {
        setSearchResults(users);
      }
    } catch (error: any) {
      console.error("User search failed:", error);
      setSearchError('An error occurred during the search.');
    } finally {
        setIsSearching(false);
    }
  }

  async function onAcuSubmit(data: ModifyAcuFormValues) {
    setIsSubmittingAcu(true);

    const deltaAcu = data.actionType === 'grant' ? data.amount : -data.amount;

    const result = await adminModifyAcu({
        targetUid: data.targetUid,
        deltaAcu: deltaAcu,
        reason: data.reason,
    });

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error Modifying ACU',
        description: result.error,
      });
    } else {
      const actionText = deltaAcu > 0 ? `Granted ${deltaAcu}` : `Deducted ${Math.abs(deltaAcu)}`;
      toast({
        title: 'ACU Modified Successfully',
        description: `${actionText} ACU for user ${data.targetUid}. New balance: ${result.newBalance}`,
      });
      acuForm.reset();
    }
    setIsSubmittingAcu(false);
  }
  
  async function onBlogPostSubmit(data: BlogPostFormValues) {
      setIsGeneratingPost(true);
      const result = await generateAndSaveBlogPostDraft(data.topic);
      if (result.error) {
          toast({ variant: 'destructive', title: 'Failed to generate post', description: result.error });
      } else {
          toast({ title: 'Draft Created!', description: result.message || 'New blog post has been saved as a draft.' });
          blogForm.reset({ topic: '' });
      }
      setIsGeneratingPost(false);
  }

  async function handlePublish(postId: string) {
      setPublishingPostId(postId);
      const result = await publishBlogPost(postId);
      if (result.error) {
          toast({ variant: 'destructive', title: 'Failed to publish post', description: result.error });
      } else {
          toast({ title: 'Post Published!', description: 'The post is now live.' });
      }
      setPublishingPostId(null);
  }
  
  async function handleUpdateCaseStatus(caseId: string, status: 'resolved' | 'closed') {
    if(!firestore) return;
    setUpdatingCaseId(caseId);
    try {
        const caseRef = doc(firestore, 'support_cases', caseId);
        await updateDoc(caseRef, {
            status: status,
            updatedAt: new Date(),
        });
        toast({ title: 'Case Updated', description: `Case has been marked as ${status}.`});
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
        setUpdatingCaseId(null);
    }
  }

  const canQueryAdminData = Boolean(firestore && user && isAnyAdmin);
  const ledgerQuery = canQueryAdminData
    ? query(collection(firestore!, 'acu_transactions'), orderBy('createdAt', 'desc'), limit(50))
    : null;
  const { data: ledgerEntries, isLoading: ledgerLoading } = useCollection(ledgerQuery);
  const blogPostsQuery = canQueryAdminData
    ? query(collection(firestore!, 'blog_posts'), orderBy('createdAt', 'desc'))
    : null;
  const { data: blogPosts, isLoading: blogPostsLoading } = useCollection(blogPostsQuery);
  const supportCasesQuery = canQueryAdminData
    ? query(collection(firestore!, 'support_cases'), where('status', '==', 'open'), orderBy('createdAt', 'desc'))
    : null;
  const { data: supportCases, isLoading: supportCasesLoading } = useCollection(supportCasesQuery);


  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-white" />
            Admin Control Panel
            </h1>
            <p className="text-lg text-muted-foreground">
            Manage users, credits, and monitor system activity.
            </p>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-500">
                <Save className="h-3 w-3" />
                SYSTEM SYNC ACTIVE
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                <Activity className="h-3 w-3" />
                HEALTH: OPTIMAL
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Tabs defaultValue="support" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="support" className="gap-1"><MessageSquare className="h-4 w-4"/>Support</TabsTrigger>
                    <TabsTrigger value="blog" className="gap-1"><Newspaper className="h-4 w-4" />Blog</TabsTrigger>
                    <TabsTrigger value="users" className="gap-1"><UserSearch className="h-4 w-4" />Users</TabsTrigger>
                    <TabsTrigger value="ledger" className="gap-1"><FileText className="h-4 w-4" />Ledger</TabsTrigger>
                </TabsList>
                
                <TabsContent value="support" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-white">Open Support Cases</CardTitle>
                            <CardDescription>Review and manage user support cases escalated from the AI chatbot.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[calc(100vh-25rem)]">
                                {supportCasesLoading && <Skeleton className="h-40 w-full" />}
                                {!supportCasesLoading && supportCases?.length === 0 && <p className="text-muted-foreground text-center py-10 font-bold uppercase tracking-widest text-xs opacity-50">No open support cases.</p>}
                                <Accordion type="single" collapsible className="w-full">
                                    {supportCases?.map((caseItem: any) => (
                                    <AccordionItem value={caseItem.id} key={caseItem.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between w-full pr-4">
                                                <div className="max-w-md truncate">
                                                    <Badge variant="outline">{caseItem.status}</Badge>
                                                    <span className="ml-2 font-normal text-muted-foreground">{caseItem.summary}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {caseItem.createdAt ? formatDistanceToNow(caseItem.createdAt.toDate(), { addSuffix: true }) : ''}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-4 bg-secondary/30 rounded-lg">
                                                <h4 className="font-semibold mb-2 text-sm text-white">Conversation History</h4>
                                                <div className="space-y-3">
                                                {caseItem.conversation.map((msg: any, index: number) => (
                                                    <div key={index} className={`text-xs ${msg.role === 'user' ? 'text-left' : 'text-right'}`}>
                                                        <div className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                                </div>
                                                <Separator className="my-4" />
                                                <p className="text-xs font-mono text-muted-foreground">User ID: {caseItem.userId}</p>
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <Button size="sm" variant="outline" onClick={() => handleUpdateCaseStatus(caseItem.id, 'closed')} disabled={updatingCaseId === caseItem.id}>
                                                        {updatingCaseId === caseItem.id ? <Loader2 className="animate-spin h-4 w-4"/> : <X className="h-4 w-4"/>}
                                                        <span className="ml-2">Close</span>
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleUpdateCaseStatus(caseItem.id, 'resolved')} disabled={updatingCaseId === caseItem.id}>
                                                        {updatingCaseId === caseItem.id ? <Loader2 className="animate-spin h-4 w-4"/> : <Check className="h-4 w-4"/>}
                                                        <span className="ml-2">Mark as Resolved</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    ))}
                                </Accordion>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="blog" className="mt-6">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white"><BrainCircuit className="h-5 w-5" />Generate Blog Post</CardTitle>
                                <CardDescription>Use AI to generate a new blog post from a topic.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...blogForm}>
                                    <form onSubmit={blogForm.handleSubmit(onBlogPostSubmit)} className="space-y-4">
                                        <FormField
                                            control={blogForm.control}
                                            name="topic"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Blog Post Topic</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="e.g., 'The Top 5 Emerging Markets for Fintech in 2026'" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={isGeneratingPost} className="w-full">
                                            {isGeneratingPost ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                            Generate Draft
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-white">Manage Posts</CardTitle>
                                <CardDescription>Review, publish, and track blog posts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-96">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {blogPostsLoading && (
                                                [...Array(5)].map((_, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                            {blogPosts?.map((post: any) => (
                                                <TableRow key={post.id}>
                                                    <TableCell className="font-medium max-w-xs truncate text-white">
                                                        {post.status === 'published' && post.slug ? (
                                                            <Link href={`/blog/${post.slug}`} target="_blank" className="hover:underline">
                                                                {post.title}
                                                            </Link>
                                                        ) : (
                                                            <span title="Publish this post to make it live on the blog">
                                                                {post.title}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                                            {post.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        {post.status === 'draft' && (
                                                            <Button size="sm" onClick={() => handlePublish(post.id)} disabled={publishingPostId === post.id}>
                                                                {publishingPostId === post.id ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Publish'}
                                                            </Button>
                                                        )}
                                                        {post.status === 'published' && post.slug && (
                                                            <Button size="sm" variant="outline" asChild>
                                                                <Link href={`/blog/${post.slug}`} target="_blank">View live</Link>
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                    <div className="grid gap-8 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white"><UserSearch className="h-5 w-5" />User Search</CardTitle>
                                <CardDescription>Find a user by email.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <Input 
                                        type="email" 
                                        placeholder="user@example.com"
                                        value={searchEmail}
                                        onChange={(e) => setSearchEmail(e.target.value)}
                                    />
                                    <Button type="submit" disabled={isSearching}>
                                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                                    </Button>
                                </form>
                                {searchResults.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h4 className="font-semibold text-sm text-white">Search Results</h4>
                                        <Table>
                                            <TableBody>
                                            {searchResults.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium text-xs">{user.email}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button size="sm" onClick={() => acuForm.setValue('targetUid', user.id)}>
                                                            Select
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white"><Coins className="h-5 w-5" />Modify ACU</CardTitle>
                                <CardDescription>Manually adjust credits.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...acuForm}>
                                <form onSubmit={acuForm.handleSubmit(onAcuSubmit)} className="space-y-4">
                                    <FormField
                                    control={acuForm.control}
                                    name="targetUid"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Target UID</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={acuForm.control}
                                    name="actionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Action</FormLabel>
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="grant" id="grant" /><label htmlFor="grant" className="text-xs">Grant</label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="deduct" id="deduct" /><label htmlFor="deduct" className="text-xs">Deduct</label></div>
                                            </RadioGroup>
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={acuForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <Button type="submit" disabled={isSubmittingAcu} className="w-full">
                                    {isSubmittingAcu && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Process Modification
                                    </Button>
                                </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                
                <TabsContent value="ledger">
                    <Card>
                        <CardHeader><CardTitle className="text-white">Recent Activity</CardTitle></CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[calc(100vh-25rem)]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-right">Δ ACU</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ledgerEntries?.map((entry: any) => (
                                            <TableRow key={entry.id}>
                                                <TableCell className="text-xs">{entry.createdAt ? format(entry.createdAt.toDate(), 'PPpp') : 'N/A'}</TableCell>
                                                <TableCell className="text-xs font-bold text-white">{entry.type}</TableCell>
                                                <TableCell className={cn("text-right font-bold text-xs", (entry.acusCharged || 0) > 0 ? "text-green-500" : "text-red-500")}>
                                                    {(entry.acusCharged || 0) > 0 ? '+' : ''}{(entry.acusCharged || 0)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        <div className="space-y-8">
            <SystemIntelligenceWidget />
            
            <Card className="shadow-inner bg-secondary/10 border-dashed">
                <CardHeader>
                    <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        System Health Monitor
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-muted-foreground">Reasoning Engine</span>
                        <span className="text-green-500">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-muted-foreground">Memory Sync Core</span>
                        <span className="text-green-500">OPTIMAL</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                        <span className="text-muted-foreground">Ledger Latency</span>
                        <span className="text-blue-400">12MS</span>
                    </div>
                    <Separator />
                    <div className="pt-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Operational Recommendation</p>
                        <p className="text-[11px] leading-snug">Calibrate scoring weights for South-East Asian markets following increase in search volume.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
