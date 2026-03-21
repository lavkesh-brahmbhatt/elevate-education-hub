import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from '@/services/api';
import { GraduationCap, School } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) navigate("/dashboard");
    
    // Auto-detect school ID from subdomain
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'localhost' && subdomain !== '127') {
      setSchoolId(subdomain);
    } else {
      // Default for local testing if not set
      const lastTenant = localStorage.getItem('tenantId');
      if (lastTenant) setSchoolId(lastTenant);
      else setSchoolId("tenantA");
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Submit to local Express backend
      const res = await api.post('/auth/login', {
        email,
        password
      }, {
        headers: {
          'x-tenant-id': schoolId // Use the manually entered or detected School ID
        }
      });

      // 2. Save credentials
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('tenantId', schoolId);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success("Login successful!");
      
      // Force reload to update AuthContext state
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Invalid credentials or school not found");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-subtle p-4">
      <Card className="w-full max-w-md shadow-card border-none">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your school portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolId" className="flex items-center gap-2">
                <School className="h-4 w-4" /> School Identifier
              </Label>
              <Input
                id="schoolId"
                placeholder="e.g. tenantA, tenantB"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                required
                className="bg-subtle/50"
              />
              <p className="text-[10px] text-muted-foreground px-1">
                Enter your unique school ID (e.g., "tenantA" for Green Valley)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tenantA.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account? Contact your school administrator.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
