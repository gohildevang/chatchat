# ChatChat - Simple & Beautiful

A full-featured real-time chat application with clean design and smooth animations, built with modern web technologies.

## Features

### 🔐 Authentication System
- User registration with username, email, and password
- Secure login/logout with JWT-based sessions
- User profile management with editable avatar, bio, and status

### 💬 Real-time Messaging
- One-to-one direct messaging
- Group chats with multiple participants
- Real-time message delivery using Socket.IO
- Typing indicators and online/offline status
- Message read receipts and delivery status

### 📁 File Sharing
- Image upload and preview
- Document sharing with file information display
- Drag-and-drop file upload
- File size limits and type validation

### 🎨 Modern UI/UX
- Clean and simple design
- Dark and light mode support
- Responsive layout for desktop and mobile
- Smooth animations and transitions
- Emoji picker with multiple categories
- Message reactions (right-click or double-click)

### 🔧 Additional Features
- User search functionality
- Avatar upload and management
- Browser notifications for new messages
- Keyboard shortcuts for common actions
- Connection status monitoring
- Error handling and recovery

## Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, animations
- **Vanilla JavaScript** - No frameworks, pure ES6+ JavaScript
- **Socket.IO Client** - Real-time communication
- **Inter Font** - Modern typography

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## Prerequisites

Before running the application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (v4.4 or higher)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/gohildevang/chatchat.git
   cd chatchat
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   
   The `.env` file is already created with default values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatchat
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   NODE_ENV=development
   ```

   **Important:** Change the `JWT_SECRET` to a secure random string in production!

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows (if installed as service)
   net start MongoDB
   
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   ```

5. **Start the backend server**
   ```bash
   # From the backend directory
   npm run dev
   ```
   
   The server will start on `http://localhost:5000`

6. **Open the application**
   
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

```
chatchat/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema and methods
│   │   ├── Chat.js              # Chat schema for rooms
│   │   └── Message.js           # Message schema with reactions
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── users.js             # User management endpoints
│   │   ├── chats.js             # Chat management endpoints
│   │   └── messages.js          # Message endpoints
│   ├── uploads/                 # File uploads directory
│   ├── .env                     # Environment variables
│   ├── package.json             # Backend dependencies
│   └── server.js                # Main server file
├── frontend/
│   ├── js/
│   │   ├── app.js               # Main application initialization
│   │   ├── auth.js              # Authentication handling
│   │   ├── chat.js              # Chat functionality and Socket.IO
│   │   ├── ui.js                # UI interactions and helpers
│   │   ├── emoji.js             # Emoji picker and reactions
│   │   └── notifications.js     # Notification system
│   ├── styles.css               # Main stylesheet
│   └── index.html               # Main HTML file
├── uploads/                     # Uploaded files storage
└── README.md                    # This file
```

## Design Features

### 🎨 Modern UI/UX
- **Clean Design** - Simple and intuitive interface
- **Smooth Animations** - Subtle transitions and effects
- **Professional Colors** - Blue, green, and teal color scheme
- **Responsive Design** - Works on all screen sizes
- **Modern Typography** - Inter font for clean, readable text

### ✨ Animation System
- **Loading Animations** - Floating logo effects
- **Message Animations** - Slide-in effects for new messages
- **Button Interactions** - Hover and click effects
- **Typing Indicators** - Animated dots
- **Modal Transitions** - Smooth open/close animations

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload user avatar
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id` - Get user by ID

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details
- `PUT /api/chats/:id` - Update chat info
- `POST /api/chats/:id/participants` - Add participant
- `DELETE /api/chats/:id/participants/:userId` - Remove participant

### Messages
- `GET /api/messages/:chatId` - Get chat messages
- `POST /api/messages` - Send text message
- `POST /api/messages/upload` - Send file/image message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reactions` - Add message reaction
- `DELETE /api/messages/:id/reactions` - Remove message reaction

## Socket.IO Events

### Client to Server
- `join` - Join user to their personal room
- `join-chat` - Join specific chat room
- `send-message` - Send message to chat
- `typing` - Send typing indicator

### Server to Client
- `receive-message` - Receive new message
- `user-typing` - User typing indicator
- `user-online` - User came online
- `user-offline` - User went offline

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open new chat modal
- `Ctrl/Cmd + ,` - Open settings
- `Ctrl/Cmd + D` - Toggle dark/light mode
- `Ctrl/Cmd + L` - Focus search input
- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Escape` - Close modals and menus

## Usage Guide

### Getting Started
1. **Register** a new account with username, email, and password
2. **Login** with your credentials
3. **Search for users** using the search bar or new chat modal
4. **Start chatting** by creating a direct message or group chat

### Sending Messages
- Type your message in the input box at the bottom
- Press `Enter` to send, or `Shift + Enter` for a new line
- Use the emoji button to add emojis
- Use the attachment button to send files or images

### Message Reactions
- **Right-click** on any message to see quick reaction options
- **Double-click** on a message to add a heart reaction
- Click on existing reactions to toggle them

### Profile Management
- Click the settings icon to edit your profile
- Upload an avatar by clicking the camera icon
- Update your username and bio

### Dark/Light Mode
- Click the moon/sun icon in the header to toggle themes
- Your preference is saved automatically

## Development

### Running in Development Mode
```bash
# Backend (with auto-restart)
cd backend
npm run dev

# The frontend is served by the backend server
```

### Environment Variables
Create a `.env` file in the backend directory with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatchat
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

## Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - File type and size validation
- **XSS Prevention** - HTML escaping for user content
- **CORS Configuration** - Controlled cross-origin requests

## Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`

2. **Socket.IO Connection Failed**
   - Check if the backend server is running
   - Verify no firewall is blocking the connection

3. **File Upload Not Working**
   - Check if the uploads directory exists
   - Verify file size limits (5MB for avatars, 10MB for files)

4. **Notifications Not Working**
   - Allow notifications in your browser
   - Check browser notification settings

---

**Enjoy your ChatChat experience! 🚀**