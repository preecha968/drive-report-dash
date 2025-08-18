import React, { useState } from 'react';
import { VehicleForm } from '@/components/VehicleForm';
import { useToast } from '@/hooks/use-toast';

interface VehicleUsage {
  id: string;
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  startDate: Date;
  endDate: Date;
  startKm: number;
  endKm: number;
  purpose: string;
  createdAt: Date;
}

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [usageHistory, setUsageHistory] = useState<VehicleUsage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: Omit<VehicleUsage, 'id' | 'createdAt'>) => {
    setIsLoading(true);

    try {
      // Simulate API call - in real app, this would be a Supabase call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUsage: VehicleUsage = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
      };

      setUsageHistory(prev => [newUsage, ...prev.slice(0, 9)]);
      
      toast({
        title: "บันทึกสำเร็จ",
        description: "ข้อมูลการใช้งานรถได้ถูกบันทึกแล้ว",
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VehicleForm
      currentUser={currentUser}
      onSubmit={handleSubmit}
      onLogout={onLogout}
      usageHistory={usageHistory}
      isLoading={isLoading}
    />
  );
};