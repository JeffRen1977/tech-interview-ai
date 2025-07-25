# AI Interview Agent

An intelligent interview preparation platform that provides comprehensive AI-powered tools for coding practice, mock interviews, resume optimization, and personalized coaching.

## 🌟 Core Features

### 🎯 **Mock Interview Module**
- **Coding Interview**: Simulate whiteboard coding questions with AI feedback
- **System Design Interview**: Practice system architecture questions with whiteboard interface
- **Behavioral Interview**: Practice behavioral questions using STAR framework with voice/text input

### 💻 **Coding Practice Module**
- **Programming Question Bank**: Extensive collection of coding problems with difficulty levels
- **Dropdown Question Selection**: Easy navigation through available problems
- **Multi-Language Support**: Python, C++, Java, JavaScript
- **Real-time Code Execution**: Test your solutions with instant feedback
- **AI Code Analysis**: Comprehensive code review with complexity analysis
- **Learning History**: Track your progress and save completed problems
- **Filter System**: Filter by difficulty, algorithms, data structures, and companies

### 📝 **Resume Optimization Suite**
- **Resume Analyzer**: AI-powered analysis of your resume content
- **JD Matching Assessment**: Compare your resume against job descriptions
- **Cover Letter Generator**: Create personalized cover letters
- **Optimization Suggestions**: Get specific recommendations for improvement
- **Skills Highlighting**: Identify and emphasize relevant skills
- **Formatting Suggestions**: Improve resume structure and presentation

### 🧠 **AI Personalized Coach**
- **Personalized Configuration**: Set target companies, tech stacks, and preferences
- **Daily Learning Plans**: AI-generated personalized study plans
- **Goal-Oriented Conversations**: Interactive coaching sessions
- **Progress Tracking**: Monitor your learning journey
- **Adaptive Recommendations**: Dynamic suggestions based on your progress

### 📊 **Learning & Feedback System**
- **Wrong Questions Tracking**: Review and learn from mistakes
- **Ability Mapping**: Visual representation of your strengths and weaknesses
- **Video Interview Feedback**: Analyze video recordings for improvement
- **AI Explanations**: Detailed explanations for incorrect answers
- **Redo Plans**: Personalized improvement strategies

### 📈 **User History & Analytics**
- **Interview History**: Complete record of all practice sessions
- **Performance Analytics**: Track scores, trends, and improvements
- **Category Analysis**: Identify best performing areas
- **Progress Visualization**: Charts and metrics for performance tracking
- **Export Capabilities**: Download reports and assessments

### 🛠️ **Admin Management System**
- **Question Generation**: AI-powered creation of coding and system design questions
- **Question Management**: Add, edit, and organize question bank
- **System Design Questions**: Generate detailed system architecture problems
- **Behavioral Questions**: Create role-specific behavioral scenarios
- **Database Management**: Comprehensive question storage and retrieval

### 🌍 **Multi-Language Support**
- **Bilingual Interface**: Full Chinese and English support
- **Dynamic Language Switching**: Seamless language transitions
- **Localized Content**: All UI elements, messages, and feedback in both languages
- **Cultural Adaptation**: Language-specific interview practices and terminology

## 🎨 User Interface Features

### **Modern Design**
- **Dark Theme**: Eye-friendly dark interface optimized for long coding sessions
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Resizable Panels**: Customizable workspace layout
- **Intuitive Navigation**: Clean sidebar with organized feature categories

### **Interactive Elements**
- **Real-time Feedback**: Instant AI responses and scoring
- **Progress Indicators**: Visual progress tracking throughout sessions
- **Voice Recording**: Built-in speech recognition for behavioral interviews
- **Code Editor**: Monaco Editor with syntax highlighting and autocomplete

## 📚 Documentation

All project documentation has been organized in the `doc/` directory for easy navigation:

### **Documentation Structure**
- **📖 [Documentation Index](doc/README.md)** - Complete guide to all documentation
- **🔧 [Deployment Guides](doc/deployment/)** - Main deployment and release documentation
- **🚂 [Railway Deployment](doc/railway/)** - Railway-specific deployment guides
- **⚡ [Vercel Deployment](doc/vercel/)** - Vercel deployment documentation
- **🔥 [Firebase Setup](doc/firebase/)** - Firebase configuration guides
- **📜 [Scripts](doc/scripts/)** - All deployment and setup scripts
- **🎯 [System Design](doc/)** - System design interview materials
- **🔐 [Authentication](doc/)** - Authentication setup guides

