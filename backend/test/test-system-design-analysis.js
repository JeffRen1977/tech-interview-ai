async function testSystemDesignAnalysis() {
    const testData = {
        questionData: {
            title: '设计一个分布式缓存系统',
            description: '设计一个高性能的分布式缓存系统，支持高并发读写操作',
            difficulty: 'medium',
            topic: 'distributed-systems'
        },
        whiteboardData: [
            { type: 'rectangle', x: 100, y: 100, width: 200, height: 100, text: 'Client' },
            { type: 'rectangle', x: 400, y: 100, width: 200, height: 100, text: 'Load Balancer' },
            { type: 'rectangle', x: 700, y: 100, width: 200, height: 100, text: 'Cache Server' }
        ],
        voiceInput: '我设计了一个分布式缓存系统，包含客户端、负载均衡器和缓存服务器。使用一致性哈希算法进行数据分片，支持主从复制保证高可用性。',
        timeSpent: 300
    };

    try {
        console.log('测试系统设计分析API...');
        console.log('请求数据:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:3000/api/system-design/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ 系统设计分析API测试成功！');
        } else {
            console.log('❌ 系统设计分析API测试失败:', result.message);
        }
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testSystemDesignAnalysis(); 