const { auth, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT密钥 - 在生产环境中应该使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 生成JWT token
const generateToken = (userId, email, role) => {
    return jwt.sign(
        { userId, email, role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// 验证JWT token中间件
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// 验证管理员权限中间件
exports.verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

exports.registerUser = async (req, res) => {
    console.log('DEBUG: Registration request received');
    console.log('DEBUG: Request body:', req.body);
    
    const { email, password, name, role = 'user' } = req.body;
    
    console.log('DEBUG: Extracted data:', { email, password: password ? '[HIDDEN]' : 'undefined', name, role });
    
    if (!email || !password || !name) {
        console.log('DEBUG: Missing required fields');
        console.log('DEBUG: email exists:', !!email);
        console.log('DEBUG: password exists:', !!password);
        console.log('DEBUG: name exists:', !!name);
        return res.status(400).json({ message: 'Email, password and name are required.' });
    }

    // 验证角色
    if (role !== 'user' && role !== 'admin') {
        console.log('DEBUG: Invalid role:', role);
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        console.log('DEBUG: Checking if user already exists');
        // 检查用户是否已存在
        const existingUser = await db.collection('users').where('email', '==', email).get();
        if (!existingUser.empty) {
            console.log('DEBUG: User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('DEBUG: Creating Firebase user');
        // 创建Firebase用户
        const userRecord = await auth.createUser({ 
            email, 
            password,
            displayName: name
        });

        console.log('DEBUG: Firebase user created, saving to database');
        // 保存用户信息到数据库
        const userData = {
            uid: userRecord.uid,
            email: userRecord.email,
            name: name,
            role: role,
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

        await db.collection('users').doc(userRecord.uid).set(userData);

        console.log('DEBUG: User saved to database, generating token');
        // 生成JWT token
        const token = generateToken(userRecord.uid, userRecord.email, role);

        console.log('DEBUG: Registration successful');
        res.status(201).json({ 
            message: 'User created successfully', 
            token,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                name: name,
                role: role
            }
        });
    } catch (error) {
        console.error('DEBUG: Registration error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 从数据库获取用户信息
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        
        if (userSnapshot.empty) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // 验证Firebase用户
        const userRecord = await auth.getUserByEmail(email);
        
        // 更新最后登录时间
        await db.collection('users').doc(userData.uid).update({
            lastLogin: new Date()
        });

        // 生成JWT token
        const token = generateToken(userData.uid, userData.email, userData.role);

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                uid: userData.uid,
                email: userData.email,
                name: userData.name,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const userSnapshot = await db.collection('users').doc(req.user.userId).get();
        
        if (!userSnapshot.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userSnapshot.data();
        
        res.status(200).json({
            user: {
                uid: userData.uid,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                profile: userData.profile
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, profile } = req.body;
    
    try {
        const updateData = {};
        if (name) updateData.name = name;
        if (profile) updateData.profile = profile;

        await db.collection('users').doc(req.user.userId).update(updateData);

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
    }

    try {
        // 获取用户信息
        const userSnapshot = await db.collection('users').doc(req.user.userId).get();
        const userData = userSnapshot.data();

        // 更新Firebase用户密码
        await auth.updateUser(userData.uid, {
            password: newPassword
        });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};