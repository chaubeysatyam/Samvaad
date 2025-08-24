# 🌟 samvaad - Real-Time Video Chat Application

**samvaad** (meaning "Conversation" in Sanskrit) is a modern, feature-rich real-time video chat application built with Node.js, Socket.IO, and WebRTC. It provides a seamless communication experience with video calls, instant messaging, emoji support, sticker sharing, and interactive effects.

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Python 3.6+ (for sticker management script)
- SSL certificates for HTTPS (required for WebRTC)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd samvaad-DONE-Copy
```

### Step 2: Install Dependencies
```bash
npm init -y
npm install express socket.io multer
```

### Step 3: SSL Certificate Setup
Create a `cert` folder in the root directory and add your SSL certificates:
```
cert/
├── key.pem    # Private key
└── cert.pem   # Certificate
```

**For development/testing**, you can generate self-signed certificates:
```bash
mkdir cert
cd cert
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Step 4: Setup Sticker Collection (Optional)
```bash
cd public/stick
python names.py
```
This will generate the `images.json` file with all available stickers present inside sticker dir.

### Step 5: Start the Server
```bash
npm start
```

The application will be available at `https://localhost:3000`

## ✨ Features


## 🐍 Python Script for Sticker Management

The project includes a Python script (`public/stick/names.py`) that automatically manages the custom sticker collection:

**Purpose:**
- Automatically scans the `stick/sticker/` folder for PNG and WebP image files
- Generates `images.json` with a list of all available sticker images
- Enables dynamic sticker management without manual configuration
- **Searchable stickers**: Uses descriptive filenames for easy sticker discovery

**Usage:**
```bash
cd public/stick
python names.py
```

**What it does:**
1. Scans the sticker folder for image files
2. Filters for supported formats (PNG, WebP)
3. Creates `images.json` with all image filenames
4. The frontend automatically loads this file for sticker selection



✅ **Good Examples:**
- `please.png` - Easy to find by typing "please"
- `sad3demoji.webp` - Searchable by "sad" or "emoji"
- `shockemoji.webp` - Findable by "shock" or "emoji"
- `sleepemoji.webp` - Searchable by "sleep" or "emoji"
- `angryemoji.webp` - Findable by "angry" or "emoji"

❌ **Avoid:**
- `1.png`, `image1.webp` - Not searchable
- `sticker.png` - Too generic
- `IMG_001.png` - No descriptive information

**Search Tips:**
- Use underscores or hyphens to separate words
- Include emotion words (happy, sad, angry, love)
- Add object descriptions (cat, dog, heart, star)
- Use color descriptions when relevant (red, blue, green)

## 🏗️ Project Structure

```
samvaad-DONE-Copy/
├── cert/                 # SSL certificates
├── public/               # Frontend assets
│   ├── index.html       # Main application page
│   ├── styles.css       # Application styles
│   ├── app.js          # Frontend JavaScript
│   ├── bod/            # Drawing canvas popup
│   ├── stick/          # Sticker collection
│   │   ├── names.py    # Python script for sticker management
│   │   ├── images.json # Auto-generated sticker list
│   │   └── stick/      # Sticker image files
│   └── videos/         # Video assets
├── uploads/             # File upload directory
├── server.js            # Node.js server
├── package.json         # Dependencies
└── README.md           # This file
```



### Server Configuration
The server runs on HTTPS with the following features:
- **WebRTC signaling** via Socket.IO
- **File upload handling** with Multer
- **Static file serving** for uploads and assets
- **CORS enabled** for cross-origin requests

## 📱 Usage Guide

### Starting a Video Call
1. Click the **📞 Start Call** button
2. Allow camera and microphone permissions
3. Share the link with others to join

### Sending Messages
- **Text**: Type in the input field and press Enter or click ➤
- **Emojis**: Click 😊 to open emoji picker
- **Stickers**: Click 🎬 to browse and send stickers
  - **Search stickers**: Type keywords in the sticker search box
  - **Quick access**: Use descriptive filenames for easy discovery
- **Files**: Click 📁 to upload and share files
- **GIFs**: Search and send animated GIFs

