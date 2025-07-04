const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verifySystemDesignQuestions() {
  try {
    console.log('🔍 Verifying system design questions in Firebase...\n');
    
    const collectionRef = db.collection('system-design-questions');
    const snapshot = await collectionRef.get();
    
    console.log(`📊 Total documents in collection: ${snapshot.size}\n`);
    
    if (snapshot.empty) {
      console.log('❌ No documents found in the collection');
      return;
    }
    
    console.log('📋 Document details:');
    console.log('─'.repeat(80));
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${data.id || doc.id}`);
      console.log(`   Title: ${data.title}`);
      console.log(`   Category: ${data.category}`);
      console.log(`   Difficulty: ${data.difficulty}`);
      console.log(`   Tags: ${data.tags ? data.tags.join(', ') : 'N/A'}`);
      console.log(`   Created: ${data.createdAt ? data.createdAt.toDate().toISOString() : 'N/A'}`);
      console.log('');
    });
    
    // Group by category
    const categories = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(data.title);
    });
    
    console.log('📂 Questions by category:');
    console.log('─'.repeat(80));
    Object.entries(categories).forEach(([category, titles]) => {
      console.log(`${category} (${titles.length}):`);
      titles.forEach(title => console.log(`  - ${title}`));
      console.log('');
    });
    
    // Group by difficulty
    const difficulties = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const difficulty = data.difficulty || 'Unknown';
      if (!difficulties[difficulty]) {
        difficulties[difficulty] = [];
      }
      difficulties[difficulty].push(data.title);
    });
    
    console.log('📈 Questions by difficulty:');
    console.log('─'.repeat(80));
    Object.entries(difficulties).forEach(([difficulty, titles]) => {
      console.log(`${difficulty} (${titles.length}):`);
      titles.forEach(title => console.log(`  - ${title}`));
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error verifying system design questions:', error);
  } finally {
    process.exit(0);
  }
}

// Run the verification
verifySystemDesignQuestions(); 