const { auth, db } = require('./config/firebase');

async function checkUsers() {
    try {
        console.log('=== Checking Firebase Auth Users ===');
        
        // List all Firebase Auth users
        const listUsersResult = await auth.listUsers();
        console.log(`Found ${listUsersResult.users.length} users in Firebase Auth:`);
        
        listUsersResult.users.forEach(user => {
            console.log(`- Email: ${user.email}, UID: ${user.uid}, Display Name: ${user.displayName || 'N/A'}`);
        });

        console.log('\n=== Checking Firestore Users ===');
        
        // List all users in Firestore
        const firestoreUsers = await db.collection('users').get();
        console.log(`Found ${firestoreUsers.size} users in Firestore:`);
        
        firestoreUsers.forEach(doc => {
            const userData = doc.data();
            console.log(`- Email: ${userData.email}, UID: ${userData.uid}, Name: ${userData.name}, Role: ${userData.role}`);
        });

        // Check for synchronization issues
        console.log('\n=== Checking for Synchronization Issues ===');
        
        const authEmails = listUsersResult.users.map(user => user.email);
        const firestoreEmails = firestoreUsers.docs.map(doc => doc.data().email);
        
        const authOnly = authEmails.filter(email => !firestoreEmails.includes(email));
        const firestoreOnly = firestoreEmails.filter(email => !authEmails.includes(email));
        
        if (authOnly.length > 0) {
            console.log('Users in Firebase Auth but not in Firestore:');
            authOnly.forEach(email => console.log(`- ${email}`));
        }
        
        if (firestoreOnly.length > 0) {
            console.log('Users in Firestore but not in Firebase Auth:');
            firestoreOnly.forEach(email => console.log(`- ${email}`));
        }
        
        if (authOnly.length === 0 && firestoreOnly.length === 0) {
            console.log('✅ All users are synchronized between Firebase Auth and Firestore');
        }

    } catch (error) {
        console.error('Error checking users:', error);
    }
}

// Run the check
checkUsers(); 