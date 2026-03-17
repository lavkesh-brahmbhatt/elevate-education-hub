import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Upload } from 'lucide-react';

type Material = { id: string; title: string; description: string | null; file_url: string | null; created_at: string };

export default function MaterialsPage() {
  const { profile } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase.from('study_materials').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false }).then(({ data }) => {
      setMaterials((data as Material[]) || []);
      setLoading(false);
    });
  }, [profile]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Study Materials" description="Access notes and study resources." />
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : materials.length === 0 ? (
        <EmptyState icon={<Upload className="h-6 w-6" />} title="No materials yet" description="Study materials will appear here once uploaded." />
      ) : (
        <div className="space-y-3">
          {materials.map(m => (
            <div key={m.id} className="bg-card rounded-xl shadow-card p-5">
              <h3 className="text-sm font-medium">{m.title}</h3>
              {m.description && <p className="text-sm text-muted-foreground mt-1">{m.description}</p>}
              <p className="text-xs text-muted-foreground mt-2 tabular-nums">{new Date(m.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
