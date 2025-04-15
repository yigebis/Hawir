import { API_BASE_URL } from './config'; 

export interface AgencyData {
    id: string;
    unique_id: string;
    name: string;
    registration_date?: string;
    services?: string[];
    logo_url?: string;
    description: string;
    contact: string[];
    language?: string;
    calendar?: string;
    super_admin_email: string;
}

interface PasswordResetPayload {
    agency_id: string;
    old_password: string;
    new_password: string;
}

export const getAgencyByUniqueID = async (uniqueID: string, token: string): Promise<AgencyData> => {
    const response = await fetch(`${API_BASE_URL}/agency/${uniqueID}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch agency data');
    }

    return await response.json() as AgencyData;
};

export const resetAgencyPassword = async (payload: PasswordResetPayload) => {
    const response = await fetch(`${API_BASE_URL}/agency/password/reset`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    return response;
};