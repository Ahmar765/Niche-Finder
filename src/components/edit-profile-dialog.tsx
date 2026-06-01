'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Pencil } from 'lucide-react';
import { updateUserProfile } from '@/backend/actions';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/shared/countries';

// --- CUSTOM SVG ICONS ---
const CloudCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m9 13 2 2 4-4"/>
  </svg>
);

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Display name must be at least 2 characters.",
  }).max(50, {
    message: "Display name must not be longer than 50 characters.",
  }),
  country: z.string().optional(),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type EditProfileDialogProps = {
  currentUserProfile: {
    displayName: string | null;
    country?: string | null;
    bio?: string | null;
  };
};

export function EditProfileDialog({ currentUserProfile }: EditProfileDialogProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: currentUserProfile.displayName || '',
      country: currentUserProfile.country || '',
      bio: currentUserProfile.bio || '',
    },
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "User not logged in." });
      return;
    }

    const hasChanged = data.displayName !== (currentUserProfile.displayName || '') ||
                      data.country !== (currentUserProfile.country || '') ||
                      data.bio !== (currentUserProfile.bio || '');

    if (!hasChanged) {
        setIsOpen(false);
        return;
    }

    setIsSaving(true);
    
    try {
        const result = await updateUserProfile({
            displayName: data.displayName || '',
            country: data.country || '',
            bio: data.bio || '',
        });

        if ('error' in result) throw new Error(result.error);

        toast({ title: "Profile synchronized", description: "Changes autosaved to Venture OS." });
        setIsOpen(false);
    } catch (error: any) {
         toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
            <Pencil className="mr-2 h-4 w-4" /> Edit Operator Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Venture OS Profile</DialogTitle>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-[9px] font-bold text-green-500 border border-green-500/20">
                <CloudCheck className="h-2.5 w-2.5" />
                OS SYNC ACTIVE
            </div>
          </div>
          <DialogDescription>
            Your identity is linked to all generated venture assets and audit trails.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Public Operator Name</FormLabel>
                  <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Market Focus</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select focus..." /></SelectTrigger></FormControl>
                    <SelectContent>{countries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
             <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <FormLabel>Venture Bio</FormLabel>
                  <FormControl><Textarea placeholder="Short summary of your venture goals" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Synchronize Profile
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}