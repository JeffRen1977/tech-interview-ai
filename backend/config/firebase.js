const admin = require('firebase-admin');

let isInitialized = false;

// Initialize Firebase Admin SDK
try {
    // Check if we're in a deployment environment (Railway, Vercel, etc.)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        // Use environment variables for deployment
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
            token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
        };
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin SDK initialized successfully with environment variables');
        isInitialized = true;
    } else {
        // Fallback to local development with service account file
        try {
            const serviceAccount = require('../serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin SDK initialized successfully with service account file');
            isInitialized = true;
        } catch (fileError) {
            console.warn('Service account file not found, Firebase services will be disabled');
            console.warn('For local development, please add serviceAccountKey.json to the backend directory');
            console.warn('For deployment, please set Firebase environment variables');
        }
    }
} catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    console.error("Please ensure Firebase environment variables are set correctly");
    // Don't throw error to allow app to start, but Firebase services won't work
}

// Create safe exports that handle uninitialized Firebase
const getAuth = () => {
    if (!isInitialized) {
        throw new Error('Firebase not initialized. Please check your configuration.');
    }
    return admin.auth();
};

const getDb = () => {
    if (!isInitialized) {
        throw new Error('Firebase not initialized. Please check your configuration.');
    }
    return admin.firestore();
};

const getAdmin = () => {
    if (!isInitialized) {
        throw new Error('Firebase not initialized. Please check your configuration.');
    }
    return admin;
};

module.exports = { 
    admin: isInitialized ? admin : null, 
    auth: isInitialized ? admin.auth() : null, 
    db: isInitialized ? admin.firestore() : null,
    getAuth,
    getDb,
    getAdmin,
    isInitialized
}; 