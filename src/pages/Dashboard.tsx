import React, { useEffect, useState } from 'react';
import { VehicleForm } from '@/components/VehicleForm';
import { useToast } from '@/hooks/use-toast';
import { AuthApi, TripApi, Vehicle, VehicleApi } from '@/lib/api';

interface VehicleUsageItem {
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
	const [usageHistory, setUsageHistory] = useState<VehicleUsageItem[]>([]);
	const [vehicles, setVehicles] = useState<Vehicle[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		const load = async () => {
			try {
				const [v, r] = await Promise.all([
					VehicleApi.list(),
					TripApi.recent(10),
				]);
				setVehicles(v.vehicles);
				setUsageHistory(
					r.trips.map((t) => ({
						id: String(t.id),
						vehicleId: String(t.vehicle_id),
						vehicleName: `${t.vehicle_name} - ${t.license_plate}`,
						driverName: t.full_name,
						startDate: new Date(t.start_datetime.replace(' ', 'T')),
						endDate: new Date(t.end_datetime.replace(' ', 'T')),
						startKm: t.start_odometer,
						endKm: t.end_odometer,
						purpose: t.purpose || '',
						createdAt: new Date(t.created_at.replace(' ', 'T')),
					}))
				);
			} catch (e: any) {
				// ignore; likely not logged in
			}
		};
		load();
	}, []);

	const handleSubmit = async (data: {
		vehicleId: string;
		vehicleName: string;
		driverName: string;
		startDate: Date;
		endDate: Date;
		startKm: number;
		endKm: number;
		purpose: string;
	}) => {
		setIsLoading(true);
		try {
			const payload = {
				vehicleId: Number(data.vehicleId),
				startDatetime: `${data.startDate.toISOString().slice(0, 16).replace('T', ' ')}`,
				endDatetime: `${data.endDate.toISOString().slice(0, 16).replace('T', ' ')}`,
				startOdometer: data.startKm,
				endOdometer: data.endKm,
				purpose: data.purpose,
			};
			const { trip } = await TripApi.create(payload);
			setUsageHistory((prev) => [
				{
					id: String(trip.id),
					vehicleId: String(trip.vehicle_id),
					vehicleName: `${trip.vehicle_name} - ${trip.license_plate}`,
					driverName: trip.full_name,
					startDate: new Date(trip.start_datetime.replace(' ', 'T')),
					endDate: new Date(trip.end_datetime.replace(' ', 'T')),
					startKm: trip.start_odometer,
					endKm: trip.end_odometer,
					purpose: trip.purpose || '',
					createdAt: new Date(trip.created_at.replace(' ', 'T')),
				},
				...prev,
			].slice(0, 10));
			toast({ title: 'บันทึกสำเร็จ', description: 'ข้อมูลการใช้งานรถได้ถูกบันทึกแล้ว' });
		} catch (error: any) {
			toast({
				title: 'เกิดข้อผิดพลาด',
				description: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่',
				variant: 'destructive',
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogoutClick = async () => {
		try { await AuthApi.logout(); } catch {}
		onLogout();
	};

	return (
		<VehicleForm
			currentUser={currentUser}
			onSubmit={handleSubmit}
			onLogout={handleLogoutClick}
			usageHistory={usageHistory}
			isLoading={isLoading}
			vehicles={vehicles}
		/>
	);
};