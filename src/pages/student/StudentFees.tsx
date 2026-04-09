import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { CreditCard, Rocket, CheckCircle2, Clock, AlertCircle, Download, FileText } from 'lucide-react';
import { useFees } from '@/hooks/useApi';

export default function StudentFees() {
  const { data: fees = [], isLoading: loading } = useFees();

  const statusStyles = {
    Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Overdue: "bg-rose-50 text-rose-600 border-rose-100"
  };

  const statusIcons = {
    Paid: <CheckCircle2 size={16} />,
    Pending: <Clock size={16} />,
    Overdue: <AlertCircle size={16} />
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="My Fee History"
        description="Track your tuition fees, payment status, and download receipts for official records."
        icon={<CreditCard size={28} />}
        action={
          <Button onClick={handlePrint} className="h-12 px-6 rounded-2xl bg-slate-900 border-slate-700 shadow-xl hover:bg-black transition-all active:scale-95 font-black uppercase tracking-widest text-xs hidden print:hidden md:flex">
             <Download className="h-4 w-4 mr-2" strokeWidth={3} /> Download History
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-32"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : fees.length === 0 ? (
        <EmptyState 
          icon={<Rocket className="h-10 w-10" />} 
          title="No Fee Records" 
          description="Wait for the school admin to issue your next fee invoice." 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {fees.map((f: any) => (
            <div key={f._id} className="card-premium p-8 relative overflow-hidden group">
               {/* Decorative Gradient Background */}
               <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${f.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
               
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${statusStyles[f.status as keyof typeof statusStyles]}`}>
                       {statusIcons[f.status as keyof typeof statusIcons]}
                       {f.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.dueDate}</span>
                 </div>

                 <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{f.description}</p>
                 <h3 className="text-3xl font-black text-slate-800 mb-6">₹{f.amount}</h3>

                 {f.status === 'Paid' && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                       <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                          <span>Receipt No</span>
                          <span className="text-slate-800 font-black">{f.receiptNo}</span>
                       </div>
                       <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span>Paid On</span>
                          <span className="text-slate-800 font-black">{f.paidDate}</span>
                       </div>
                    </div>
                 )}

                 {f.status === 'Paid' ? (
                   <Button variant="outline" className="w-full h-12 rounded-xl text-slate-400 border-slate-200 hover:text-slate-900 transition-all font-black uppercase text-[10px] group">
                      <FileText size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Print Receipt
                   </Button>
                 ) : (
                   <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                      <AlertCircle className="text-amber-500 shrink-0" size={18} />
                      <p className="text-[10px] font-black text-amber-700 leading-tight uppercase">Pay at the school counter to receive your official registration slip.</p>
                   </div>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
