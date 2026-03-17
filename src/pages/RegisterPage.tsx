import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';

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

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'school') {
      if (!schoolName.trim()) {
        toast.error('School name is required');
        return;
      }
      setStep('admin');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: { emailRedirectTo: window.location.origin },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // 2. Create school
      const slug = generateSlug(schoolName) + '-' + Date.now().toString(36);
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: schoolName,
          slug,
          address: schoolAddress || null,
          phone: schoolPhone || null,
          email: schoolEmail || null,
        })
        .select()
        .single();
      if (schoolError) throw schoolError;

      // 3. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        school_id: school.id,
        role: 'admin',
        full_name: adminName,
        email: adminEmail,
      });
      if (profileError) throw profileError;

      // 4. Create user role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'admin',
      });
      if (roleError) throw roleError;

      toast.success('School registered successfully! Please check your email to verify your account.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <GraduationCap className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <span className="text-xl font-semibold tracking-tight">Academy OS</span>
        </div>

        <div className="bg-card rounded-xl shadow-card p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-2 w-2 rounded-full ${step === 'school' ? 'bg-primary' : 'bg-muted-foreground'}`} />
            <div className={`h-2 w-2 rounded-full ${step === 'admin' ? 'bg-primary' : 'bg-muted'}`} />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-1">
            {step === 'school' ? 'Register your school' : 'Create admin account'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {step === 'school'
              ? 'Enter your institution details to get started.'
              : 'Set up the primary administrator account.'}
          </p>

          <form onSubmit={handleRegister} className="space-y-4">
            {step === 'school' ? (
              <>
                <div className="space-y-2">
                  <Label className="label-text">School Name *</Label>
                  <Input
                    placeholder="Springfield Academy"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Address</Label>
                  <Input
                    placeholder="123 Education St"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="label-text">Phone</Label>
                    <Input
                      placeholder="+1 234 567"
                      value={schoolPhone}
                      onChange={(e) => setSchoolPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-text">Email</Label>
                    <Input
                      type="email"
                      placeholder="info@school.edu"
                      value={schoolEmail}
                      onChange={(e) => setSchoolEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Continue</Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="label-text">Full Name *</Label>
                  <Input
                    placeholder="John Smith"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Email *</Label>
                  <Input
                    type="email"
                    placeholder="admin@school.edu"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-text">Password *</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep('school')} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating...' : 'Register'}
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already registered?{' '}
            <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
