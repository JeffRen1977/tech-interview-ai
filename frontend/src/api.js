export async function apiRequest(endpoint, method, body) {
    const url = `http://localhost:3000/api${endpoint}`;
    console.log(`DEBUG: Making API request to ${url}`);
    console.log(`DEBUG: Method: ${method}`);
    console.log(`DEBUG: Body:`, body);
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : null,
        });
        
        console.log(`DEBUG: Response status: ${response.status}`);
        console.log(`DEBUG: Response headers:`, Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log(`DEBUG: Response data:`, data);
        
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