### **Quick Start**
1. For deployment: Check `doc/deployment/DEPLOYMENT.md`
2. For Railway: See `doc/railway/RAILWAY_DEPLOYMENT.md`
3. For Vercel: See `doc/vercel/VERCEL_FRONTEND_DEPLOYMENT.md`
4. For Firebase: See `doc/firebase/FIREBASE_DEPLOYMENT_SETUP.md`

## 🛠️ Technology Stack

### **Backend**
- **Node.js** with Express.js
- **Firebase Firestore** for data persistence
- **Google Gemini AI** for question generation and feedback
- **CORS** enabled for frontend communication
- **RESTful API** design with comprehensive endpoints

### **Frontend**
- **React 18** with Vite for fast development
- **Tailwind CSS** for responsive styling
- **Lucide React** for consistent iconography
- **Web Speech API** for voice recognition
- **Monaco Editor** for code editing
- **Custom UI Components** for consistent design
- **Context API** for state management

### **AI & ML**
- **Google Gemini Pro** for natural language processing
- **Custom Prompt Engineering** for specialized interview scenarios
- **Multi-modal AI** for text, code, and voice analysis
- **Adaptive Learning** algorithms for personalized recommendations

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key
- Firebase project setup

### **Installation**

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
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   ```

5. **Firebase Setup**
   - Create a Firebase project
   - Download your service account key
   - Configure Firebase Admin SDK in the backend
   - Set up Firestore database

### **Running the Application**

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
   - Frontend: http://localhost:5173 (or available port)
   - Backend API: http://localhost:3000

## 📡 API Endpoints

### **Coding Practice**
- `GET /api/code/questions/filtered` - Get filtered coding questions
- `POST /api/code/execute` - Execute code with test cases
- `POST /api/code/submit` - Submit code for AI analysis
- `POST /api/code/learning-history` - Save to learning history
- `GET /api/code/learning-history/:userId` - Get user's learning history

### **Mock Interviews**
- `POST /api/questions/coding-interview/start` - Start coding interview
- `POST /api/questions/coding-interview/submit` - Submit coding solution
- `POST /api/questions/coding-interview/end` - End coding interview
- `POST /api/questions/behavioral-interview/start` - Start behavioral interview
- `POST /api/questions/behavioral-interview/submit` - Submit behavioral response
- `POST /api/questions/behavioral-interview/end` - End behavioral interview
- `POST /api/questions/system-design-interview/start` - Start system design interview

### **Resume Optimization**
- `POST /api/resume/analyze` - Analyze resume content
- `POST /api/resume/jd-matching` - Assess JD matching
- `POST /api/resume/cover-letter` - Generate cover letter

### **AI Coaching**
- `POST /api/coach-agent/profile` - Save user profile
- `GET /api/coach-agent/profile` - Get user profile
- `GET /api/coach-agent/daily-plan` - Get daily learning plan
- `POST /api/coach-agent/goal-chat` - Goal-oriented conversation

### **Question Management**
- `POST /api/questions/generate-coding` - Generate coding questions
- `POST /api/questions/save-coding` - Save coding questions
- `POST /api/questions/generate-system` - Generate system design questions
- `POST /api/questions/save-system-design` - Save system design questions
- `POST /api/questions/save-behavioral` - Save behavioral questions

### **User History**
- `GET /api/questions/user-history` - Get user interview history
- `GET /api/wrong-questions` - Get wrong questions
- `POST /api/wrong-questions/:id/ai-feedback` - Get AI feedback for wrong questions

## 🎯 Usage Guide

### **Starting Coding Practice**
1. Navigate to "编程练习" (Coding Practice)
2. Use the dropdown to select a programming question
3. Choose your preferred programming language
4. Write your solution in the code editor
5. Execute to test your code
6. Submit for comprehensive AI analysis
7. Review feedback and save to learning history

### **Starting a Mock Interview**
1. Navigate to "模拟面试" (Mock Interview)
2. Select interview type (Coding/System Design/Behavioral)
3. Configure interview settings (difficulty, language, role)
4. Begin the interview session
5. Complete questions within time limits
6. Receive comprehensive AI feedback
7. Review final assessment and recommendations

### **Using Resume Optimization**
1. Navigate to "简历优化" (Resume Optimizer)
2. Choose optimization type (Analyzer/JD Matching/Cover Letter)
3. Upload or paste your resume content
4. Add job description for matching
5. Generate AI-powered analysis
6. Review optimization suggestions
7. Download or copy improved content

### **AI Coaching Sessions**
1. Navigate to "AI个性化教练" (AI Personal Coach)
2. Configure your profile and preferences
3. Set learning goals and target companies
4. Generate personalized daily plans
5. Engage in goal-oriented conversations
6. Track progress and receive recommendations

## 🤖 AI Evaluation Criteria

### **Coding Interview Assessment**
- **Correctness (25%)**: Solution accuracy and edge case handling
- **Efficiency (25%)**: Time and space complexity optimization
- **Code Quality (20%)**: Readability, maintainability, and best practices
- **Problem Solving (20%)**: Approach methodology and logical thinking
- **Communication (10%)**: Clarity of explanation and documentation

### **Behavioral Interview Assessment**
- **STAR Framework (40%)**: Individual scoring for Situation, Task, Action, Result
- **Communication (20%)**: Clarity and effectiveness of communication
- **Specificity (15%)**: Use of concrete examples and details
- **Problem Solving (15%)**: Demonstration of analytical thinking
- **Leadership (10%)**: Teamwork and leadership abilities

### **System Design Assessment**
- **Architecture (30%)**: System design and scalability
- **Technical Depth (25%)**: Understanding of technical concepts
- **Trade-offs (20%)**: Analysis of design decisions
- **Communication (15%)**: Clarity of technical explanation
- **Problem Solving (10%)**: Approach to complex system problems

## 🌍 Multi-Language Support

The application supports both Chinese and English languages:

### **Supported Languages**
- **Chinese (中文)**: Full interface and content localization
- **English**: Complete English language support

### **Localized Features**
- **UI Elements**: All buttons, labels, and navigation
- **Content**: Interview questions, feedback, and explanations
- **Error Messages**: User-friendly localized error handling
- **Date Formatting**: Language-appropriate date displays
- **Cultural Adaptation**: Interview practices specific to each language

## 📊 Performance Analytics

### **Tracking Metrics**
- **Interview Performance**: Scores, completion times, and success rates
- **Learning Progress**: Question completion, improvement trends
- **Skill Development**: Category-wise performance analysis
- **Practice Consistency**: Daily/weekly activity tracking

### **Visualization**
- **Progress Charts**: Performance trends over time
- **Category Analysis**: Strengths and improvement areas
- **Comparison Metrics**: Performance against benchmarks
- **Goal Tracking**: Progress towards learning objectives

## 🔧 Configuration & Customization

### **User Preferences**
- **Language Selection**: Switch between Chinese and English
- **Theme Preferences**: Dark theme optimization
- **Notification Settings**: Customizable alerts and reminders
- **Privacy Controls**: Data sharing and storage preferences

### **Admin Features**
- **Question Management**: Add, edit, and organize question bank
- **User Management**: Monitor user activity and performance
- **System Settings**: Configure AI parameters and thresholds
- **Analytics Dashboard**: Comprehensive system usage metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure multi-language support for new features
- Test on different screen sizes and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Issues**: Open an issue in the repository
- **Documentation**: Check the inline code comments and API documentation
- **Community**: Join our developer community for discussions

## 🚀 Roadmap

### **Upcoming Features**
- **Advanced Analytics**: Machine learning-based performance predictions
- **Collaborative Features**: Peer review and group practice sessions
- **Mobile App**: Native iOS and Android applications
- **Enterprise Features**: Team management and corporate training tools
- **Advanced AI**: More sophisticated interview simulation and feedback

### **Technical Improvements**
- **Performance Optimization**: Enhanced loading times and responsiveness
- **Scalability**: Support for larger user bases and concurrent sessions
- **Security**: Enhanced data protection and privacy features
- **Integration**: Third-party platform integrations (LinkedIn, GitHub, etc.)