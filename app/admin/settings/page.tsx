'use client';


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <>
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>System configuration and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">System settings features coming soon.</p>
          </CardContent>
        </Card>
    </>
  );
}
