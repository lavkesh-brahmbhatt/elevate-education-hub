import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, ArrowRight, ShieldCheck, School, UserPlus, Sparkles, MapPin, Phone, Mail, Lock, Activity } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'school' | 'admin'>('school');
  const [loading, setLoading] = useState(false);

  // School fields
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');

  // Admin fields
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'school') {
      if (!schoolName.trim()) {
        toast.error('Institution name is required for registration.');
        return;
      }
      setStep('admin');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        schoolName,
        schoolAddress,
        schoolPhone,
        schoolEmail,
        adminName,
        adminEmail,
        adminPassword
      });

      toast.success('Academy Registration Successful!', {
          description: 'Access Signal Key: ' + res.data.tenantId,
      });
      localStorage.setItem('tenantId', res.data.tenantId);
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Node Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-6 font-inter">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 -m-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl opacity-50 animate-pulse-soft" />
      <div className="absolute bottom-0 left-0 -m-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-30 animate-pulse-soft" />
      
      <div className="w-full max-w-xl stagger">
        <div className="flex flex-col items-center mb-10 text-center">
           <div className="h-16 w-16 bg-gradient-primary rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/30 mb-6 group cursor-pointer hover:rotate-12 transition-transform duration-500">
              <GraduationCap size={32} className="text-white" />
           </div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">Elevate Academy OS</h1>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Onboarding Terminal</p>
        </div>

        <div className="card-premium p-0 border-none bg-white/70 backdrop-blur-xl shadow-2xl overflow-hidden group">
          <div className="h-1.5 w-full bg-slate-100 relative">
             <div className={`h-full bg-primary transition-all duration-700 ease-out shadow-glow`} style={{ width: step === 'school' ? '50%' : '100%' }} />
          </div>

          <div className="p-10 md:p-14">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className={`h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-primary border border-indigo-100`}>
                    {step === 'school' ? <School size={20}/> : <UserPlus size={20}/>}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 leading-none mb-1">
                      {step === 'school' ? 'Register Institution' : 'Strategic Administrator'}
                    </h2>
                    <p className="text-xs font-medium text-slate-400 tracking-tight leading-relaxed">
                      {step === 'school' 
                        ? 'Establish your academy node within the global educational matrix.' 
                        : 'Secure your primary administrative access credentials.'}
                    </p>
                 </div>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {step === 'school' ? (
                <div className="stagger space-y-5">
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Official School Name *</Label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. Neo-Science Academy"
                        className="h-12 rounded-xl bg-white/50 border-slate-200 focus:ring-primary/10 transition-all pl-10"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        required
                      />
                      <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Physical Infrastructure Node (Address)</Label>
                    <div className="relative">
                      <Input
                        placeholder="Location details..."
                        className="h-12 rounded-xl bg-white/50 border-slate-200 focus:ring-primary/10 transition-all pl-10"
                        value={schoolAddress}
                        onChange={(e) => setSchoolAddress(e.target.value)}
                      />
                      <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 group">
                      <Label className="label-text">Contact Uplink (Phone)</Label>
                      <div className="relative">
                        <Input
                          placeholder="+254 7XX XXX"
                          className="h-12 rounded-xl bg-white/50 border-slate-200 pl-10"
                          value={schoolPhone}
                          onChange={(e) => setSchoolPhone(e.target.value)}
                        />
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>
                    <div className="space-y-1.5 group">
                      <Label className="label-text">Institutional Email</Label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="admin@academy.edu"
                          className="h-12 rounded-xl bg-white/50 border-slate-200 pl-10"
                          value={schoolEmail}
                          onChange={(e) => setSchoolEmail(e.target.value)}
                        />
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 bg-gradient-primary rounded-2xl shadow-primary hover:shadow-glow font-black uppercase tracking-widest text-[11px] group">
                    Establish Academy Node <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              ) : (
                <div className="stagger space-y-5">
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Administrator Full Name *</Label>
                    <div className="relative">
                      <Input
                        placeholder="Commander Smith"
                        className="h-12 rounded-xl bg-white/50 border-slate-200 pl-10"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                      />
                      <ShieldCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Authentication Email *</Label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="master@school.edu"
                        className="h-12 rounded-xl bg-white/50 border-slate-200 pl-10"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="space-y-1.5 group">
                    <Label className="label-text group-focus-within:text-primary">Security Cipher (Password) *</Label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 rounded-xl bg-white/50 border-slate-200 pl-10"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep('school')} className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                      Back to Start
                    </Button>
                    <Button type="submit" className="flex-[2] h-14 bg-gradient-primary rounded-2xl shadow-primary hover:shadow-glow font-black uppercase tracking-widest text-[11px]" disabled={loading}>
                      {loading ? 'Transmitting Data...' : 'Confirm Registration'}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-12 text-center">
              <p className="text-xs font-medium text-slate-400">
                Already registered in the global matrix?{' '}
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-primary font-black uppercase tracking-widest text-[9px] ml-1 hover:underline decoration-2"
                >
                  Return to Login
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 opacity-20 filter grayscale group-hover:grayscale-0 transition-all duration-1000">
           <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Secure TLS-E2E</span>
           </div>
           <div className="flex items-center gap-2">
              <Activity size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Node Monitoring</span>
           </div>
        </div>
      </div>
    </div>
  );
}
