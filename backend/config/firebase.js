const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db }; 