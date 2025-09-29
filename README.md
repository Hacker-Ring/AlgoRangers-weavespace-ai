# WeaveSpace AI 🎨

A real-time collaborative workspace and whiteboard application with advanced features for seamless team collaboration and AI-powered assistance.

## ✨ Features

* **Real-time Collaboration** - Work together with your team in real-time
* **Interactive Whiteboard** - Draw, sketch, and brainstorm visually
* **Live Cursor Tracking** - See where your teammates are working
* **Voice Chat** - Communicate with your team using integrated voice chat
* **Text Chat** - Send messages and share ideas instantly
* **Custom Icons** - Select from a variety of icons to enhance your workspace
* **AI Assistant** - Get intelligent suggestions and assistance powered by ML models
* **Persistent Sessions** - Your work is automatically saved

## 🚀 Tech Stack

* **Frontend**: React + TypeScript
* **Backend**: Node.js + Express
* **Real-time Communication**: Socket.io
* **Voice Chat**: WebRTC
* **AI/ML**: Python (Flask/FastAPI)
* **UI Components**: Modern React components

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

* Node.js (v14 or higher)
* npm or yarn
* Python (v3.8 or higher)
* pip
* Git

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

3. Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_AI_MODEL_URL=http://localhost:5000
```

4. Start the development server:

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

3. Create a `.env` file in the backend directory:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
AI_MODEL_URL=http://localhost:5000
```

4. Start the backend server:

```bash
npm run dev
```

The backend server should now be running on `http://localhost:3000` (or your configured port).

### AI Model Setup

1. Navigate to the Model directory:

```bash
cd Model
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Run the AI model server:

```bash
python app.py
```

4. **Important**: Once the server starts, you'll see a URL displayed in the terminal (typically `http://localhost:5000` or `http://127.0.0.1:5000`). 

5. Copy this URL and paste it in the appropriate fetch location in your `app.py` or frontend configuration file where API calls are made to the AI model.

The AI model server should now be running on `http://localhost:5000` (or your configured port).

## 🎯 Usage

1. **Start all three services** (Frontend, Backend, and AI Model server)
2. Open your browser and navigate to `http://localhost:5173`
3. Create or join a workspace
4. Start collaborating with your team in real-time!

### Key Features to Try:

* **Drawing**: Use the whiteboard tools to draw and sketch
* **Cursor Tracking**: Watch as your teammates' cursors move in real-time
* **Voice Chat**: Enable your microphone to talk with team members
* **Text Chat**: Use the chat panel to send messages
* **Icons**: Add visual elements using the icon selector
* **AI Assistant**: Ask questions or get suggestions from the integrated AI model

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_AI_MODEL_URL=http://localhost:5000
```

**Backend (.env)**

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
AI_MODEL_URL=http://localhost:5000
```

**Model Configuration**

Ensure your `app.py` includes the correct host and port configuration:

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## 📁 Project Structure

```
AlgoRangers-weavespace-ai/
├── frontend/              # React frontend application
│   ├── src/
│   ├── public/
│   ├── .env              # Frontend environment variables
│   ├── package.json
│   └── ...
├── backend/               # Node.js backend server
│   ├── src/
│   ├── .env              # Backend environment variables
│   ├── package.json
│   └── ...
├── Model/                 # Python ML models and AI server
│   ├── app.py            # Main AI server file
│   ├── requirements.txt  # Python dependencies
│   └── ...
├── package.json
└── README.md
```

## 🚦 Running in Production

For production deployment:

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Set production environment variables
3. Use process managers like PM2 for Node.js services
4. Use Gunicorn or uWSGI for the Python AI server
5. Configure reverse proxy (Nginx/Apache)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👥 Team

Built with ❤️ by the AlgoRangers team

## 🐛 Known Issues

* Check the [Issues](https://github.com/Hacker-Ring/AlgoRangers-weavespace-ai/issues) page for current bugs and feature requests
* AI model may require significant memory for large workspaces
* WebRTC voice chat may have compatibility issues with some browsers

## 📞 Support

If you encounter any issues or have questions, please:

* Open an issue on [GitHub](https://github.com/Hacker-Ring/AlgoRangers-weavespace-ai/issues)
* Contact the team through the repository

## 🙏 Acknowledgments

* Thanks to all contributors who have helped build this project
* Special thanks to the open-source community for the amazing tools and libraries
* Powered by Socket.io, WebRTC, and modern ML frameworks

## 🔍 Troubleshooting

### Common Issues:

**Port Already in Use**

```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 5173 (frontend)
npx kill-port 5173

# Kill process on port 5000 (AI model)
npx kill-port 5000
```

**Python Dependencies Issues**

```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**CORS Issues**

Ensure your backend `.env` file has the correct `FRONTEND_URL` and the AI model server allows requests from your backend.

**AI Model Connection Sequence**

Make sure to copy the exact URL displayed in the terminal after running `python app.py` and update it in frontend/public/whiteboard.html.
```bash
// IMPORTANT: Replace this with your current ngrok URL from model server
const backendUrl = '{Paste your ngrok url}/generate';
```
---

**Happy Collaborating! 🚀**
