const { auth, db } = require('../config/firebase');

async function fixUsers() {
    try {
        console.log('=== Fixing User Synchronization ===');
        
        // List all Firebase Auth users
        const listUsersResult = await auth.listUsers();
        console.log(`Found ${listUsersResult.users.length} users in Firebase Auth`);
        
        // Check each user and add to Firestore if missing
        for (const user of listUsersResult.users) {
            console.log(`\nChecking user: ${user.email}`);
            
            // Check if user exists in Firestore
            const firestoreUser = await db.collection('users').doc(user.uid).get();
            
            if (!firestoreUser.exists) {
                console.log(`User ${user.email} not found in Firestore, adding...`);
                
                // Determine role based on email
                const role = user.email === 'admin@aiinterview.com' ? 'admin' : 'user';
                const name = user.displayName || user.email.split('@')[0];
                
                // Create user data
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    name: name,
                    role: role,
                    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
                    lastLogin: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : new Date(),
                    profile: {
                        targetCompanies: [],
                        techStacks: [],
                        language: 'chinese',
                        availableTime: 2,
                        otherPreferences: ''
                    }
                };
                
                // Save to Firestore
                await db.collection('users').doc(user.uid).set(userData);
                console.log(`✅ Added user ${user.email} to Firestore with role: ${role}`);
            } else {
                console.log(`✅ User ${user.email} already exists in Firestore`);
            }
        }
        
        console.log('\n=== User Synchronization Complete ===');
        
        // Verify the fix
        const firestoreUsers = await db.collection('users').get();
        console.log(`Total users in Firestore: ${firestoreUsers.size}`);
        
    } catch (error) {
        console.error('Error fixing users:', error);
    }
}

// Run the fix
fixUsers(); 