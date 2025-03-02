# Adaptive Learning Platform

## Overview
An intelligent learning platform that combines personalized course progression with emotional state monitoring to enhance the learning experience. The platform uses facial emotion detection to identify when learners need breaks and automatically suggests interactive games to maintain optimal engagement.

## Key Features

### Adaptive Learning
- Personalized learning paths based on introductory quiz performance
- Sequential lesson progression with prerequisite validation
- Dynamic quiz difficulty adjustment
- Automated lesson completion tracking

### Emotional Intelligence
- Real-time emotion detection using DeepFace
- Automatic break suggestions when negative emotions are detected
- Interactive game breaks to reduce stress and maintain engagement
- Continuous monitoring with adjustable intervals

### Course Management
- YouTube video integration for lesson content
- Interactive quizzes for each lesson
- Final course assessment
- Progress tracking and visualization

### Technical Features
- Real-time webcam integration
- Emotion analysis using computer vision
- Progress persistence
- Responsive Material-UI design

## Technology Stack

### Frontend
- React.js
- Material-UI
- Axios for API communication
- react-webcam for camera integration
- YouTube API integration

### Backend
- Spring Boot (Java)
- Python Flask for emotion analysis
- DeepFace for facial emotion detection
- OpenCV for image processing
- MySQL/PostgreSQL database

## Installation

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- Java 11+
- MySQL/PostgreSQL

### Frontend Setup
```bash
cd React-frontend
npm install
npm start
```

### Python Backend Setup
```bash
cd Python-backend
pip install -r requirements.txt
python app.py
```

### Spring Backend Setup
```bash
cd Springboot-backend
./mvnw spring-boot:run
```

## Architecture
```
├── React-frontend/       # React application
├── Python-backend/       # Emotion analysis service
└── Springboot-backend/   # Main backend service
```

## Features in Detail

### Learning Flow
1. User takes introductory quiz
2. System analyzes knowledge areas
3. Customized lesson path is generated
4. Progress is tracked through lessons
5. Emotional state is monitored
6. Interactive breaks are suggested when needed
7. Final assessment determines course completion

### Emotion Detection
- Monitors student's emotional state every 5 minutes
- Detects emotions: angry, sad, happy, surprise, disgust
- Triggers break suggestions for negative emotions
- Provides interactive games during breaks

### Progress Tracking
- Visual progress indicators
- Completed lesson highlighting
- Prerequisites validation
- Final quiz unlocking based on progress

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