### Special Features
- **Water Effect**: Click 💧, enter image URL, see 5-second water animation
- **Color Change**: Click 🎨 to change page colors dynamically
- **Drawing**: Click ✏️ to open drawing canvas with collaborative games
  - **Criss Cross Game**: Classic tic-tac-toe style game
  - **Dot Game**: Interactive dot connection game
  - **Drawing Permissions**: 
    - 🟢 Green dot = You can draw (your turn)
    - 🔴 Red dot = Other user is drawing (wait for your turn)
  - **Real-time Collaboration**: Multiple users can play together
  - **Drawing Tools**: Various colors and brush sizes available

## 🎯 Key Technologies

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Video**: WebRTC, MediaDevices API
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **File Handling**: Multer, FormData
- **Sticker Management**: Python 3.6+ (automated sticker indexing)
- **Security**: HTTPS, SSL/TLS

## 🔒 Security Features

- **HTTPS encryption** for all communications
- **Secure WebRTC** connections
- **File upload validation** and sanitization
- **CORS protection** against unauthorized access

## 🌐 Browser Compatibility

- **Chrome** 80+ (Recommended)
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 🐛 Troubleshooting

### Common Issues

**Video not working:**
- Ensure HTTPS is enabled
- Check camera/microphone permissions
- Verify WebRTC support in browser

**Connection issues:**
- Check firewall settings
- Verify SSL certificates
- Ensure proper network configuration

**Want to use HTTP instead of HTTPS?**
For development/testing without SSL certificates, you can modify `server.js`:

```javascript
// Change these lines in server.js:
// FROM (HTTPS):
const server = https.createServer(credentials, app);

// TO (HTTP):
const server = require('http').createServer(app);

// Also remove or comment out the SSL certificate loading:
// const privateKey = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'), 'utf8');
// const certificate = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'), 'utf8');
// const credentials = { key: privateKey, cert: certificate };
```

**Note:** Using HTTP will disable WebRTC video calling features, as modern browsers require HTTPS for camera/microphone access.

**File uploads failing:**
- Check uploads directory permissions
- Verify file size limits
- Check available disk space

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the (not known) License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **WebRTC** for real-time communication
- **Socket.IO** for real-time messaging
- **Node.js** community for excellent tooling
- **Open source contributors** for inspiration

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code comments

---

**Made with ❤️ for seamless communication**

**Development Assistance**: This project was developed with the assistance of AI coding assistants to ensure code quality, documentation, and best practices implementation.

## 🏗️ Project Structure

```
samvaad-DONE-Copy/
├── cert/                 # SSL certificates
├── public/               # Frontend assets
│   ├── index.html       # Main application page
│   ├── styles.css       # Application styles
│   ├── app.js          # Frontend JavaScript
│   ├── bod/            # Drawing canvas popup
│   ├── stick/          # Sticker collection
│   │   ├── names.py    # Python script for sticker management
│   │   ├── images.json # Auto-generated sticker list
│   │   └── stick/      # Sticker image files
│   └── videos/         # Video assets
├── uploads/             # File upload directory
├── server.js            # Node.js server
├── package.json         # Dependencies
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
```

### Python Script for Sticker Management
The project includes a Python script (`public/stick/names.py`) that automatically manages the custom sticker collection:

**Purpose:**
- Automatically scans the `stick/sticker/` folder for PNG and WebP image files
- Generates `images.json` with a list of all available sticker images
- Enables dynamic sticker management without manual configuration
- **Searchable stickers**: Uses descriptive filenames for easy sticker discovery

**Usage:**
```bash
cd public/stick
python names.py
```

**What it does:**
1. Scans the sticker folder for image files
2. Filters for supported formats (PNG, WebP)
3. Creates `images.json` with all image filenames
4. The frontend automatically loads this file for sticker selection

**Benefits:**
- **Easy sticker addition**: Just drop new images in the `stick/stick/` folder
- **Automatic updates**: Run the script to refresh the sticker collection
- **No manual configuration**: The app automatically detects new stickers
- **Consistent format**: Ensures all stickers are properly indexed
- **Searchable**: Descriptive filenames enable quick sticker discovery

