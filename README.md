# Securo - AI-Powered Intelligent Surveillance System

![Securo Banner](https://via.placeholder.com/1200x300?text=Securo+Intelligent+Surveillance)

**Securo** is a cutting-edge, full-stack security application designed to provide real-time surveillance capabilities using advanced Artificial Intelligence. It combines a high-performance **FastAPI** backend with a sleek, responsive **React** frontend to offer features like real-time object detection, instant anomaly alerts via Telegram, and secure user management.

Whether you are monitoring a home, office, or public space, Securo provides the intelligence you need to stay safe.

---

## 🚀 Key Features

### 🧠 AI-Powered Detection
Leveraging **YOLOv5** and **PyTorch**, Securo can detect a wide range of objects and potential threats in real-time:
- **People Detection**: Accurate identification of individuals in the frame.
- **Weapon Detection**: Identifies firearms and other weapons.
- **Fire Detection**: Early warning system for fire hazards.
- **Shoplifting**: Detects suspicious behavior patterns associated with theft.
- **Crowd Analysis**: Monitors crowd density and movement.
- **Accident Detection**: Identifies traffic accidents or falls.
- **Vandalism**: Flags potential acts of vandalism.

### ⚡ Real-Time Alerts
- **Telegram Integration**: Receive instant snapshots and notifications directly to your Telegram when an anomaly is detected.
- **Live Dashboard**: Watch live video feeds with bounding box overlays showing detected objects and confidence scores.

### 🛡️ Security & Management
- **Secure Authentication**: JWT-based login and registration system to protect your data.
- **Camera Management**: Easily add, edit, and remove camera sources (RTSP streams or local webcams).
- **History & Logs**: Review past detection events and stored images in the anomaly history.
- **Image Analysis**: Upload static images for instant analysis using the same powerful AI models.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Headless UI](https://headlessui.com/)
- **State & Routing**: React Router DOM, Context API
- **Real-time**: Socket.io-client (for live alert streaming)
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI/ML**: PyTorch, torchvision, YOLOv5, OpenCV
- **Database**: MongoDB (Async via Motor)
- **Authentication**: OAuth2 with Password (JWT), Passlib (Bcrypt)
- **Image Processing**: Pillow, NumPy
- **Notifications**: pyTelegramBotAPI
- **Storage**: GridFS (MongoDB) for efficient image storage

---

## 📂 Project Structure

```
securo/
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── core/           # Configuration and security settings
│   │   ├── db/             # Database connection logic
│   │   ├── features/       # Core logic (Video processing, Stream Manager)
│   │   ├── models/         # Pydantic models & DB schemas
│   │   ├── routers/        # API endpoints (Auth, Cameras, Pipeline, etc.)
│   │   ├── services/       # Business logic services
│   │   ├── yolov5/         # YOLOv5 model files and weights
│   │   └── main.py         # Application entry point
│   ├── requirements.txt    # Core backend dependencies
│   ├── requirements_yolov5.txt # AI/ML specific dependencies
│   └── .env                # Backend environment variables
│
└── frontend/                # React Frontend
    ├── src/
    │   ├── api/            # API integration (Axios)
    │   ├── components/     # Reusable UI components (ModelCard, Header, etc.)
    │   ├── context/        # Global state (Auth, WebSocket)
    │   ├── pages/          # Application pages (Login, Dashboard, History)
    │   └── App.jsx         # Main component & Routing
    ├── package.json        # Node.js dependencies
    └── vite.config.js      # Vite configuration
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **MongoDB** (Running locally on default port `27017` or use a cloud URI)

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Windows
    python -m venv .venv
    .venv\Scripts\activate

    # Mac/Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    pip install -r requirements_yolov5.txt
    ```
    *Note: If you have a GPU, ensure you install the CUDA-enabled version of PyTorch manually if needed.*

4.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` directory with the following content:
    ```env
    MONGO_URI=mongodb://localhost:27017
    DB_NAME=securo_db
    SECRET_KEY=your_super_secret_key_change_this
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token
    TELEGRAM_CHAT_ID=your_telegram_chat_id
    ```

5.  **Run the server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend API will be available at `http://localhost:8000`.
    API Docs (Swagger UI): `http://localhost:8000/docs`

### 2. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will start at `http://localhost:5173`.

---

## 📝 Usage Guide

1.  **Access the App**: Open your browser and go to `http://localhost:5173`.
2.  **Register/Login**: Create a new account or log in with existing credentials.
3.  **Dashboard**:
    - View the list of active cameras.
    - Click "Start Stream" to view the live feed with object detection.
    - Toggle specific detection models (e.g., turn on "Fire" detection only) using the controls.
4.  **Upload Analysis**:
    - Go to the "Upload" section.
    - Drag and drop an image to have it analyzed by the AI models instantly.
5.  **Alerts**:
    - Check the "Alerts" or "History" page to see a log of all detected anomalies.
    - If configured, you will receive real-time notifications on Telegram.

---

## 🔌 API Overview

The backend exposes a comprehensive REST API. Here are the main resource groups:

-   **Auth**: `/auth/login`, `/auth/register` - User management.
-   **Cameras**: `/cameras/` - CRUD operations for managing camera sources.
-   **Pipeline**: `/pipeline/` - Control the video processing pipeline (start/stop streams).
-   **Anomalies**: `/anomalies/` - Retrieve detection history and logs.
-   **Upload**: `/upload_detect/` - Endpoint for static image analysis.
-   **WebSocket**: `/ws/anomalies` - Real-time stream of alert data.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
