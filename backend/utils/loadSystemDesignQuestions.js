const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to create a slug from title for document ID
function createSlug(title) {
  if (!title) return null;
  return title.toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-') // Allow Chinese characters
    .replace(/^-+|-+$/g, '');
}

// Function to load and process system design questions
async function loadSystemDesignQuestions() {
  try {
    console.log('Loading system design questions from JSON file...');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../../doc/full_firestore_system_design_questions.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const questions = JSON.parse(jsonData);
    
    console.log(`Found ${questions.length} questions in the JSON file`);
    
    // Get the system-design-questions collection reference
    const collectionRef = db.collection('system-design-questions');
    
    // Process each question
    const promises = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const question of questions) {
      try {
        // Use the existing ID from the JSON if available, otherwise create a slug
        let docId = question.id || createSlug(question.title);
        
        if (!docId) {
          console.error(`Missing ID and title for question:`, question);
          errorCount++;
          continue;
        }
        
        // Prepare the document data
        const docData = {
          id: question.id,
          category: question.category,
          title: question.title,
          difficulty: question.difficulty,
          description: question.description,
          design_steps: question.design_steps,
          answer: question.answer,
          tags: question.tags,
          reference: question.reference,
          createdAt: question.createdAt ? new Date(question.createdAt) : new Date(),
          updatedAt: new Date()
        };
        
        // Add to batch
        promises.push(collectionRef.doc(docId).set(docData));
        successCount++;
        
      } catch (error) {
        console.error(`Error processing question ${question.id || question.title}:`, error);
        errorCount++;
      }
    }
    
    // Execute all promises
    console.log(`Uploading ${promises.length} questions to Firebase...`);
    await Promise.all(promises);
    
    console.log(`\n✅ Successfully uploaded ${successCount} questions to system-design-questions collection`);
    if (errorCount > 0) {
      console.log(`❌ Failed to upload ${errorCount} questions`);
    }
    
    // Verify the upload by counting documents in the collection
    const snapshot = await collectionRef.get();
    console.log(`📊 Total documents in system-design-questions collection: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error loading system design questions:', error);
    throw error;
  }
}

// Function to clear existing questions (optional)
async function clearSystemDesignQuestions() {
  try {
    console.log('Clearing existing system-design-questions collection...');
    
    const collectionRef = db.collection('system-design-questions');
    const snapshot = await collectionRef.get();
    
    const deletePromises = [];
    snapshot.docs.forEach((doc) => {
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    console.log(`✅ Cleared ${snapshot.size} existing documents`);
    
  } catch (error) {
    console.error('❌ Error clearing collection:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting system design questions upload...\n');
    
    // Check if user wants to clear existing data
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear') || args.includes('-c');
    
    if (shouldClear) {
      await clearSystemDesignQuestions();
      console.log('');
    }
    
    await loadSystemDesignQuestions();
    
    console.log('\n🎉 System design questions upload completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Failed to upload system design questions:', error);
    process.exit(1);
  } finally {
    // Close the Firebase connection
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { loadSystemDesignQuestions, clearSystemDesignQuestions }; 