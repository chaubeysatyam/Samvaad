const socket = io.connect();

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCallButton');
const chatInput = document.getElementById('chatInput');
const fileInput = document.getElementById('fileInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');

let localStream;
let peerConnection;
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

startCallButton.addEventListener('click', startCall);
sendButton.addEventListener('click', sendMessage);

async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(iceServers);

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
}

socket.on('offer', async offer => {
    if (!peerConnection) {
        startCall();
    }
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async answer => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', async candidate => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
        console.error('Error adding received ice candidate', e);
    }
});


// Replace local uses of addMessageToChat('', ...) with 'You'
function sendMessage() {
    const message = chatInput.value;
    const file = fileInput.files[0];
    const messageId = Date.now();  // Use timestamp as a unique message ID

    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const filePath = data.filePath;
            const originalName = data.originalName;
            socket.emit('message', { id: messageId, text: message, filePath, originalName });
            // Don't add message locally here - let the socket handle it
            chatInput.value = '';
            fileInput.value = '';
        })
        .catch(err => {
            console.error('Error uploading file:', err);
        });
    } else if (message.trim()) {
        if (youtubeRegex.test(message)) {
            const youtubeId = message.match(youtubeRegex)[1];
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'width: 100%; max-width: 400px; height: auto; aspect-ratio: 16/9; border-radius: 15px; border: none;';
            iframe.src = `https://www.youtube.com/embed/${youtubeId}`;
            iframe.frameborder = '0';
            iframe.allowfullscreen = true;
            const iframeHtml = iframe.outerHTML;
            
            socket.emit('message', { id: messageId, text: iframeHtml });
            // Don't add message locally here - let the socket handle it
        } else {
            socket.emit('message', { id: messageId, text: message });
            // Don't add message locally here - let the socket handle it
        }
        chatInput.value = '';
    }
}

// Add enter key functionality and typing indicator control
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        // Stop typing indicator when sending message
        clearTimeout(typingTimer);
        if (isTyping) {
            isTyping = false;
            socket.emit('typing', false);
        }
        sendMessage();
    }
});

// Add typing indicator functionality
let typingTimer;
let isTyping = false;

chatInput.addEventListener('input', function() {
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', true);
    }
    
    // Clear the timer
    clearTimeout(typingTimer);
    
    // Set a timer to stop typing indicator after 300ms of no input (more responsive)
    typingTimer = setTimeout(() => {
        isTyping = false;
        socket.emit('typing', false);
    }, 300);
});

// Add additional events for more accurate typing detection
chatInput.addEventListener('keydown', function() {
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', true);
    }
    clearTimeout(typingTimer);
});

chatInput.addEventListener('keyup', function() {
    // Clear the timer
    clearTimeout(typingTimer);
    
    // Set a timer to stop typing indicator after 300ms of no input
    typingTimer = setTimeout(() => {
        isTyping = false;
        socket.emit('typing', false);
    }, 300);
});

// Stop typing when input loses focus
chatInput.addEventListener('blur', function() {
    clearTimeout(typingTimer);
    if (isTyping) {
        isTyping = false;
        socket.emit('typing', false);
    }
});

// Typing indicator control handled in the main keypress event listener above

// Listen for typing events from other users
socket.on('userTyping', (data) => {
    if (data.isTyping && data.userId !== socket.id) {
        showTypingIndicator();
    } else {
        hideTypingIndicator();
    }
});

