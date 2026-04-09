import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '@/services/api';
import { GraduationCap, School, Mail, Lock, Sparkles, Trophy, Calendar as CalendarIcon } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) navigate("/dashboard");
    
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'localhost' && subdomain !== '127') {
      setSchoolId(subdomain);
    } else {
      const lastTenant = localStorage.getItem('tenantId');
      if (lastTenant) setSchoolId(lastTenant);
      else setSchoolId("tenantA");
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.post('/auth/login', {
        email,
        password
      }, {
        headers: {
          'x-tenant-id': schoolId
        }
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('tenantId', schoolId);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success("Login successful!");
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Invalid credentials or school not found");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Panel: Decorative & Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-dark p-12 flex-col justify-between overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
          
          {/* Floating Subject Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full animate-[spin_30s_linear_infinite]" />
        </div>

        {/* Floating Stat Cards */}
        <div className="absolute top-[25%] left-[15%] card-premium bg-white/10 backdrop-blur-md border-white/20 p-4 animate-float flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Top Performance</p>
            <p className="text-xl font-black text-white">98% Score</p>
          </div>
        </div>

        <div className="absolute bottom-[25%] right-[15%] card-premium bg-white/10 backdrop-blur-md border-white/20 p-4 animate-[float_4s_ease-in-out_infinite] flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <CalendarIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Attendance</p>
            <p className="text-xl font-black text-white">96% Present</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg transform rotate-12 group hover:rotate-0 transition-transform">
            <GraduationCap className="text-white" size={28} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">ACADEMY OS</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-black text-white leading-tight mb-6 pb-2 border-b-4 border-indigo-500 w-fit">
            Empowering <br />
            <span className="text-indigo-400 font-extrabold italic">Intelligence</span>
          </h1>
          <p className="text-lg text-indigo-100/70 font-medium leading-relaxed">
            The all-in-one school management platform designed to streamline administration and enhance learning experiences.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-indigo-300/40 font-bold uppercase tracking-widest text-[10px]">
          <span>© 2026 ACADEMY OS</span>
          <span>TRUSTED BY 500+ SCHOOLS</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="text-white" size={18} />
          </div>
          <span className="text-lg font-black tracking-tighter text-slate-900">ACADEMY OS</span>
        </div>

        <div className="max-w-md w-full mx-auto animate-fade-in">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium tracking-tight">Enter your school credentials to access your portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="schoolId" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">
                <School size={14} /> School Identifier
              </Label>
              <div className="relative">
                <Input
                  id="schoolId"
                  placeholder="e.g. tenantA"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  required
                  className="h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 ring-primary/5 transition-all text-base font-bold placeholder:font-medium"
                />
                <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="email" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">
                <Mail size={14} /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 ring-primary/5 transition-all text-base font-bold"
              />
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 group-focus-within:text-primary transition-colors">
                  <Lock size={14} /> Password
                </Label>
                <a href="#" className="text-xs font-bold text-primary hover:text-indigo-700 transition-colors">Forgot?</a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-primary focus:ring-4 ring-primary/5 transition-all text-base font-bold"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black text-lg shadow-primary hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>SIGNING IN...</span>
                </div>
              ) : (
                "SIGN IN TO PORTAL"
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-center text-sm font-bold text-slate-400">
              New to Academy OS? <br />
              <a href="#" className="text-primary hover:underline underline-offset-4 decoration-2">Register your school today →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
