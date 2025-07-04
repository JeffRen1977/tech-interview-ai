const fs = require('fs');
const path = require('path');

function fixJsonTags() {
  try {
    console.log('Fixing undefined tags in system design questions file...');
    
    const jsonPath = path.join(__dirname, '../../doc/full_firestore_system_design_questions.json');
    const backupPath = path.join(__dirname, '../../doc/full_firestore_system_design_questions.json.backup2');
    
    // Create backup
    fs.copyFileSync(jsonPath, backupPath);
    console.log('Created backup at:', backupPath);
    
    // Read and parse the JSON
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const questions = JSON.parse(jsonData);
    
    console.log(`Processing ${questions.length} questions...`);
    
    // Fix each question
    let fixedCount = 0;
    questions.forEach((question, index) => {
      if (question.tags === undefined || question.tags === null) {
        // Remove the tags field entirely
        delete question.tags;
        fixedCount++;
        console.log(`Fixed question ${index + 1} (${question.id || question.title}): removed undefined tags`);
      } else if (Array.isArray(question.tags) && question.tags.length === 0) {
        // Keep empty arrays as they are valid
        console.log(`Question ${index + 1} (${question.id || question.title}): tags is empty array, keeping as is`);
      } else if (typeof question.tags === 'string') {
        // Keep string tags as they are valid
        console.log(`Question ${index + 1} (${question.id || question.title}): tags is string, keeping as is`);
      } else if (Array.isArray(question.tags)) {
        // Keep array tags as they are valid
        console.log(`Question ${index + 1} (${question.id || question.title}): tags is array, keeping as is`);
      } else {
        // Convert any other type to empty array
        question.tags = [];
        fixedCount++;
        console.log(`Fixed question ${index + 1} (${question.id || question.title}): converted invalid tags to empty array`);
      }
    });
    
    // Write the fixed content back
    const fixedJsonData = JSON.stringify(questions, null, 2);
    fs.writeFileSync(jsonPath, fixedJsonData, 'utf8');
    
    console.log(`✅ Fixed ${fixedCount} questions with undefined tags`);
    
    // Validate the JSON
    try {
      JSON.parse(fixedJsonData);
      console.log('✅ JSON is still valid after fixing tags');
    } catch (parseError) {
      console.error('❌ JSON has issues after fixing tags:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Error fixing JSON tags:', error);
  }
}

// Run the script
if (require.main === module) {
  fixJsonTags();
}

module.exports = { fixJsonTags }; 