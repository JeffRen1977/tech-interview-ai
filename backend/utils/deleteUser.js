const { auth, db } = require('../config/firebase');

async function deleteUser(email) {
    try {
        console.log(`=== Deleting User: ${email} ===`);
        
        // Find the user in Firebase Auth
        const userRecord = await auth.getUserByEmail(email);
        console.log(`Found user in Firebase Auth: ${userRecord.uid}`);
        
        // Delete from Firestore first
        const firestoreUser = await db.collection('users').doc(userRecord.uid).get();
        if (firestoreUser.exists) {
            await db.collection('users').doc(userRecord.uid).delete();
            console.log(`✅ Deleted user from Firestore`);
        } else {
            console.log(`User not found in Firestore`);
        }
        
        // Delete from Firebase Auth
        await auth.deleteUser(userRecord.uid);
        console.log(`✅ Deleted user from Firebase Auth`);
        
        console.log(`✅ User ${email} has been completely deleted`);
        
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
    console.log('Usage: node deleteUser.js <email>');
    console.log('Example: node deleteUser.js jianfengren.sd@gmail.com');
    process.exit(1);
}

deleteUser(email); 