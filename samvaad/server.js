const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIO = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();

// Load the SSL certificate and key
const privateKey = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app); // Use https.createServer

const io = socketIO(server);

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Appends the file extension
    }
});

const upload = multer({ storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ filePath: `/uploads/${req.file.filename}`, originalName: req.file.originalname });
    } else {
        res.status(400).send('No file uploaded.');
    }
});

// History to store canvas actions
let history = [];
let historyIndex = -1;

io.on('connection', socket => {
    console.log('New client connected');

    socket.on('offer', data => {
        socket.broadcast.emit('offer', data);
    });

    socket.on('answer', data => {
        socket.broadcast.emit('answer', data);
    });

    socket.on('candidate', data => {
        socket.broadcast.emit('candidate', data);
    });

    socket.on('message', data => {
        // Broadcast to other clients
        socket.broadcast.emit('message', data);
        // Send back to sender to confirm message was sent
        socket.emit('messageSent', data);
    });

    socket.on('typing', (isTyping) => {
        // Broadcast typing status to other clients
        socket.broadcast.emit('userTyping', { 
            isTyping: isTyping, 
            userId: socket.id 
        });
    });

    socket.on('deleteMessage', data => {
        if (data.filePath) {
            fs.unlink(path.join(__dirname, data.filePath), err => {
                if (err) {
                    console.error(`Error deleting file: ${err}`);
                }
            });
        }
        socket.broadcast.emit('deleteMessage', data.id);
    });

    socket.on('animationTriggered', imgURL => {
        io.emit('animationTriggered', imgURL);
    });

    

    socket.on('startDrawing', data => {
        socket.broadcast.emit('startDrawing', data); // Emit to other clients
    });

    socket.on('draw', data => {
        io.emit('draw', data); // Emit to all clients
        // Add the draw action to history
        addToHistory(data);
    });

    socket.on('stopDrawing', () => {
        io.emit('stopDrawing'); // Emit to all clients
    });

    socket.on('undo', () => {
        if (canUndo()) {
            historyIndex--;
            io.emit('undo'); // Emit to all clients
        }
    });

    socket.on('redo', () => {
        if (canRedo()) {
            historyIndex++;
            io.emit('redo'); // Emit to all clients
        }
    });

    socket.on('clearCanvas', () => {
        history = [];
        historyIndex = -1;
        io.emit('clearCanvas'); // Emit to all clients
    });

    let pointerCount = 0;

    // Listen for 'canvasPointerEnter' event from the client
    socket.on('canvasPointerEnter', () => {
        // Increment the pointer count
        pointerCount++;
    
        // Update the indicator color and emit it to all clients
        updateIndicatorColor();
    });
    
    // Listen for 'canvasPointerLeave' event from the client
    socket.on('canvasPointerLeave', () => {
        // Decrement the pointer count
        pointerCount--;
    
        // Update the indicator color and emit it to all clients
        updateIndicatorColor();
    });
    
    // Function to update the indicator color based on the pointer count
    function updateIndicatorColor() {
        // If pointerCount is greater than 0, set color to red; otherwise, set it to green
        const color = pointerCount > 0 ? 'red' : 'green';
    
        // Emit the color to all clients
        io.emit('updateIndicatorColor', color);
    }
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

function addToHistory(action) {
    // Clear future history if new action is performed after undo
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(action);
    historyIndex++;
}

function canUndo() {
    return historyIndex > 0;
}

function canRedo() {
    return historyIndex < history.length - 1;
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
