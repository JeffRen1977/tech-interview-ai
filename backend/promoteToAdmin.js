const { auth, db } = require('./config/firebase');

async function promoteToAdmin(email) {
    try {
        console.log(`=== Promoting User to Admin: ${email} ===`);
        
        // Find the user in Firebase Auth
        const userRecord = await auth.getUserByEmail(email);
        console.log(`Found user in Firebase Auth: ${userRecord.uid}`);
        
        // Update user role in Firestore
        const userRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log('❌ User not found in Firestore');
            return;
        }
        
        await userRef.update({
            role: 'admin',
            updatedAt: new Date()
        });
        
        console.log(`✅ User ${email} has been promoted to admin`);
        
        // Verify the change
        const updatedDoc = await userRef.get();
        const userData = updatedDoc.data();
        console.log(`Current role: ${userData.role}`);
        
    } catch (error) {
        console.error('Error promoting user:', error);
    }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
    console.log('Usage: node promoteToAdmin.js <email>');
    console.log('Example: node promoteToAdmin.js user@example.com');
    process.exit(1);
}

promoteToAdmin(email); 