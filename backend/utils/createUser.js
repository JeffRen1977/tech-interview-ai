const { getAuth, getDb } = require('../config/firebase');

async function createUser(email, password, name, role = 'user') {
    try {
        console.log(`=== Creating User: ${email} ===`);
        console.log(`Role: ${role}`);
        
        // Check if user already exists
        const existingUser = await getDb().collection('users').where('email', '==', email).get();
        
        if (!existingUser.empty) {
            console.log('❌ User already exists');
            return;
        }

        // Create Firebase user
        const userRecord = await getAuth().createUser({ 
            email: email, 
            password: password,
            displayName: name
        });

        // Save user information to database
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

        await getDb().collection('users').doc(userRecord.uid).set(userData);

        console.log('✅ User created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role:', role);
        
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

// Get arguments from command line
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];
const role = process.argv[5] || 'user';

if (!email || !password || !name) {
    console.log('Usage: node createUser.js <email> <password> <name> [role]');
    console.log('Example: node createUser.js admin@example.com password123 "Admin User" admin');
    console.log('Example: node createUser.js user@example.com password123 "Regular User" user');
    process.exit(1);
}

// Validate role
if (role !== 'user' && role !== 'admin') {
    console.log('❌ Invalid role. Must be "user" or "admin"');
    process.exit(1);
}

createUser(email, password, name, role); 