function showTypingIndicator() {
    // Remove existing typing indicator if any
    hideTypingIndicator();
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typingIndicator';
    typingIndicator.innerHTML = `
        <div class="typingBubble">
            <span class="typingText">typing</span>
            <span class="typingDots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </span>
        </div>
    `;
    
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const existingIndicator = chatMessages.querySelector('.typingIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
}

// Ensure incoming socket messages are shown as "Peer"
socket.on('message', data => {
    addMessageToChat('Peer', data.text, data.id, data.filePath, data.originalName, data.isSticker);
});

// Handle your own messages from socket
socket.on('messageSent', data => {
    addMessageToChat('You', data.text, data.id, data.filePath, data.originalName, data.isSticker);
});

function addMessageToChat(sender, message, id, filePath, originalName, isSticker = false) {
    const messageElement = document.createElement('div');
    messageElement.dataset.id = id;
    messageElement.className = 'chatMessage ' + (sender === 'You' ? 'yourMessage' : 'peerMessage');

    const messageContent = document.createElement('div');
    messageContent.className = 'messageContent';
    
    // Check if message is just emojis (no text, only emoji characters)
    const isOnlyEmojis = message && !filePath && /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}-\u{2454}\u{20D0}-\u{20FF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F910}-\u{1F96B}\u{1F980}-\u{1F9E0}]+$/u.test(message.trim());
    
    // Check if it's a sticker (has isSticker flag or is an image with no text)
    const isStickerMessage = isSticker || (filePath && !message.trim());
    
    // If it's only emojis or a sticker, don't show bubble
    if (isOnlyEmojis || isStickerMessage) {
        messageContent.className = 'messageContent noBubble';
        
        if (isOnlyEmojis) {
            // For emoji-only messages, just show the emojis
            const emojiElement = document.createElement('div');
            emojiElement.className = 'emojiMessage';
            emojiElement.innerHTML = message;
            messageContent.appendChild(emojiElement);
        } else if (isStickerMessage && filePath) {
            // For stickers, show the image without bubble
            const image = document.createElement('img');
            image.src = filePath;
            image.alt = originalName || 'sticker';
            image.className = 'stickerImage';
            messageContent.appendChild(image);
        }
    } else {
        // Regular message with bubble
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Add sender name
        const senderElement = document.createElement('div');
        senderElement.className = 'sender';
        senderElement.textContent = sender === 'You' ? 'You' : 'Peer';
        
        // Add message text
        const textElement = document.createElement('div');
        textElement.className = 'text';
        textElement.innerHTML = message;
        
        // Assemble the bubble
        bubble.appendChild(senderElement);
        bubble.appendChild(textElement);
        messageContent.appendChild(bubble);

        // If filePath is present, render it appropriately below the bubble
        if (filePath) {
            const fileExtension = filePath.split('.').pop().toLowerCase();

            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
                const image = document.createElement('img');
                image.src = filePath;
                image.alt = originalName || 'image';
                image.className = 'fileThumbnail';
                messageContent.appendChild(image);
            } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                const video = document.createElement('video');
                video.src = filePath;
                video.controls = true;
                video.className = 'fileThumbnail';
                messageContent.appendChild(video);
            } else if (['mp3', 'wav'].includes(fileExtension)) {
                const audio = document.createElement('audio');
                audio.src = filePath;
                audio.controls = true;
                audio.className = 'fileThumbnail';
                messageContent.appendChild(audio);
            } else {
                const fileLink = document.createElement('a');
                fileLink.href = filePath;
                fileLink.textContent = `Download: ${originalName || 'file'}`;
                fileLink.target = '_blank';
                fileLink.className = 'fileLink';
                messageContent.appendChild(fileLink);
            }
        }
    }

    // Add delete button only for your messages
    if (sender === 'You') {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'deleteBtn';
        deleteButton.textContent = '🗑️';
        deleteButton.title = 'Delete message';
        deleteButton.addEventListener('click', () => deleteMessage(id, filePath));
        messageElement.appendChild(messageContent);
        messageElement.appendChild(deleteButton);
    } else {
        messageElement.appendChild(messageContent);
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update sendFileUpload local display to use 'You'
function sendFileUpload(imageSrc) {
    const messageId = Date.now();
    fetch(imageSrc)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const file = new File([blob], "image.png", { type: "image/png" });
            const formData = new FormData();
            formData.append('file', file);

            return fetch('/upload', {
                method: 'POST',
                body: formData
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('File upload failed');
            }
            return response.json();
        })
        .then(data => {
            const filePath = data.filePath;
            const originalName = data.originalName;
            socket.emit('message', { id: messageId, text: '', filePath, originalName, isSticker: true });
            // Don't add message locally - let socket handle it
        })
        .catch(err => {
            console.error('Error uploading file:', err);
            alert('Failed to upload the GIF. Please try again.');
        });
}

function deleteMessage(id, filePath) {
    socket.emit('deleteMessage', { id, filePath });
    removeMessageFromChat(id);
}

function removeMessageFromChat(id) {
    const messageElement = chatMessages.querySelector(`[data-id='${id}']`);
    if (messageElement) {
        chatMessages.removeChild(messageElement);
    }
}

socket.on('deleteMessage', id => {
    removeMessageFromChat(id);
});





// JavaScript for draggable local video

const localVideoContainer = document.getElementById('localVideoContainer');

let isDragging = false;
let prevX = 0;
let prevY = 0;

localVideo.addEventListener('mousedown', startDragging);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDragging);

