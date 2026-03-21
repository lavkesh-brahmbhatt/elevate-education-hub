import { PageHeader } from '@/components/DashboardWidgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" description="Manage your school configuration and preferences." />
      
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">School Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input id="school-name" defaultValue="Academy OS Demo School" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input id="subdomain" defaultValue="demo" disabled />
            </div>
            <Button className="w-fit">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Deleting your school data is permanent.</p>
            <Button variant="destructive">Delete All Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
