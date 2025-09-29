# WeaveSpace AI 🎨

A real-time collaborative workspace and whiteboard application with advanced features for seamless team collaboration.

## ✨ Features

- **Real-time Collaboration** - Work together with your team in real-time
- **Interactive Whiteboard** - Draw, sketch, and brainstorm visually
- **Live Cursor Tracking** - See where your teammates are working
- **Voice Chat** - Communicate with your team using integrated voice chat
- **Text Chat** - Send messages and share ideas instantly
- **Custom Icons** - Select from a variety of icons to enhance your workspace
- **Persistent Sessions** - Your work is automatically saved

## 🚀 Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Real-time Communication**: Socket.io
- **Voice Chat**: WebRTC
- **UI Components**: Modern React components

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Git

## 🛠️ Installation & Setup

### Clone the Repository

```bash
git clone https://github.com/Hacker-Ring/AlgoRangers-weavespace-ai.git
cd AlgoRangers-weavespace-ai
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:5173` (or the port specified in your configuration).

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

The backend server should now be running on `http://localhost:3000` (or your configured port).

## 🎯 Usage

1. Open your browser and navigate to the frontend URL
2. Create or join a workspace
3. Start collaborating with your team in real-time!

### Key Features to Try:

- **Drawing**: Use the whiteboard tools to draw and sketch
- **Cursor Tracking**: Watch as your teammates' cursors move in real-time
- **Voice Chat**: Enable your microphone to talk with team members
- **Text Chat**: Use the chat panel to send messages
- **Icons**: Add visual elements using the icon selector

## 🔧 Configuration

### Environment Variables

Create a `.env` file in both frontend and backend directories with the following variables:

**Frontend (.env)**
```env
VITE_BACKEND_URL=http://localhost:3000
```

**Backend (.env)**
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 📁 Project Structure

```
AlgoRangers-weavespace-ai/
├── frontend/              # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/               # Node.js backend server
│   ├── src/
│   ├── package.json
│   └── ...
├── Model/                 # ML models and related code
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Team

Built with ❤️ by the AlgoRangers team

## 🐛 Known Issues

- Check the [Issues](https://github.com/Hacker-Ring/AlgoRangers-weavespace-ai/issues) page for current bugs and feature requests

## 📞 Support

If you encounter any issues or have questions, please:
- Open an issue on GitHub
- Contact the team through the repository

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this project
- Special thanks to the open-source community for the amazing tools and libraries

---

**Happy Collaborating! 🚀**