function startDragging(e) {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
}

function drag(e) {
    if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        const rect = localVideoContainer.getBoundingClientRect();
        const newX = rect.left + dx;
        const newY = rect.top + dy;

        localVideoContainer.style.left = `${newX}px`;
        localVideoContainer.style.top = `${newY}px`;

        prevX = e.clientX;
        prevY = e.clientY;
    }
}

function stopDragging() {
    isDragging = false;
}




// JavaScript for muting/unmuting microphone and toggling camera
const muteButton = document.getElementById('muteButton');
const toggleCameraButton = document.getElementById('toggleCameraButton');

let isMuted = false;
let isCameraOff = false;

muteButton.addEventListener('click', toggleMute);
toggleCameraButton.addEventListener('click', toggleCamera);

function toggleMute() {
    isMuted = !isMuted;
    const audioTrack = localVideo.srcObject.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !isMuted;
    }

    // Change button symbol based on mute status
    if (isMuted) {
        muteButton.textContent = '🔇';
    } else {
        muteButton.textContent = '🎙️';
    }
}

function toggleCamera() {
    isCameraOff = !isCameraOff;
    const videoTrack = localVideo.srcObject.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !isCameraOff;
    }

    // Change button symbol based on camera status
    if (isCameraOff) {
        toggleCameraButton.textContent = '🚫';
    } else {
        toggleCameraButton.textContent = '📸';
    }
}

document.getElementById('fileButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});





let lastMouseMoveTime = Date.now();

document.addEventListener('mousemove', (event) => {
    const cursor = document.querySelector('.cursor');
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;

    lastMouseMoveTime = Date.now();

    const star = document.createElement('div');
    star.classList.add('trail');
    star.style.left = `${event.clientX}px`;
    star.style.top = `${event.clientY}px`;
    document.body.appendChild(star);

    setTimeout(() => {
        star.remove();
    }, 800);
});

setInterval(() => {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastMouseMoveTime;
    const cursor = document.querySelector('.cursor');
    
    if (cursor) { // Check if cursor element exists
        if (elapsedTime >= 3000) {
            cursor.style.display = 'none';
        } else {
            cursor.style.display = 'block';
        }
    }
}, 1000);





document.addEventListener('DOMContentLoaded', function () {
    const emojiButton = document.getElementById('emojiButton');
    const emojiPopup = document.getElementById('emojiPopup');
    const emojiContainer = document.getElementById('emojiContainer');
    const chatInput = document.getElementById('chatInput');

    // Event listener for emoji button click
    emojiButton.addEventListener('click', function () {
        toggleEmojiPopup();
    });

    // Function to toggle emoji popup visibility
    function toggleEmojiPopup() {
        emojiPopup.style.display = emojiPopup.style.display === 'block' ? 'none' : 'block';
    }

    // Event listener for clicking on an emoji in the emoji popup
    emojiContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('emoji')) {
            insertEmoji(event.target.textContent);
        }
    });

    // Function to insert emoji into chat input
    function insertEmoji(emoji) {
        const cursorPosition = chatInput.selectionStart;
        const textBeforeCursor = chatInput.value.substring(0, cursorPosition);
        const textAfterCursor = chatInput.value.substring(cursorPosition);
        chatInput.value = textBeforeCursor + emoji + textAfterCursor;
        chatInput.focus();
    }

    // Fetch emojis from emoji.txt file
    fetch('emoji.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch emojis');
            }
            return response.text();
        })
        .then(data => {
            const emojis = data.split('\n');
            // Create emoji elements and add to emoji container
            emojis.forEach(emoji => {
                const emojiElement = document.createElement('span');
                emojiElement.classList.add('emoji');
                emojiElement.textContent = emoji;
                emojiContainer.appendChild(emojiElement);
            });
        })
        .catch(error => {
            console.error('Error fetching emojis:', error);
            // Handle error: Display a message to the user or take appropriate action
        });

    // Event listener for Enter key press in chat input
    chatInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && emojiPopup.style.display === 'block') {
            toggleEmojiPopup();
        }
    });

    // Event listener for sending a message
    document.getElementById('sendButton').addEventListener('click', function () {
        if (emojiPopup.style.display === 'block') {
            toggleEmojiPopup();
        }
    });
});





// Old gifButton event listener removed - now handled by openLocalStickersModal function

function closeModal() {
    const gifModal = document.getElementById('gifModal');
    const gifContent = document.getElementById('gifContent');

    gifModal.style.display = 'none';
    // Close button will be hidden automatically when modal is hidden
    gifContent.innerHTML = '';
}

