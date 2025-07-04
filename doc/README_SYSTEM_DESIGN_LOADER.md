# System Design Questions Loader

This directory contains scripts to load system design questions from the JSON file into Firebase Firestore.

## Files

- `backend/utils/loadSystemDesignQuestions.js` - Main script to load questions from JSON to Firebase
- `backend/utils/verifySystemDesignQuestions.js` - Verification script to check uploaded questions
- `doc/README_SYSTEM_DESIGN_LOADER.md` - This documentation file

## Usage

### Load System Design Questions

```bash
# Load questions without clearing existing data
node utils/loadSystemDesignQuestions.js

# Load questions and clear existing data first
node utils/loadSystemDesignQuestions.js --clear
# or
node utils/loadSystemDesignQuestions.js -c
```

### Verify Uploaded Questions

```bash
# Check what questions were uploaded
node utils/verifySystemDesignQuestions.js
```

## Data Structure

The script loads questions with the following structure:

```javascript
{
  id: "SD001",                    // Question ID
  category: "推荐系统",           // Category (Chinese)
  title: "设计一个短视频推荐系统", // Question title
  difficulty: "中等",             // Difficulty level
  description: "...",             // Question description
  design_steps: [...],            // Array of design steps
  answer: "...",                  // Detailed answer
  tags: [...],                    // Array of tags
  reference: "...",               // Reference information
  createdAt: Date,                // Creation timestamp
  updatedAt: Date                 // Last update timestamp
}
```

## Categories

The questions are organized into the following categories:

- 推荐系统 (Recommendation Systems)
- 图像生成 (Image Generation)
- 大语言模型 (Large Language Models)
- 自动驾驶 (Autonomous Driving)
- 多模态 (Multimodal)
- 机器学习 (Machine Learning)
- AI Agent
- 系统设计理论 (System Design Theory)
- 大模型推理 (Large Model Inference)
- 搜索系统 (Search Systems)

## Difficulty Levels

- 入门 (Beginner)
- 中等 (Intermediate)
- 困难 (Advanced)

## Firebase Collection

Questions are stored in the `system-design-questions` collection in Firestore.

## Error Handling

The script includes comprehensive error handling:

- Validates JSON file existence and format
- Handles missing or invalid question data
- Provides detailed success/error counts
- Continues processing even if individual questions fail

## Dependencies

- `firebase-admin` - Firebase Admin SDK
- `fs` - File system operations
- `path` - Path utilities

## Notes

- The script preserves the original question IDs from the JSON file
- Chinese characters are supported in titles and content
- Timestamps are converted to proper Date objects for Firestore
- The script can be run multiple times safely (use `--clear` to replace existing data) 