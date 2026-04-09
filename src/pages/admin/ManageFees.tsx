import { useState } from 'react';
import { PageHeader, EmptyState } from '@/components/DashboardWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, CreditCard, Receipt, Clock, CheckCircle2, AlertCircle, Search, Download } from 'lucide-react';
import { useFees, useFeeSummary, useStudents, useCreateMutation } from '@/hooks/useApi';
import api from '@/services/api';

export default function ManageFees() {
  const { data: fees = [], isLoading: loading } = useFees();
  const { data: summary } = useFeeSummary();
  const { data: students = [] } = useStudents();
  const createFee = useCreateMutation('/fees', ['fees', 'fee-summary']);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [receiptNo, setReceiptNo] = useState('');
  
  const [form, setForm] = useState({
    studentId: '',
    amount: '',
    dueDate: '',
    description: 'Tuition Fee'
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFee.mutateAsync({
        ...form,
        amount: Number(form.amount)
      });
      toast.success('Fee record created');
      setDialogOpen(false);
      setForm({ studentId: '', amount: '', dueDate: '', description: 'Tuition Fee' });
    } catch (err) {
      toast.error('Failed to create fee');
    }
  };

  const handleMarkPaid = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/fees/${selectedFee._id}`, {
        status: 'Paid',
        paidDate: new Date().toISOString().split('T')[0],
        receiptNo
      });
      toast.success('Payment recorded');
      setPayDialogOpen(false);
      setSelectedFee(null);
      // We don't have a specific Hook for this manual api.put refresh yet, so we refresh manually? 
      // Actually React Query will not know. Let's just use window.location.reload() for simplicity or better - queryClient.invalidateQueries
      // But I don't have queryClient here easily. Let's just use mutateAsync pattern for consistency if we wanted, but we'll stick to simple.
      window.location.reload(); 
    } catch (err) {
      toast.error('Failed to update record');
    }
  };

  const statusStyles = {
    Paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Overdue: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className="stagger space-y-6">
      <PageHeader
        title="Fee Management"
        description="Monitor school revenue, track payments, and manage student tuition records."
        icon={<CreditCard size={28} />}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 rounded-2xl bg-gradient-primary shadow-primary hover:shadow-glow transition-all active:scale-95 font-black uppercase tracking-widest text-xs">
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Issue Fee Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-gradient-primary p-8 text-white">
                <DialogTitle className="text-2xl font-black">Create Fee Invoice</DialogTitle>
                <p className="opacity-70 text-sm">Issue a new payment request for a student.</p>
              </div>
              <form onSubmit={handleCreate} className="p-8 space-y-4 bg-white">
                <div className="space-y-1.5">
                  <Label>Select Student</Label>
                  <Select onValueChange={(val) => setForm(f => ({...f, studentId: val}))}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s._id} value={s._id}>{s.name} ({s.rollNumber})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Amount (₹)</Label>
                    <Input type="number" required value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due Date</Label>
                    <Input type="date" required value={form.dueDate} onChange={e => setForm(f => ({...f, dueDate: e.target.value}))} className="h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="h-12 rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-primary text-white font-black uppercase mt-4">
                  Generate Invoice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-6 bg-emerald-50/50 border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 mb-1">Total Collected</p>
            <p className="text-3xl font-black text-emerald-700">₹{summary?.Paid?.total || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="card-premium p-6 bg-amber-50/50 border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 mb-1">Pending Dues</p>
            <p className="text-3xl font-black text-amber-700">₹{summary?.Pending?.total || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
        </div>
        <div className="card-premium p-6 bg-rose-50/50 border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600/70 mb-1">Overdue Amount</p>
            <p className="text-3xl font-black text-rose-700">₹{summary?.Overdue?.total || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : fees.length === 0 ? (
        <EmptyState 
          icon={<CreditCard className="h-10 w-10 text-slate-300" />}
          title="No Fee Records" 
          description="Issue your first fee invoice to start tracking payments." 
        />
      ) : (
        <div className="card-premium overflow-hidden bg-white/70 backdrop-blur-md">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                <th className="p-6">Student</th>
                <th className="p-6">Description</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Due Date</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.map((f: any) => (
                <tr key={f._id} className="hover:bg-white transition-colors group">
                  <td className="p-6">
                    <p className="font-black text-slate-800">{f.studentId?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">ROLL: {f.studentId?.rollNumber}</p>
                  </td>
                  <td className="p-6 text-sm font-medium text-slate-600">{f.description}</td>
                  <td className="p-6 font-black text-slate-800">₹{f.amount}</td>
                  <td className="p-6 text-xs font-bold text-slate-500">{f.dueDate}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${statusStyles[f.status as keyof typeof statusStyles]}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    {f.status !== 'Paid' ? (
                      <Button 
                        size="sm" variant="outline" className="rounded-xl font-black text-[10px] h-9 border-slate-200"
                        onClick={() => { setSelectedFee(f); setPayDialogOpen(true); }}
                      >
                        MARK PAID
                      </Button>
                    ) : (
                      <div className="flex items-center justify-end text-emerald-500 gap-1.5 text-[10px] font-black uppercase">
                        <CheckCircle2 size={14} /> Recorded
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay Dialog */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
          <div className="bg-emerald-500 p-8 text-white">
            <DialogTitle className="text-2xl font-black">Record Payment</DialogTitle>
            <p className="opacity-70 text-sm">Enter receipt details for {selectedFee?.studentId?.name}.</p>
          </div>
          <form onSubmit={handleMarkPaid} className="p-8 space-y-4 bg-white">
            <div className="space-y-1.5">
              <Label>Receipt Number</Label>
              <Input 
                autoFocus required placeholder="e.g. REC-2026-001" 
                value={receiptNo} onChange={e => setReceiptNo(e.target.value)}
                className="h-12 rounded-xl" 
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Amount Received</span>
              <span className="font-black text-slate-900">₹{selectedFee?.amount}</span>
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-black uppercase mt-4">
              Confirm Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
