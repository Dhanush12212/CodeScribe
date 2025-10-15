# CodeScribe - A Live Collaborative AI Code Editor

CodeScribe is a real-time, collaborative code editor designed for seamless pair programming, coding interviews, and team collaboration. With features like live code sharing, AI assistance, and code execution, CodeScribe makes remote coding sessions effortless and intelligent.

---

## Features

- **Real-time Collaboration**: Instantly sync code across multiple users using Socket.IO.  
- **Rich Code Editing**: Powered by the Monaco Editor (used in VS Code).  
- **Room-Based Collaboration**: Create or join secure coding rooms for focused teamwork.  
- **User Authentication**: Secure login and registration with JWT and bcrypt.js.  
- **Code Execution**: Run code directly inside the editor and view real-time output.  
- **Ask AI**: Get instant explanations, code analysis, and debugging tips for your code.  
- **Related Programs**: AI suggests similar programs and examples in a separate section.  
- **Persistent Code Storage**: Save, load, and share code snippets.  
- **Scalable & Extensible**: Modular design ready for future features like voice or video integration.

---

## Tech Stack

### Frontend
- **React.js** – For building an interactive and modular user interface.  
- **Monaco Editor** – Full-featured browser-based code editor.  
- **Socket.IO Client** – Enables real-time communication with the backend.  
- **React Router** – Handles smooth client-side navigation.  
- **Axios** – REST API communication.  
- **Tailwind CSS + shadcn/ui** – Responsive and modern UI components.

### AI & Code Execution
- **OpenAI API** – Powers “Ask AI” and “Explain Code” features.  
- **Flask (Python)** – Handles AI-based code explanation and related program generation.  
- **Jugde0 Api** – Provides secure execution for running user code.

### Backend
- **Node.js** – JavaScript runtime for the backend.  
- **Express.js** – Web framework for API management.  
- **Socket.IO** – Real-time, bidirectional event-based communication.  
- **MongoDB (Mongoose)** – Stores users, sessions, and code snippets.  
- **JWT & bcrypt.js** – Authentication and password encryption.  
- **dotenv** – Environment variable management.  
- **Cors & Helmet** – Security and cross-origin protection.

---

## System Architecture Overview

# Instructions

### 1. Clone the Project

   - Clone the repository using the command:
     ```sh
     git clone https://github.com/Dhanush12212/CodeScribe.git
     ```

### 2. Install Dependencies

   -      npm install
     ```
   - Similarly, move to the frontend directory and install dependencies:
     ```sh
     cd frontend
     npm install
     ```

### 3. Environment Variables

   - Create a `.env` file in the **backend** directory and add:
     ```sh
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     ```

### 4. Start Backend Server

   - Start the backend server using the command:
     ```sh
     cd backend
     npm start
     ```

### 5. Start Frontend

   - Start the frontend application with:
     ```sh
     cd frontend
     npm run dev
     ```

### 6. Access the Application

   - Open `http://localhost:5173` in your browser to start using CodeScribe.
