'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfile } from 'firebase/auth';
import { useUser } from '@/firebase/auth/use-user';
import { useAuth } from '@/firebase/provider';
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
import { Loader2, Pencil, Camera, X } from 'lucide-react';
import { updateUserProfile } from '@/backend/actions';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/shared/countries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadProfilePhoto } from '@/lib/upload-profile-photo';

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
    photoURL?: string | null;
    country?: string | null;
    bio?: string | null;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
};

function getInitials(name?: string | null) {
  if (!name) return 'U';
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function EditProfileDialog({
  currentUserProfile,
  open: controlledOpen,
  onOpenChange,
  trigger,
}: EditProfileDialogProps) {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    if (!isControlled) setInternalOpen(next);
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: currentUserProfile.displayName || '',
      country: currentUserProfile.country || '',
      bio: currentUserProfile.bio || '',
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset({
      displayName: currentUserProfile.displayName || '',
      country: currentUserProfile.country || '',
      bio: currentUserProfile.bio || '',
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setRemovePhoto(false);
  }, [isOpen, currentUserProfile, form]);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setRemovePhoto(false);
    setPhotoPreview(URL.createObjectURL(file));
    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
  };

  const currentPhoto = removePhoto ? null : (photoPreview || currentUserProfile.photoURL || null);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "User not logged in." });
      return;
    }

    const photoChanged = !!photoFile || removePhoto;
    const hasChanged =
      data.displayName !== (currentUserProfile.displayName || '') ||
      data.country !== (currentUserProfile.country || '') ||
      data.bio !== (currentUserProfile.bio || '') ||
      photoChanged;

    if (!hasChanged) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);

    try {
      let photoURL: string | null | undefined = undefined;

      if (photoFile) {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      } else if (removePhoto) {
        photoURL = null;
      }

      const result = await updateUserProfile({
        displayName: data.displayName || '',
        country: data.country || '',
        bio: data.bio || '',
        photoURL,
      });

      if ('error' in result) throw new Error(result.error);

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName || '',
          ...(photoURL !== undefined ? { photoURL: photoURL ?? null } : {}),
        });
      }

      toast({ title: "Profile updated", description: "Your name and photo have been saved." });
      setIsOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsSaving(false);
    }
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <div className="flex items-center justify-between pr-8">
          <DialogTitle>Your Profile</DialogTitle>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-[9px] font-bold text-green-500 border border-green-500/20">
            <CloudCheck className="h-2.5 w-2.5" />
            OS SYNC ACTIVE
          </div>
        </div>
        <DialogDescription>
          Update your display name and profile picture. Changes appear across the app immediately.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border border-border/60">
                <AvatarImage src={currentPhoto || ''} alt={form.watch('displayName') || 'Profile'} />
                <AvatarFallback className="text-lg">{getInitials(form.watch('displayName'))}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-secondary"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Change photo
              </Button>
              {(currentUserProfile.photoURL || photoPreview) && !removePhoto && (
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={handleRemovePhoto}>
                  <X className="mr-1 h-3.5 w-3.5" />
                  Remove
                </Button>
              )}
              <p className="text-[10px] text-muted-foreground">JPEG, PNG, WebP or GIF. Max 2 MB.</p>
            </div>
          </div>

          <FormField control={form.control} name="displayName" render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl><Input placeholder="Your name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem>
              <FormLabel>Primary market focus</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select focus..." /></SelectTrigger></FormControl>
                <SelectContent>{countries.map((country) => <SelectItem key={country} value={country}>{country}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl><Textarea placeholder="Short summary about you" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save profile
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  if (trigger === null) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Pencil className="mr-2 h-4 w-4" /> Edit Operator Profile
          </Button>
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
}
