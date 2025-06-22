# AI Interview Agent

An intelligent interview preparation platform that provides AI-powered mock interviews for coding, system design, and behavioral questions.

## Features

### 🎯 Mock Interview Module
- **Coding Interview**: Simulate whiteboard coding questions with AI feedback
- **System Design Interview**: Practice system architecture questions (coming soon)
- **Behavioral Interview**: Practice behavioral questions (coming soon)

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

### 🎨 User Interface
- Modern, responsive design with dark theme
- Intuitive navigation and user experience
- Real-time feedback and scoring
- Progress tracking and performance analytics

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

### During the Interview
1. Read the problem description carefully
2. Use the hints if needed
3. Write your solution in the code editor
4. Explain your approach in the text area
5. Submit your solution for AI feedback
6. Review feedback and improve your solution

### Interview Completion
- The AI provides a comprehensive final assessment
- Review your strengths and areas for improvement
- Get personalized recommendations for next steps

## AI Feedback Criteria

The AI evaluates your performance across multiple dimensions:

- **Correctness (25%)**: Solution accuracy and edge case handling
- **Efficiency (25%)**: Time and space complexity optimization
- **Code Quality (20%)**: Readability, maintainability, and best practices
- **Problem Solving (20%)**: Approach methodology and logical thinking
- **Communication (10%)**: Clarity of explanation and documentation

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