export async function apiRequest(endpoint, method, body) {
    try {
        const response = await fetch(`http://localhost:3000/api${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // 如果请求失败，抛出一个包含后端错误信息的错误
            throw new Error(data.message || 'An unknown error occurred');
        }
        
        return data;
    } catch (error) {
        console.error(`API Request Error on ${endpoint}:`, error);
        // 将错误继续向上抛出，让调用者处理
        throw error;
    }
}
