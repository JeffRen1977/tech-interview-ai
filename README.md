# AI Interview Agent

An intelligent interview preparation platform that provides AI-powered mock interviews for coding, system design, and behavioral questions.

## Features

### 🎯 Mock Interview Module
- **Coding Interview**: Simulate whiteboard coding questions with AI feedback
- **System Design Interview**: Practice system architecture questions (coming soon)
- **Behavioral Interview**: Practice behavioral questions using STAR framework with voice/text input

### 💻 Coding Interview Features
- **Dynamic Question Generation**: AI generates coding questions based on difficulty, language, and topic preferences
- **Whiteboard Interface**: Clean, distraction-free coding environment
- **Real-time Timer**: Track your interview time with pause/resume functionality
- **AI Feedback System**: Comprehensive evaluation including:
  - **Correctness**: Solution accuracy assessment
  - **Efficiency**: Time and space complexity analysis
  - **Code Quality**: Code style and best practices
  - **Problem Solving**: Approach and methodology evaluation
  - **Communication**: Clarity of explanation
- **Progressive Hints**: Get helpful hints when stuck
- **Session Management**: Save and review interview sessions
- **Final Assessment**: Comprehensive end-of-interview report

### 🗣️ Behavioral Interview Features
- **STAR Framework Integration**: Structured questions following Situation, Task, Action, Result format
- **Voice & Text Input**: Support for both voice recording and text input
- **Real-time Speech Recognition**: Convert voice to text for analysis
- **45-Minute Session Timer**: Standard interview duration with automatic completion
- **Multi-Dimensional AI Feedback**:
  - **STAR Analysis**: Individual scoring for each framework component
  - **Communication**: Clarity and effectiveness assessment
  - **Specificity**: Use of concrete examples and details
  - **Problem Solving**: Demonstration of analytical thinking
  - **Leadership**: Teamwork and leadership abilities
  - **Self-Awareness**: Reflection and learning capability
- **Progressive Question Flow**: 5-7 questions covering different behavioral areas
- **Hiring Recommendation**: AI-generated hiring decision (strong_yes/yes/maybe/no)
- **Comprehensive Final Report**: Detailed assessment with actionable feedback

### 🎨 User Interface
- Modern, responsive design with dark theme
- Intuitive navigation and user experience
- Real-time feedback and scoring
- Progress tracking and performance analytics
- Voice recording controls with visual feedback

## Technology Stack

### Backend
- **Node.js** with Express.js
- **Firebase Firestore** for data persistence
- **Google Gemini AI** for question generation and feedback
- **CORS** enabled for frontend communication

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Web Speech API** for voice recognition
- **Custom UI Components** for consistent design

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-agent
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

5. **Firebase Setup**
   - Create a Firebase project
   - Download your service account key
   - Configure Firebase Admin SDK in the backend

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## API Endpoints

### Coding Interview
- `POST /api/questions/coding-interview/start` - Start a new coding interview
- `POST /api/questions/coding-interview/submit` - Submit a coding solution
- `POST /api/questions/coding-interview/feedback` - Get feedback for a solution
- `POST /api/questions/coding-interview/end` - End the interview session

### Behavioral Interview
- `POST /api/questions/behavioral-interview/start` - Start a new behavioral interview
- `POST /api/questions/behavioral-interview/submit` - Submit a behavioral response
- `POST /api/questions/behavioral-interview/feedback` - Get feedback for a response
- `POST /api/questions/behavioral-interview/end` - End the interview session

### Question Management
- `POST /api/questions/generate-coding` - Generate coding questions
- `POST /api/questions/save-coding` - Save coding questions
- `POST /api/questions/generate-system` - Generate system design questions
- `POST /api/questions/save-system-design` - Save system design questions

## Usage

### Starting a Coding Interview
1. Navigate to the Mock Interview page
2. Select "编程面试" (Coding Interview)
3. Choose difficulty, programming language, and topic
4. Click "开始面试" (Start Interview)

### Starting a Behavioral Interview
1. Navigate to the Mock Interview page
2. Select "行为面试" (Behavioral Interview)
3. Choose role, level, and company type
4. Review the STAR framework guidelines
5. Click "开始面试" (Start Interview)

### During the Behavioral Interview
1. Read each question carefully and review the STAR framework guidance
2. Use voice recording or text input to provide your response
3. Structure your answer using the STAR framework:
   - **Situation**: Describe the specific context
   - **Task**: Explain your responsibilities
   - **Action**: Detail your specific actions
   - **Result**: Share outcomes and learnings
4. Submit your response for AI feedback
5. Review feedback and continue to the next question

### Interview Completion
- The AI provides a comprehensive final assessment
- Review your strengths and areas for improvement
- Get personalized recommendations for next steps
- Receive a hiring recommendation based on your performance

## AI Feedback Criteria

### Coding Interview Evaluation
- **Correctness (25%)**: Solution accuracy and edge case handling
- **Efficiency (25%)**: Time and space complexity optimization
- **Code Quality (20%)**: Readability, maintainability, and best practices
- **Problem Solving (20%)**: Approach methodology and logical thinking
- **Communication (10%)**: Clarity of explanation and documentation

### Behavioral Interview Evaluation
- **STAR Framework (40%)**: Individual scoring for Situation, Task, Action, Result
- **Communication (20%)**: Clarity and effectiveness of communication
- **Specificity (15%)**: Use of concrete examples and details
- **Problem Solving (15%)**: Demonstration of analytical thinking
- **Leadership (10%)**: Teamwork and leadership abilities

## STAR Framework Guide

The STAR framework is a structured method for answering behavioral interview questions:

### S - Situation
- Describe the specific context or background
- Provide relevant details about the environment
- Set the scene for your story

### T - Task
- Explain your responsibility and what needed to be accomplished
- Describe the challenge or goal you faced
- Clarify your role in the situation

### A - Action
- Detail the specific actions you took
- Focus on what you did, not what the team did
- Explain your decision-making process

### R - Result
- Share the outcomes and impact of your actions
- Quantify results when possible
- Describe what you learned from the experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.