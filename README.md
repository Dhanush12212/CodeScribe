# CodeMesh - A Live Collaborative Code Editor

CodeMesh is a real-time, collaborative code editor designed for seamless pair programming, coding interviews, and team collaboration. With features like live code sharing and Code execution. CodeMesh makes remote coding sessions effortless.

## Features

- **Real-time Collaboration**: Instantly sync code across multiple users. 
- **Rich Code Editing**: Powered by Monaco Editor.
- **Room-Based Collaboration**: Join or create coding rooms for focused teamwork. 
- **User Authentication**: Secure login and registration using JWT. 

# Tech Stack

## Frontend
- **React.js**: For building the user interface.
- **Monaco Editor**: A powerful code editor with syntax highlighting.
- **Socket.io Client**: Enables real-time communication with the backend. 
- **React Router**: For smooth navigation.
- **Axios**: Efficient API requests.

## Backend
- **Node.js**: JavaScript runtime for server-side scripting.
- **Express.js**: Web framework for handling API requests.
- **Socket.io**: Real-time communication between users.
- **MongoDB**: NoSQL database for storing user sessions and code snippets.
- **JWT & bcrypt.js**: Authentication & security.
- **dotenv**: Manage environment variables.

# Instructions

## 1. Clone the Project

   - Clone the repository using the command:
     ```sh
     git clone https://github.com/Dhanush12212/CodeMesh.git
     ```

## 2. Install Dependencies

   - Navigate to the backend directory and install dependencies:
     ```sh
     cd backend
     npm install
     ```
   - Similarly, move to the frontend directory and install dependencies:
     ```sh
     cd frontend
     npm install
     ```

## 3. Environment Variables

   - Create a `.env` file in the **backend** directory and add:
     ```sh
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     ```

## 4. Start Backend Server

   - Start the backend server using the command:
     ```sh
     cd backend
     npm start
     ```

## 5. Start Frontend

   - Start the frontend application with:
     ```sh
     cd frontend
     npm run dev
     ```

## 6. Access the Application

   - Open `http://localhost:5173` in your browser to start using CodeMesh.

# Contributing

We welcome contributions! Feel free to fork the repository, create a feature branch, and submit a pull request. 

