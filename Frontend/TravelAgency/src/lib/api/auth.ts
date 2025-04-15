import { API_BASE_URL } from './config'; 

interface LoginCredentials {
    agencyId: string;
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
}

export const loginAgencyAdmin = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/agency/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            agency_id: credentials.agencyId,
            email: credentials.email,
            password: credentials.password,
        }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
    }

    return await response.json();
};