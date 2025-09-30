# NexaTalk - Modern Chat Experience

A full-featured real-time chat application with cutting-edge design and smooth animations, built with modern web technologies.

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
- Telegram-inspired design
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
- **CSS3** - Modern styling with CSS variables, animations, and glassmorphism effects
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

1. **Clone the repository** (or extract the files)
   ```bash
   cd telegram-chat
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
   MONGODB_URI=mongodb://localhost:27017/nexatalk
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
nexatalk/
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

## Design Features

### 🎨 Modern UI/UX
- **Glassmorphism Effects** - Translucent surfaces with backdrop blur
- **Smooth Animations** - 60fps animations with cubic-bezier easing
- **Gradient Backgrounds** - Beautiful color gradients throughout
- **Micro-interactions** - Hover effects and state transitions
- **Modern Typography** - Inter font for clean, readable text
- **Responsive Design** - Optimized for all screen sizes

### ✨ Animation System
- **Loading Animations** - Floating logo and grid background
- **Message Animations** - Slide-in effects for new messages
- **Button Interactions** - Scale, rotate, and glow effects
- **Typing Indicators** - Animated dots with staggered timing
- **Modal Transitions** - Smooth scale and slide animations
- **Status Indicators** - Pulsing online/offline states
```

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
MONGODB_URI=mongodb://localhost:27017/telegram-chat
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

### Debug Mode
In development (localhost), you can enable debug mode:
```javascript
// In browser console
telegramApp.enableDebug()
```

This provides additional debugging functions:
- `appDebug.info()` - Get app information
- `appDebug.restart()` - Restart the application
- `appDebug.clearStorage()` - Clear all storage and reload
- `appDebug.testNotification(type)` - Test notifications
- `appDebug.checkSocket()` - Check socket connection status

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

### Getting Help

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend server logs
3. Enable debug mode for additional information
4. Ensure all dependencies are properly installed

## Future Enhancements

- Voice messages
- Video calls
- Message forwarding
- Chat export/backup
- Admin panel
- Push notifications (PWA)
- Message search
- Custom themes
- Stickers and GIFs
- Message threading

---

**Enjoy your new NexaTalk experience! 🚀**

## Visual Enhancements

- **Modern Color Palette** - Indigo, purple, and cyan gradients
- **Enhanced Shadows** - Layered shadows for depth
- **Smooth Transitions** - All interactions are animated
- **Glass Effects** - Frosted glass appearance on modals
- **Floating Elements** - Subtle hover animations
- **Gradient Borders** - Colorful accents throughout the UI#   c h a t c h a t  
 