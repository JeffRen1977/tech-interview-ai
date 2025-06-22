const admin = require('firebase-admin');

// 初始化Firebase Admin SDK
try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error("Firebase Admin SDK 初始化失败。", error);
}

const auth = admin.auth();
const db = admin.firestore();

exports.registerUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const userRecord = await auth.createUser({ email, password });
        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            createdAt: new Date()
        });
        res.status(201).json({ message: 'User created successfully', uid: userRecord.uid, email: userRecord.email });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const userRecord = await auth.getUserByEmail(email);
        // 在生产环境中, 您应该验证密码并返回一个会话token (JWT)。
        // 为了简化示例，我们只检查用户是否存在。
        res.status(200).json({ message: 'Login successful', uid: userRecord.uid, email: userRecord.email });
    } catch (error) {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};