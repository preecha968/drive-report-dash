export type User = {
	id: number;
	username: string;
	employee_id: string;
	full_name: string;
	role: string;
};

export type Vehicle = {
	id: number;
	name: string;
	license_plate: string;
};

export type TripPayload = {
	vehicleId: number;
	startDatetime: string;
	endDatetime: string;
	startOdometer: number;
	endOdometer: number;
	purpose?: string;
};

export type Trip = {
	id: number;
	user_id: number;
	vehicle_id: number;
	start_datetime: string;
	end_datetime: string;
	start_odometer: number;
	end_odometer: number;
	purpose?: string | null;
	created_at: string;
	vehicle_name: string;
	license_plate: string;
	full_name: string;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(path, {
		...init,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...(init?.headers || {}),
		},
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || res.statusText);
	}
	return res.json();
}

export const AuthApi = {
	async login(usernameOrEmployeeId: string, password: string): Promise<{ user: User }> {
		return apiFetch('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({ usernameOrEmployeeId, password }),
		});
	},
	async me(): Promise<{ user: User }> {
		return apiFetch('/api/auth/me');
	},
	async logout(): Promise<{ ok: boolean }> {
		return apiFetch('/api/auth/logout', { method: 'POST' });
	},
};

export const VehicleApi = {
	async list(): Promise<{ vehicles: Vehicle[] }> {
		return apiFetch('/api/vehicles');
	},
};

export const TripApi = {
	async create(payload: TripPayload): Promise<{ trip: Trip }> {
		return apiFetch('/api/trips', { method: 'POST', body: JSON.stringify(payload) });
	},
	async recent(limit = 10): Promise<{ trips: Trip[] }> {
		return apiFetch(`/api/trips/recent?limit=${limit}`);
	},
}; 