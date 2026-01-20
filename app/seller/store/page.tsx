'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSellerProfile } from '@/features/seller/api';
import type { SellerProfile } from '@/features/seller/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SellerStorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accessToken = (session as any)?.accessToken;
      if (!accessToken) return;

      try {
        const data = await getSellerProfile(accessToken);
        if (!data) {
          router.push('/seller/onboard');
          return;
        }
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">My Store</h1>
           <p className="text-muted-foreground">Manage your store details and visibility</p>
        </div>
        <Button onClick={() => router.push('/seller/settings')}>
          Edit Store Settings
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
          <StoreIcon className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <CardTitle>{profile.displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile.businessName}</p>
          </div>
          <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {profile.status}
          </div>
        </CardHeader>
        <CardContent className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">
              {profile.description || 'No description provided.'}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Details</h3>
              <ul className="mt-2 space-y-2 text-sm">
                 <li><span className="text-muted-foreground">Identity Type:</span> {profile.identityType}</li>
                 <li><span className="text-muted-foreground">Business Types:</span> {profile.businessTypes?.join(', ')}</li>
                 <li><span className="text-muted-foreground">Email:</span> {profile.email}</li>
                 <li><span className="text-muted-foreground">Phone:</span> {profile.phone || 'N/A'}</li>
              </ul>
            </div>
            
            <div>
               <h3 className="font-semibold">KYC Status</h3>
               <ul className="mt-2 space-y-2 text-sm">
                 <li><span className="text-muted-foreground">Tax ID:</span> {profile.taxId || 'N/A'}</li>
                 <li><span className="text-muted-foreground">Authorized Signatory:</span> {profile.authorizedSignatory || 'N/A'}</li>
                 <li><span className="text-muted-foreground">Registration Proof:</span> {profile.registrationProof ? 'Uploaded' : 'Pending'}</li>
               </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