**Sticker Naming Convention for Better Search:**
For optimal search functionality, use descriptive filenames:

✅ **Good Examples:**
- `please.png` - Easy to find by typing "please"
- `sad3demoji.webp` - Searchable by "sad" or "emoji"
- `shockemoji.webp` - Findable by "shock" or "emoji"
- `sleepemoji.webp` - Searchable by "sleep" or "emoji"
- `angryemoji.webp` - Findable by "angry" or "emoji"

❌ **Avoid:**
- `1.png`, `image1.webp` - Not searchable
- `sticker.png` - Too generic
- `IMG_001.png` - No descriptive information

**Search Tips:**
- Use underscores or hyphens to separate words
- Include emotion words (happy, sad, angry, love)
- Add object descriptions (cat, dog, heart, star)
- Use color descriptions when relevant (red, blue, green)

### Server Configuration
The server runs on HTTPS with the following features:
- **WebRTC signaling** via Socket.IO
- **File upload handling** with Multer
- **Static file serving** for uploads and assets
- **CORS enabled** for cross-origin requests

## 📱 Usage Guide

### Starting a Video Call
1. Click the **📞 Start Call** button
2. Allow camera and microphone permissions
3. Share the link with others to join

### Sending Messages
- **Text**: Type in the input field and press Enter or click ➤
- **Emojis**: Click 😊 to open emoji picker
- **Stickers**: Click 🎬 to browse and send stickers
  - **Search stickers**: Type keywords in the sticker search box
  - **Quick access**: Use descriptive filenames for easy discovery
- **Files**: Click 📁 to upload and share files
- **GIFs**: Search and send animated GIFs

### Special Features
- **Water Effect**: Click 💧, enter image URL, see 5-second water animation
- **Color Change**: Click 🎨 to change page colors dynamically
- **Drawing**: Click ✏️ to open drawing canvas with collaborative games
  - **Criss Cross Game**: Classic tic-tac-toe style game
  - **Dot Game**: Interactive dot connection game
  - **Drawing Permissions**: 
    - 🟢 Green dot = You can draw (your turn)
    - 🔴 Red dot = Other user is drawing (wait for your turn)
  - **Real-time Collaboration**: Multiple users can play together
  - **Drawing Tools**: Various colors and brush sizes available

## 🎯 Key Technologies

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Video**: WebRTC, MediaDevices API
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **File Handling**: Multer, FormData
- **Sticker Management**: Python 3.6+ (automated sticker indexing)
- **Security**: HTTPS, SSL/TLS

## 🔒 Security Features

- **HTTPS encryption** for all communications
- **Secure WebRTC** connections
- **File upload validation** and sanitization
- **CORS protection** against unauthorized access

## 🌐 Browser Compatibility

- **Chrome** 80+ (Recommended)
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 🐛 Troubleshooting

### Common Issues

**Video not working:**
- Ensure HTTPS is enabled
- Check camera/microphone permissions
- Verify WebRTC support in browser

**Connection issues:**
- Check firewall settings
- Verify SSL certificates
- Ensure proper network configuration

**Want to use HTTP instead of HTTPS?**
For development/testing without SSL certificates, you can modify `server.js`:

```javascript
// Change these lines in server.js:
// FROM (HTTPS):
const server = https.createServer(credentials, app);

// TO (HTTP):
const server = require('http').createServer(app);

// Also remove or comment out the SSL certificate loading:
// const privateKey = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'), 'utf8');
// const certificate = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'), 'utf8');
// const credentials = { key: privateKey, cert: certificate };
```

**Note:** Using HTTP will disable WebRTC video calling features, as modern browsers require HTTPS for camera/microphone access.

**File uploads failing:**
- Check uploads directory permissions
- Verify file size limits
- Check available disk space

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'true');
```



## 🙏 Acknowledgments

While most of the code and structure were built with step-by-step guidance from AI tools such as **ChatGPT**, **GitHub Copilot**, and **DeepSeek**, I took an active role in understanding, customizing, and improving most parts of the project.



**Made with ❤️ for seamless communication**