// Tenor GIF Modal functionality
let tenorCurrentPage = 0;
let tenorSearchTerm = '';
let tenorLoading = false;

// Open Tenor GIF modal (default)
function openTenorModal() {
    const tenorModal = document.getElementById('tenorGifModal');
    tenorModal.style.display = 'block';
    tenorCurrentPage = 0;
    tenorSearchTerm = '';
    loadTrendingGifs();
}

// Close Tenor GIF modal
function closeTenorModal() {
    const tenorModal = document.getElementById('tenorGifModal');
    tenorModal.style.display = 'none';
    tenorCurrentPage = 0;
    tenorSearchTerm = '';
}

// Open local stickers modal
function openLocalStickersModal() {
    const gifModal = document.getElementById('gifModal');
    const gifContent = document.getElementById('gifContent');
    const searchInput = document.getElementById('searchInput');

    gifModal.style.display = 'block';
    // Close button is now inside modal, so it will show automatically

    // Clear the search input and previous content
    searchInput.value = '';
    gifContent.innerHTML = '';

    // Remove previous event listener to prevent duplication
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    fetch('stick/images.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let gifs = data;
            let filteredGifs = gifs; // Initialize filtered GIFs with all GIFs

            function shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            function loadImages(array) {
                gifContent.innerHTML = ''; // Clear existing content
                array.forEach((gifSrc) => {
                    const img = new Image();
                    img.onload = function () {
                        img.classList.add('gif-img');
                        gifContent.appendChild(img);
                        setTimeout(() => {
                            img.style.opacity = 1;
                        }, 100);
                    };
                    img.onerror = function () {
                        console.error('Error loading image:', img.src);
                    };
                    img.src = 'stick/stick/' + gifSrc;
                    img.addEventListener('click', function() {
                        sendFileUpload(img.src);
                        closeModal();
                    });
                });

                if (array.length === 0) {
                    gifContent.innerHTML = '<p style="color:black;">No GIFs found .Try another word. Or U can add it.</button>';
                }
            }

            newSearchInput.addEventListener('input', function() {
                const searchTerm = newSearchInput.value.toLowerCase();
                filteredGifs = gifs.filter(gif => gif.toLowerCase().includes(searchTerm));
                loadImages(filteredGifs);
            });

            loadImages(shuffleArray(gifs)); // Load shuffled GIFs initially
        })
        .catch(error => {
            console.error('Error fetching GIFs:', error);
            gifContent.innerHTML = '<p style="color:black;">Error loading GIFs. Please try again later.</p>';
        });
}

// Load trending GIFs from Tenor
async function loadTrendingGifs() {
    if (tenorLoading) return;
    
    tenorLoading = true;
    showTenorLoading();
    
    try {
        const response = await fetch(`https://g.tenor.com/v1/trending?key=___YOUT_API_KEY___&limit=50`);
        const data = await response.json();
        
        if (data.results) {
            displayTenorGifs(data.results);
            tenorCurrentPage++;
        }
    } catch (error) {
        console.error('Error loading trending GIFs:', error);
        const content = document.getElementById('tenorGifContent');
        if (content) {
            content.innerHTML = '<p style="color: #666; text-align: center;">Error loading GIFs. Please try again.</p>';
        }
    }
    
    tenorLoading = false;
    hideTenorLoading();
}

