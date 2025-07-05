const { getAuth, getDb } = require('../config/firebase');

async function createAdminUser() {
    const adminEmail = 'admin@aiinterview.com';
    const adminPassword = 'admin123456';
    const adminName = 'Admin User';

    try {
        // 检查管理员是否已存在
        const existingUser = await getDb().collection('users').where('email', '==', adminEmail).get();
        
        if (!existingUser.empty) {
            console.log('Admin user already exists');
            return;
        }

        // 创建Firebase用户
        const userRecord = await getAuth().createUser({ 
            email: adminEmail, 
            password: adminPassword,
            displayName: adminName
        });

        // 保存管理员信息到数据库
        const adminData = {
            uid: userRecord.uid,
            email: userRecord.email,
            name: adminName,
            role: 'admin',
            createdAt: new Date(),
            lastLogin: new Date(),
            profile: {
                targetCompanies: [],
                techStacks: [],
                language: 'chinese',
                availableTime: 2,
                otherPreferences: ''
            }
        };

        await getDb().collection('users').doc(userRecord.uid).set(adminData);

        console.log('Admin user created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('Role: admin');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

// 运行脚本
createAdminUser(); 