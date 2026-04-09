import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

export function StatCard({ label, value, subtitle, icon, trend, color = 'indigo', sparklineData }: {
  label: string; value: string | number; subtitle?: string; 
  icon?: ReactNode; trend?: string; color?: 'indigo' | 'blue' | 'amber' | 'green' | 'rose';
  sparklineData?: any[];
}) {
  const colorMap = {
    indigo: { 
        bg: 'bg-indigo-50/30', text: 'text-indigo-600', border: 'border-indigo-100/50', icon: 'bg-indigo-100/80', 
        glow: 'group-hover:shadow-[0_0_20px_rgba(91,79,232,0.15)]',
        spark: '#818CF8'
    },
    blue:   { 
        bg: 'bg-blue-50/30', text: 'text-blue-600', border: 'border-blue-100/50', icon: 'bg-blue-100/80', 
        glow: 'group-hover:shadow-[0_0_20px_rgba(47,136,216,0.15)]',
        spark: '#60A5FA'
    },
    amber:  { 
        bg: 'bg-amber-50/30', text: 'text-amber-600', border: 'border-amber-100/50', icon: 'bg-amber-100/80', 
        glow: 'group-hover:shadow-[0_0_20px_rgba(245,166,35,0.15)]',
        spark: '#FBBF24'
    },
    green:  { 
        bg: 'bg-emerald-50/30', text: 'text-emerald-600', border: 'border-emerald-100/50', icon: 'bg-emerald-100/80', 
        glow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        spark: '#34D399'
    },
    rose:   { 
        bg: 'bg-rose-50/30', text: 'text-rose-600', border: 'border-rose-100/50', icon: 'bg-rose-100/80', 
        glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]',
        spark: '#FB7185'
    },
  };
  const c = colorMap[color] || colorMap.indigo;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`card-premium p-6 border ${c.border} ${c.bg} ${c.glow} group cursor-default transition-all duration-300 relative overflow-hidden backdrop-blur-xl h-full flex flex-col`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
         {icon && <div className="scale-[3] origin-top-right">{icon}</div>}
      </div>
      <div className="flex items-start justify-between mb-4 relative z-10">
        {icon && (
          <div className={`h-12 w-12 rounded-2xl ${c.icon} ${c.text} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
            {icon}
          </div>
        )}
        {trend && (
          <span className="text-[10px] font-black tracking-widest text-emerald-600 bg-emerald-100/50 border border-emerald-200/50 px-2.5 py-1 rounded-full uppercase">
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10 flex-1">
        <p className={`text-4xl font-black tracking-tight ${c.text} mb-1.5`}>{value}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">{label}</p>
        {subtitle && <p className="text-[10px] font-bold text-muted-foreground mt-3 flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${c.bg.replace('/30', '')} ${c.text} border animate-pulse`} /> {subtitle}
        </p>}
      </div>

      {sparklineData && (
          <div className="h-10 mt-6 -mx-6 -mb-6 opacity-40 group-hover:opacity-80 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                      <defs>
                          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={c.spark} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={c.spark} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" dataKey="value" 
                        stroke={c.spark} strokeWidth={2} 
                        fill={`url(#grad-${color})`} 
                        isAnimationActive={true}
                      />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      )}
    </motion.div>
  );
}

export function PageHeader({ title, description, action, icon }: {
  title: string; description?: string; action?: ReactNode; icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-8 border-b border-border/60 gap-4">
      <div className="flex items-center gap-5">
        {icon && (
          <div className="h-14 w-14 rounded-2xl bg-white shadow-card border border-border/50
                          flex items-center justify-center text-primary relative">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl animate-pulse-soft" />
            <div className="relative z-10">{icon}</div>
          </div>
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">{title}</h1>
          {description && (
            <p className="text-sm font-medium text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/40 rounded-3xl border border-dashed border-slate-200">
      <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 shadow-inner">
        <div className="scale-150">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
}