// Search GIFs from Tenor
async function searchTenorGifs(searchTerm) {
    if (tenorLoading) return;
    
    tenorLoading = true;
    showTenorLoading();
    
    try {
        const response = await fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(searchTerm)}&key=___YOUR__API__KEY___&limit=50`);
        const data = await response.json();
        
        if (data.results) {
            if (tenorCurrentPage === 0) {
                // Clear content for new search
                document.getElementById('tenorGifContent').innerHTML = '';
            }
            displayTenorGifs(data.results);
            tenorCurrentPage++;
        }
    } catch (error) {
        console.error('Error searching GIFs:', error);
        const content = document.getElementById('tenorGifContent');
        if (content) {
            content.innerHTML = '<p style="color: #666; text-align: center;">Error searching GIFs. Please try again.</p>';
        }
    }
    
    tenorLoading = false;
    hideTenorLoading();
}

// Display Tenor GIFs
function displayTenorGifs(gifs) {
    const content = document.getElementById('tenorGifContent');
    
    gifs.forEach(gif => {
        const gifItem = document.createElement('div');
        gifItem.className = 'tenor-gif-item';
        
        const img = document.createElement('img');
        // Use the correct v1 API properties
        img.src = gif.media[0].tinygif.url || gif.media[0].gif.url;
        img.alt = gif.title || 'GIF';
        img.loading = 'lazy';
        
        gifItem.appendChild(img);
        
        gifItem.addEventListener('click', () => {
            // Send the GIF URL to chat - use the full-size GIF
            const gifUrl = gif.media[0].gif.url;
            sendGifToChat(gifUrl);
            closeTenorModal();
        });
        
        content.appendChild(gifItem);
    });
}

// Send GIF to chat
function sendGifToChat(gifUrl) {
    const messageId = Date.now();
    socket.emit('message', { id: messageId, text: '', filePath: gifUrl, originalName: 'gif.gif', isSticker: true });
}

// Show loading spinner
function showTenorLoading() {
    const content = document.getElementById('tenorGifContent');
    if (content) {
        const loading = document.createElement('div');
        loading.className = 'loading-spinner';
        loading.textContent = 'Loading';
        loading.id = 'tenorLoadingSpinner';
        content.appendChild(loading);
    }
}

// Hide loading spinner
function hideTenorLoading() {
    const loading = document.getElementById('tenorLoadingSpinner');
    if (loading) {
        loading.remove();
    }
}

// Infinite scroll for Tenor modal
function setupTenorInfiniteScroll() {
    const content = document.getElementById('tenorGifContent');
    content.addEventListener('scroll', () => {
        if (content.scrollTop + content.clientHeight >= content.scrollHeight - 100) {
            if (tenorSearchTerm) {
                searchTenorGifs(tenorSearchTerm);
            } else {
                loadTrendingGifs();
            }
        }
    });
}

// Load more GIFs when scrolling
async function loadMoreGifs() {
    if (tenorLoading) return;
    
    if (tenorSearchTerm) {
        await searchTenorGifs(tenorSearchTerm);
    } else {
        await loadTrendingGifs();
    }
}

// Setup Tenor search input
function setupTenorSearch() {
    const searchInput = document.getElementById('tenorSearchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const searchTerm = e.target.value.trim();
        
        if (searchTerm) {
            searchTimeout = setTimeout(() => {
                tenorSearchTerm = searchTerm;
                tenorCurrentPage = 0;
                searchTenorGifs(searchTerm);
            }, 500);
        } else {
            tenorSearchTerm = '';
            tenorCurrentPage = 0;
            document.getElementById('tenorGifContent').innerHTML = '';
            loadTrendingGifs();
        }
    });
}





document.addEventListener("DOMContentLoaded", function() {
    var colorButton = document.getElementById("colorButton");
    var holdTimer;
    var isHeld = false;
    var reloadTriggered = false;
    var buttonClicked = false;

    colorButton.addEventListener("mousedown", function() {
        holdTimer = setTimeout(function() {
            isHeld = true;
            reloadStylesheet();
            setTimeout(function() {
                isHeld = false;
            }, 2000);
        }, 3000);
    });

    colorButton.addEventListener("mouseup", function() {
        clearTimeout(holdTimer);
        if (!isHeld && !reloadTriggered && buttonClicked) {
            changeColors();
        }
        resetFlags();
    });

    colorButton.addEventListener("click", function() {
        if (!isHeld && !reloadTriggered) {
            buttonClicked = true;
            changeColors();
        } else {
            buttonClicked = false;
        }
    });

    function changeColors() {
        try {
            var transitionDuration = "0.2s";
            var transitionTimingFunction = "ease";
            var styleSheets = document.styleSheets;

            for (var i = 0; i < styleSheets.length; i++) {
                var rules;
                try {
                    rules = styleSheets[i].cssRules || styleSheets[i].rules;
                } catch (error) {
                    console.error("Error accessing stylesheet:", styleSheets[i].href);
                    continue;
                }

                for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];

                    if (
                        rule instanceof CSSStyleRule &&
                        (rule.style.color || rule.style.backgroundColor)
                    ) {
                        if (
                            !rule.selectorText.includes("#chatInput") &&
                            !rule.selectorText.includes("body")
                        ) {
                            var randomTextColor = getLightRandomColor();
                            var randomBgColor = getLightRandomColor();

                            rule.style.transition = `color ${transitionDuration} ${transitionTimingFunction}, background-color ${transitionDuration} ${transitionTimingFunction}, box-shadow ${transitionDuration} ${transitionTimingFunction}`;

                            if (rule.style.color) {
                                rule.style.color = randomTextColor;
                            }
                            if (rule.style.backgroundColor) {
                                rule.style.backgroundColor = randomBgColor;
                            }

                            rule.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.1)";
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error occurred while changing colors:", error);
        }
    }

    function getLightRandomColor() {
        var r = Math.floor(Math.random() * 128) + 128;
        var g = Math.floor(Math.random() * 128) + 128;
        var b = Math.floor(Math.random() * 128) + 128;

        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function reloadStylesheet() {
        try {
            if (!reloadTriggered) {
                var link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "styles.css" + "?timestamp=" + new Date().getTime();
                link.setAttribute("type", "text/css");
                link.setAttribute("media", "all");
                link.setAttribute("style", "display: none;");
                document.head.appendChild(link);
                reloadTriggered = true; // Set flag to prevent multiple reloads
                setTimeout(function() {
                    removeTempStylesheet();
                }, 2000); // Remove the temporary stylesheet after 2 seconds
            }
        } catch (error) {
            console.error("Error occurred while reloading stylesheet:", error);
        }
    }

    function removeTempStylesheet() {
        var tempStylesheet = document.getElementById("tempStylesheet");
        if (tempStylesheet) {
            tempStylesheet.parentNode.removeChild(tempStylesheet);
        }
    }

    function resetFlags() {
        isHeld = false;
        reloadTriggered = false;
        buttonClicked = false;
        setTimeout(function() {
            isHeld = false; // Reset isHeld after 2 seconds
        }, 2000);
    }
});



  // Function to start the water animation
function startAnimation() {
    var imgURL = prompt("Enter the URL of the image:");
    if (imgURL) {
        // Emit a message to the server indicating that the animation has been triggered
        socket.emit('animationTriggered', imgURL);
        // Also trigger locally
        showWaterImage(imgURL);
    }
}

// Listen for animationTriggered event from the server
socket.on('animationTriggered', (imgURL) => {
    // Trigger the animation on receiving the event
    showWaterImage(imgURL);
});

function showWaterImage(imgURL) {
    // Create water effect container
    const waterContainer = document.createElement('div');
    waterContainer.className = 'waterEffectContainer';
    waterContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
    `;

    // Create the image element
    const waterImage = document.createElement('img');
    waterImage.src = imgURL;
    waterImage.className = 'waterEffectImage';
    waterImage.style.cssText = `
        max-width: 80%;
        max-height: 80%;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: waterFloat 5s ease-in-out;
        object-fit: contain;
    `;

    // Add water ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'waterRipple';
    ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        border: 3px solid rgba(0, 150, 255, 0.6);
        border-radius: 50%;
        animation: rippleEffect 5s ease-out;
        pointer-events: none;
    `;

    // Add water drops effect
    const waterDrops = document.createElement('div');
    waterDrops.className = 'waterDrops';
    waterDrops.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
    `;

    // Create multiple water drops
    for (let i = 0; i < 15; i++) {
        const drop = document.createElement('div');
        drop.className = 'waterDrop';
        drop.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, rgba(0, 150, 255, 0.8) 0%, rgba(0, 150, 255, 0.2) 100%);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: waterDropFall ${2 + Math.random() * 3}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        waterDrops.appendChild(drop);
    }

    // Assemble the water effect
    waterContainer.appendChild(waterImage);
    waterContainer.appendChild(ripple);
    waterContainer.appendChild(waterDrops);
    document.body.appendChild(waterContainer);

    // Remove after 5 seconds
    setTimeout(() => {
        if (waterContainer.parentNode) {
            waterContainer.parentNode.removeChild(waterContainer);
        }
    }, 5000);
}

function openPopup() {
    window.open("bod/index.html", "", "width=600, height=600");
}

// Initialize Tenor modal functionality
document.addEventListener("DOMContentLoaded", function() {
    // Setup Tenor modal
    setupTenorInfiniteScroll();
    setupTenorSearch();
    
    // Add click event to GIF button to open Tenor modal (default)
    const gifButton = document.getElementById('gifButton');
    if (gifButton) {
        gifButton.addEventListener('click', openTenorModal);
    }
    
    // Add click event to sticker button to open local stickers modal
    const stickerButton = document.getElementById('stickerButton');
    if (stickerButton) {
        stickerButton.addEventListener('click', openLocalStickersModal);
    }
});
