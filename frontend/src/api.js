export async function apiRequest(endpoint, method, body) {
    try {
        const response = await fetch(`http://localhost:3000/api${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }
        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}