import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/DashboardWidgets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      setSchoolName(data.schoolName || '');
      setSubdomain(data.subdomain || localStorage.getItem('tenantId') || '');
    });
  }, []);


  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { schoolName });
      toast.success('Settings updated. Please re-login to see all changes.');
    } catch (err: any) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.prompt('This will permanently delete ALL school data. Type DELETE to confirm.');
    if (confirmation !== 'DELETE') return;

    try {
      await api.delete('/settings/data');
      toast.success('School deactivated. Redirecting...');
      signOut();
      localStorage.clear();
      navigate('/register');
    } catch (err: any) {
      toast.error('Deletion failed');
    }
  };

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
              <Input 
                id="school-name" 
                value={schoolName} 
                onChange={e => setSchoolName(e.target.value)} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subdomain">Subdomain / Tenant ID</Label>
              <Input id="subdomain" value={subdomain} disabled />
            </div>
            <Button className="w-fit" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Deleting your school data is permanent and cannot be undone.</p>
            <Button variant="destructive" onClick={handleDelete}>Delete All Data</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
