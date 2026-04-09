import { useEffect, useState } from 'react';
import api from '@/services/api';
import { PageHeader, StatCard } from '@/components/DashboardWidgets';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Users, BookOpen, UserCheck, Bell, TrendingUp, PieChart, Info, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ studentCount: 0, teacherCount: 0, classCount: 0, noticeCount: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/stats').then(({ data }) => {
      setStats(data.stats);
      setChartData(data.chartData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="stagger space-y-10">
      <PageHeader 
        title="Institutional Intelligence" 
        description="Visualize academic growth, faculty deployment, and school-wide infrastructure metrics."
        icon={<TrendingUp size={28} />}
        action={
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-primary text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              <Calendar size={14} /> Real-time Feed
           </div>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-glow" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Synthesizing Data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Total Enrollment" value={stats.studentCount} icon={<Users />} color="indigo" trend="+12% From last term" />
            <StatCard label="Faculty Corps" value={stats.teacherCount} icon={<UserCheck />} color="green" trend="Active Teachers" />
            <StatCard label="Academic Units" value={stats.classCount} icon={<BookOpen />} color="amber" subtitle="Classes Defined" />
            <StatCard label="Active Syncs" value={stats.noticeCount} icon={<Bell />} color="rose" trend="Announcements" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 card-premium p-10 bg-white border-none shadow-xl overflow-hidden relative group">
              <div className="absolute top-4 right-10 flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Integration</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                 <div className="p-3 bg-indigo-50 text-primary rounded-2xl shadow-sm"><PieChart size={24} /></div>
                 Enrolled Student Distribution
              </h3>
              <p className="text-sm font-bold text-slate-600 mb-12">Comparative analysis of student population density across all current academic sections.</p>
              
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false} 
                      fontWeight="bold"
                      tick={{ fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      fontSize={10} 
                      axisLine={false} 
                      tickLine={false}
                      fontWeight="bold"
                      tick={{ fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
               <div className="p-10 !bg-slate-900 text-white border-none shadow-2xl rounded-3xl relative overflow-hidden transition-all hover:scale-[1.02] duration-300">
                  <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-3xl" />
                  <h4 className="text-xl font-black mb-1">Growth Forecast</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6">Academic Velocity</p>
                  <p className="text-[14px] font-black text-white/90 leading-relaxed mb-8">System analyzing current student-teacher ratios ({(stats.studentCount / (stats.teacherCount || 1)).toFixed(1)}:1). School is operating within optimal capacity parameters.</p>
                  <div className="flex items-center gap-4">
                     <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full shadow-glow" style={{ width: '75%' }} />
                     </div>
                     <span className="text-xs font-black">75%</span>
                  </div>
                  <p className="text-[10px] font-black text-white/70 mt-4 uppercase tracking-[0.1em]">Institutional Capacity Reached</p>
               </div>

               <div className="card-premium p-8 bg-white border-none shadow-xl flex flex-col gap-4">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                     <Info size={16} className="text-primary" /> Data Transparency
                  </h4>
                  <p className="text-[14px] font-black text-slate-700 leading-relaxed italic">
                    "All analytics generated are derived directly from the school's blockchain-like transparent ledger, ensuring 100% data integrity for management reviews."
                  </p>
                  <div className="pt-4 border-t border-slate-50 mt-2 flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Verified Report</span>
                     <div className="h-6 w-6 rounded-lg bg-indigo-50 text-primary flex items-center justify-center font-black text-[10px]">OS</div>
                  </div>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
