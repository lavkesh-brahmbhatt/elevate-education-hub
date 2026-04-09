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
import { Settings, ShieldAlert, School, Globe, Save, Trash2, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      setSchoolName(data.schoolName || '');
      setSubdomain(data.subdomain || localStorage.getItem('tenantId') || '');
      setAddress(data.address || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { schoolName, address, phone, email });
      toast.success('Configuration updated successfully');
    } catch (err: any) {
      toast.error('Failed to sync settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.prompt('WARNING: This will permanently delete ALL academic data. Type DELETE to confirm.');
    if (confirmation !== 'DELETE') return;

    try {
      await api.delete('/settings/data');
      toast.success('Academy OS Deactivated.');
      signOut();
      localStorage.clear();
      navigate('/register');
    } catch (err: any) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="stagger">
      <PageHeader 
        title="Admin Settings" 
        description="Global system configuration for your school's digital infrastructure."
        icon={<Settings size={28} />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="card-premium border-none bg-white/70 backdrop-blur-md overflow-hidden shadow-xl">
             <div className="h-1.5 w-full bg-gradient-primary" />
             <CardHeader className="p-8">
               <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-primary shadow-sm"><School size={20} /></div>
                  School Profile Details
               </CardTitle>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Primary branding and identity</p>
             </CardHeader>
             <CardContent className="px-8 pb-8 space-y-6">
               <div className="grid gap-2 group">
                 <Label htmlFor="school-name" className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Digital Identity (School Name)</Label>
                 <div className="relative">
                   <Input 
                     id="school-name" 
                     value={schoolName} 
                     onChange={e => setSchoolName(e.target.value)} 
                     className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all text-base font-bold shadow-sm"
                     placeholder="e.g. Green Valley International"
                   />
                   <Save className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium px-1">This name appears on transcripts, portals, and student reports.</p>
               </div>

               <div className="grid gap-2 group">
                 <Label htmlFor="subdomain" className="text-xs font-black uppercase tracking-widest text-slate-500">Node Identifier (Subdomain)</Label>
                 <div className="relative">
                   <Input 
                     id="subdomain" 
                     value={subdomain} 
                     disabled 
                     className="h-14 rounded-2xl border-slate-100 bg-slate-100/50 text-slate-400 font-bold opacity-70"
                   />
                   <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 </div>
                 <div className="flex items-center gap-2 px-1 text-[10px] font-bold text-slate-400 mt-1">
                    <ShieldAlert size={12} className="text-amber-500" /> This is your unique system ID and cannot be modified.
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="grid gap-2 group">
                   <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Primary Phone</Label>
                   <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all text-base font-bold shadow-sm" placeholder="+254 7XX XXX" />
                 </div>
                 <div className="grid gap-2 group">
                   <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Institutional Email</Label>
                   <Input id="email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all text-base font-bold shadow-sm" placeholder="admin@academy.edu" />
                 </div>
               </div>

               <div className="grid gap-2 group">
                 <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">Physical Address</Label>
                 <Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all text-base font-bold shadow-sm" placeholder="Location details..." />
               </div>

               <Button 
                 className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase tracking-widest shadow-primary hover:shadow-glow transition-all active:scale-95 text-xs" 
                 onClick={handleSave} 
                 disabled={saving}
               >
                 {saving ? 'Synchronizing...' : 'Save Configuration'}
               </Button>
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="card-premium border-none bg-rose-50/30 overflow-hidden">
              <div className="h-1.5 w-full bg-rose-500 opacity-20" />
              <CardHeader className="p-6">
                 <CardTitle className="text-base font-black text-rose-800 flex items-center gap-2">
                    <ShieldAlert size={18} /> 
                    Danger Zone
                 </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                 <p className="text-[11px] font-bold text-rose-800/60 uppercase tracking-tight leading-relaxed">
                    Once you delete school data, there is no going back. All student records, marks, and logins will be permanently erased.
                 </p>
                 <Button 
                   variant="ghost" 
                   className="w-full h-12 rounded-xl bg-white border-2 border-rose-100 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center gap-2"
                   onClick={handleDelete}
                 >
                   <Trash2 size={16} /> Delete Academic Node
                 </Button>
              </CardContent>
           </Card>

           <div className="p-6 rounded-3xl bg-indigo-900 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/5 rounded-full blur-2xl" />
              <h4 className="text-lg font-black tracking-tight mb-2">Need Help?</h4>
              <p className="text-xs text-indigo-200/70 font-medium mb-4 leading-relaxed">Contact specialized Academy OS support for customized modules or infrastructure changes.</p>
              <button className="h-10 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                Support Desk <ArrowRight size={12} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
