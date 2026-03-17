import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardWrapper({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
