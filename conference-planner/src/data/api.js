const BASE_URL = 'http://localhost:3001';

export const fetchTalks = async () => {
    const response = await fetch(`${BASE_URL}/talks`);
    if (!response.ok) {
        throw new Error('Failed to fetch talks');
    }
    return response.json();
};