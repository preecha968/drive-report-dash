import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Car, User, MapPin, Clock, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Vehicle } from '@/lib/api';

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

interface VehicleFormProps {
	currentUser: string;
	onSubmit: (data: Omit<VehicleUsage, 'id' | 'createdAt'>) => void;
	onLogout: () => void;
	usageHistory: VehicleUsage[];
	isLoading?: boolean;
	vehicles: Vehicle[];
}

export const VehicleForm: React.FC<VehicleFormProps> = ({ 
	currentUser, 
	onSubmit, 
	onLogout, 
	usageHistory, 
	isLoading,
	vehicles,
}) => {
	const [vehicleId, setVehicleId] = useState('');
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [startKm, setStartKm] = useState('');
	const [endKm, setEndKm] = useState('');
	const [purpose, setPurpose] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!vehicleId || !startDate || !endDate || !startKm || !endKm || !purpose) {
			alert('กรุณากรอกข้อมูลให้ครบถ้วน');
			return;
		}

		const vehicleName = vehicles.find(v => String(v.id) === vehicleId)
			? `${vehicles.find(v => String(v.id) === vehicleId)!.name} - ${vehicles.find(v => String(v.id) === vehicleId)!.license_plate}`
			: '';
		
		onSubmit({
			vehicleId,
			vehicleName,
			driverName: currentUser,
			startDate,
			endDate,
			startKm: parseInt(startKm),
			endKm: parseInt(endKm),
			purpose,
		});

		// Reset form
		setVehicleId('');
		setStartDate(undefined);
		setEndDate(undefined);
		setStartKm('');
		setEndKm('');
		setPurpose('');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
			{/* Header */}
			<header className="bg-card shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-3">
							<div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
								<Car className="w-6 h-6 text-primary-foreground" />
							</div>
							<div>
								<h1 className="text-xl font-bold text-foreground">Vehicle Usage System</h1>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2 text-sm text-muted-foreground">
								<User className="w-4 h-4" />
								<span>{currentUser}</span>
							</div>
							<Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
								<LogOut className="w-4 h-4" />
								<span>ออกจากระบบ</span>
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Vehicle Usage Form */}
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Car className="w-5 h-5 text-primary" />
								<span>บันทึกการใช้งานรถ</span>
							</CardTitle>
							<CardDescription>
								กรุณากรอกข้อมูลการใช้งานรถของคุณ
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="vehicle">เลือกรถ</Label>
									<Select value={vehicleId} onValueChange={setVehicleId} required>
										<SelectTrigger className="h-12">
											<SelectValue placeholder="เลือกรถที่ต้องการใช้งาน" />
										</SelectTrigger>
										<SelectContent>
											{vehicles.map((vehicle) => (
												<SelectItem key={vehicle.id} value={String(vehicle.id)}>
													{vehicle.name} - {vehicle.license_plate}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>ผู้ขับ</Label>
									<Input 
										value={currentUser} 
										disabled 
										className="h-12 bg-muted"
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>วันเวลาเริ่ม</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"h-12 justify-start text-left font-normal",
														!startDate && "text-muted-foreground"
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{startDate ? format(startDate, "dd/MM/yyyy", { locale: th }) : <span>เลือกวันที่</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={startDate}
													onSelect={setStartDate}
													initialFocus
													className="pointer-events-auto"
												/>
											</PopoverContent>
										</Popover>
									</div>

									<div className="space-y-2">
										<Label>วันเวลาสิ้นสุด</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"h-12 justify-start text-left font-normal",
														!endDate && "text-muted-foreground"
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{endDate ? format(endDate, "dd/MM/yyyy", { locale: th }) : <span>เลือกวันที่</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={endDate}
													onSelect={setEndDate}
													initialFocus
													className="pointer-events-auto"
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="startKm">ระยะทางเริ่ม (กม.)</Label>
										<Input
											id="startKm"
											type="number"
											placeholder="0"
											value={startKm}
											onChange={(e) => setStartKm(e.target.value)}
											className="h-12"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="endKm">ระยะทางสิ้นสุด (กม.)</Label>
										<Input
											id="endKm"
											type="number"
											placeholder="0"
											value={endKm}
											onChange={(e) => setEndKm(e.target.value)}
											className="h-12"
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="purpose">วัตถุประสงค์</Label>
									<Textarea
										id="purpose"
										placeholder="บอกวัตถุประสงค์ของการใช้รถ เช่น ไปธุรกิจ, ไปงานโครงการ, ฯลฯ"
										value={purpose}
										onChange={(e) => setPurpose(e.target.value)}
										className="min-h-20"
										required
									/>
								</div>

								<Button 
									type="submit" 
									className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
									disabled={isLoading}
								>
									{isLoading ? 'กำลังบันทึก...' : 'บันทึกการใช้งาน'}
								</Button>
							</form>
						</CardContent>
					</Card>

					{/* Usage History */}
					<Card className="shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Clock className="w-5 h-5 text-primary" />
								<span>ประวัติการใช้งานล่าสุด</span>
							</CardTitle>
							<CardDescription>
								รายการการใช้งานรถ 10 รายการล่าสุด
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4 max-h-96 overflow-y-auto">
								{usageHistory.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
										<p>ยังไม่มีประวัติการใช้งาน</p>
									</div>
								) : (
									usageHistory.map((usage) => (
										<div key={usage.id} className="border rounded-lg p-4 space-y-2">
											<div className="flex justify-between items-start">
												<h4 className="font-medium text-foreground">{usage.vehicleName}</h4>
												<span className="text-xs text-muted-foreground">
													{format(usage.createdAt, "dd/MM/yyyy HH:mm", { locale: th })}
												</span>
											</div>
											<p className="text-sm text-muted-foreground">ผู้ขับ: {usage.driverName}</p>
											<p className="text-sm text-muted-foreground">
												วันที่: {format(usage.startDate, "dd/MM/yyyy", { locale: th })} - {format(usage.endDate, "dd/MM/yyyy", { locale: th })}
											</p>
											<p className="text-sm text-muted-foreground">
												ระยะทาง: {usage.startKm} - {usage.endKm} กม. ({usage.endKm - usage.startKm} กม.)
											</p>
											<p className="text-sm">{usage.purpose}</p>
										</div>
									))
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};