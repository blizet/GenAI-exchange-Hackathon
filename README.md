# 🚀 InvestAI - AI-Powered Startup Investment Platform

An AI-powered platform connecting startups and investors with comprehensive analysis, meeting scheduling, and intelligent matching.

## 🎥 Live Demo & Video

*   **Live Frontend:** [https://investai-genai.web.app/](https://investai-genai.web.app/)
*   **Live Backend:** [https://genai-hackathon-341748952555.asia-south1.run.app/](https://genai-hackathon-341748952555.asia-south1.run.app/)
*   **Demo Video:** [Link to YouTube Demo](https://youtu.be/VMNkV2dWnEE)

## ✨ Key Features

### 🤖 **9 Specialized AI Agents**

*   **Fact Check Analysis:** Verifies claims made in startup documents using web search.
*   **Business Model Analysis:** Analyzes revenue streams, pricing, and overall business model viability.
*   **Market Size Analysis:** Assesses the total addressable market and market opportunity.
*   **Product Information Analysis:** Provides insights into the product, its features, and differentiation.
*   **Competition Analysis:** Discovers competitors and analyzes the competitive landscape.
*   **Founders Research:** Conducts a thorough analysis of the founding team's background and experience.
*   **Risk Assessment:** Evaluates potential risks associated with the investment.
*   **Investment Recommendation:** Provides an AI-powered investment recommendation based on all analyses.
*   **Document Analysis:** Ingests and processes pitch decks and other documents for analysis.

### 📅 **Meeting Scheduler**

*   **Seamless Scheduling:** A simple 3-step process to schedule meetings between investors and startups.
*   **Smart Notifications:** Real-time notifications for meeting requests, confirmations, and cancellations.
*   **Centralized Dashboard:** Manage all your meetings in one place.

### 🏢 **Dual User Experience**

*   **Startup Dashboard:** Upload documents, trigger AI analysis, and manage meeting requests.
*   **Investor Dashboard:** Discover new startups, view detailed AI-powered analysis, and schedule meetings.
*   **RAG Chatbot:** An interactive chatbot to get instant answers to your questions about startups.

## 🏗️ Architecture

InvestAI is built with a modern architecture using FastAPI for the backend and React for the frontend.

*   **Backend (FastAPI):** A high-performance Python web framework that serves the API endpoints for the AI agents, meeting scheduler, and user management.
*   **Frontend (React):** A powerful JavaScript library for building the user interface, providing a seamless and interactive experience for both startups and investors.

The 9 AI agents are built using advanced AI models and are orchestrated by the FastAPI backend to provide a comprehensive analysis of each startup.

## 📂 Project Structure

```
├── 📁 backend/          # FastAPI Backend
│   ├── agents/         # AI Agent Definitions
│   ├── api/            # API Routers and Endpoints
│   ├── prompts/        # Prompts for AI Agents
│   ├── utils/          # Utility Functions
│   ├── config.py       # Application Configuration
│   ├── main.py         # FastAPI Application Entrypoint
│   └── requirements.txt # Python Dependencies
├── 📁 frontend/         # React Frontend
│   ├── public/         # Public Assets
│   ├── src/            # Source Code
│   │   ├── components/ # React Components
│   │   ├── contexts/   # React Contexts
│   │   ├── hooks/      # Custom React Hooks
│   │   ├── services/   # API and Firebase Services
│   │   └── App.js      # Main Application Component
│   ├── package.json    # Node.js Dependencies
│   └── tailwind.config.js # Tailwind CSS Configuration
├── .gitignore          # Git Ignore File
├── docker-compose.yml  # Docker Compose Configuration
├── firebase.json       # Firebase Configuration
└── README.md           # Project README
```

## 🚀 Getting Started

### Prerequisites

*   Python 3.8+
*   Node.js 16+
*   A Google AI API Key
*   A Firebase Project

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Genai_exchange_hackathon
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create a .env file and add your API keys
cp .env.example .env

# Start the server
python main.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 🔧 API Endpoints

### Analysis

*   `POST /api/analysis/fact-check`
*   `POST /api/analysis/business-model`
*   `POST /api/analysis/investment-recommendation`

### Meetings

*   `POST /api/meetings/request`
*   `GET /api/meetings/user/{user_id}`
*   `PUT /api/meetings/{meeting_id}`

### Chatbot

*   `POST /api/chatbot/chat`
*   `GET /api/chatbot/suggested-questions`

## 🚀 Deployment

### Backend

The backend is a standard FastAPI application and can be deployed to any platform that supports Python, such as Google Cloud Run, AWS Elastic Beanstalk, or Heroku.

### Frontend

The frontend is a standard React application and can be deployed to any static hosting provider, such as Firebase Hosting, Netlify, or Vercel.

To deploy to Firebase:

```bash
cd frontend
npm run deploy
```

## ✨ Technical Highlights

*   **Optimized Frontend Performance:** Implemented lazy loading for components, memoization, and efficient state management to ensure a fast and responsive user experience.
*   **Scalable Backend:** The FastAPI backend is built to be scalable and can handle a high volume of requests.
*   **Modular AI Agents:** The AI agents are designed to be modular and can be easily extended or replaced.
*   **Real-time Notifications:** Firebase is used for real-time notifications to keep users updated on meeting requests and analysis status.
*   **Secure Authentication:** Firebase Authentication is used to securely manage user accounts.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch.
3.  Make your changes.
4.  Submit a pull request.

---

**Built with ❤️ for the GenAI Exchange Hackathon**
