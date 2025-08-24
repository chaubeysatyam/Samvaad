# 🌟 samvaad - Real-Time Video Chat Application

**samvaad** (meaning "Conversation" in Sanskrit) is a modern, feature-rich real-time video chat application built with Node.js, Socket.IO, and WebRTC. It provides a seamless communication experience with video calls, instant messaging, emoji support, sticker sharing, collaborative drawing, and interactive effects.


<p>
  <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/chat%2Bvideo.png" alt="Image 1" width="350" style="margin: 5px;"/>
  <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/custom.png" alt="Image 2" width="350" style="margin: 5px;"/>
  <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/gif.png" alt="Image 3" width="350" style="margin: 5px;"/>
 <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/animation.png" alt="Image 3" width="350" style="margin: 5px;"/>
 <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/dot.png" alt="Image 3" width="350" style="margin: 5px;"/>
 <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/fileshare.png" alt="Image 3" width="350" style="margin: 5px;"/>
  <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/tictactoe.png" alt="Image 3" width="350" style="margin: 5px;"/>
   <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/whiteboard.png" alt="Image 3" width="350" style="margin: 5px;"/>
    <img src="https://github.com/chaubeysatyam/Samvaad/blob/462f44789b449dd8d99964c9fecfd35210ccfe89/samvaad/images/youtube.png" alt="Image 3" width="350" style="margin: 5px;"/>
 
</p>






## 🚀 Installation & Setup

### Prerequisites
- Node.js 
- npm or yarn
- Python 3.6+ (for the optional sticker management script)
- SSL certificates for HTTPS (required for WebRTC in browsers)

### Step 1: Clone the Repository
```bash
git clone https://github.com/chaubeysatyam/Samvaad.git
cd samvaad
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
For development/testing you can generate self-signed certificates:
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
This generates `images.json` listing available stickers from `public/stick/stick/`.

### Step 5: Start the Server
```bash
npm start
```
The application will be available at `https://localhost:3000` (when using HTTPS).

## ✨ Features
- WebRTC video calls with signaling via Socket.IO
- Real-time chat (text, emoji, stickers)
- File uploads (Multer) and static asset serving
- Collaborative drawing canvas and mini-games (tic-tac-toe, dot game)
- Visual effects (water animation, dynamic color changes)
- GIF search and sticker sharing

## 🐍 Python Script for Sticker Management
Purpose:
- Scans `public/stick/stick/` for PNG and WebP files and generates `images.json`.
- Enables searchable stickers using descriptive filenames.

Usage:
```bash
cd public/stick
python names.py
```
Naming tips:
- Use descriptive names (e.g., `please.png`, `sad_emoji.webp`)
- Avoid generic names like `image1.png` or `IMG_001.png`

## 🏗️ Project Structure
```
samvaad-DONE-Copy/
├── cert/                 # SSL certificates
├── public/               # Frontend assets
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── bod/              # Drawing canvas popup
│   ├── stick/            # Sticker collection (names.py, images.json, stick/)
│   └── videos/           # Video assets
├── uploads/              # File upload directory
├── server.js             # Node.js server
├── package.json
└── README.md
```

## Server Configuration
- Uses HTTPS (recommended) with SSL certificates for camera/microphone access.
- WebRTC signaling via Socket.IO.
- File upload handling with Multer.
- Static file serving and CORS enabled.

Note: For local HTTP testing (WebRTC may not work without HTTPS), modify `server.js` to use `http.createServer(app)` and remove certificate loading. Example snippet to change is documented in the repo.

## 📱 Usage Guide

Starting a Video Call
1. Click the Start Call button.
2. Allow camera and microphone permissions.
3. Share the link to invite others.

Messaging & Media
- Text: type and send messages.
- Emojis: open the emoji picker.
- Stickers: browse/search stickers populated from `images.json`.
- Files: upload via file picker.
- GIFs: search and send animated GIFs.

Drawing & Games
- Open the drawing canvas for collaborative play.
- Turn indicators show drawing permission (green = your turn, red = other user).
- Multiple brush sizes and colors available.

## 🔒 Security & Compatibility
- HTTPS encryption for all communications.
- Secure WebRTC connections.
- Basic file upload validation and sanitization; check uploads directory permissions.
- CORS protection is enabled where required.

Browser Support:
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

## 🐛 Troubleshooting

Video not working:
- Ensure HTTPS is enabled and certificates are valid.
- Check camera/microphone permissions and browser WebRTC support.

Connection issues:
- Verify network/firewall and SSL certificate configuration.
- Ensure the server is running on the expected port.

File uploads failing:
- Check `uploads/` directory permissions and file size limits.
- Verify available disk space.

Debug mode:
```javascript
localStorage.setItem('debug', 'true');
```

If you need HTTP for local testing, modify `server.js` as documented, but note modern browsers may block camera/mic access over plain HTTP.




## 🙏 Acknowledgments & Credits
Built with help from open-source tools and AI coding assistants. Made with ❤️ for seamless communication.

- WebRTC, Socket.IO, Node.js community  
- Tools: Multer, FormData, Python for sticker indexing  
- AI Assistance: ChatGPT (GPT), GitHub Copilot, DeepSeek  



