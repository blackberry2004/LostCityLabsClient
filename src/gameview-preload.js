const { ipcRenderer } = require('electron');

// ── Expose the game client instance for quick-login ───────────────────────────
// The page boots the client with an inline <script type="module"> that runs
// new Client(...) without keeping a reference. We catch that script node as it
// is added and rewrite its source to assign the instance to window.LCClient.
// The main process then calls window.LCClient.login(user, pass) directly via
// executeJavaScript — no keystroke simulation needed.
(function exposeGameClient() {
    try {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    try {
                        if (node.nodeName !== 'SCRIPT') continue;
                        const src = node.textContent || '';
                        if (src.includes('new Client(') && !src.includes('window.LCClient')) {
                            node.textContent = src.replace('new Client(', 'window.LCClient = new Client(');
                            observer.disconnect();
                            return;
                        }
                    } catch (e) { /* ignore individual node errors */ }
                }
            }
        });
        observer.observe(document, { childList: true, subtree: true });
    } catch (e) { /* ignore — quick-login simply won't be available */ }
})();

// Forward wheel events (when Ctrl is held) to the main process for zoom
window.addEventListener('wheel', (e) => {
    try {
        if (e.ctrlKey) {
            ipcRenderer.send('zoom-wheel', {
                deltaY: e.deltaY,
                deltaX: e.deltaX,
                ctrl: true,
                timestamp: Date.now()
            });
            e.preventDefault();
        }
    } catch (err) {
        // ignore
    }
}, { passive: false, capture: true });

// Detect clicks and hover on game view for AFK timer reset
window.addEventListener('DOMContentLoaded', () => {
    // Mouse click detection
    document.addEventListener('mousedown', () => {
        ipcRenderer.send('game-view-mouse-clicked');
    }, true);

    // Hover enter/leave — fires once on transition, no jitter.
    // main.js decides whether to act based on afkInputType === 'hover'.
    document.addEventListener('mouseenter', () => {
        ipcRenderer.send('game-view-hover-enter');
    });
    document.addEventListener('mouseleave', () => {
        ipcRenderer.send('game-view-hover-leave');
    });
    
    // Keyboard press detection
    document.addEventListener('keydown', () => {
        ipcRenderer.send('game-view-key-pressed');
    }, true);
});

// Screenshot capture functionality
// Listen for screenshot request from main process
ipcRenderer.on('request-screenshot', () => {
    try {
        // Find the game canvas - look for the main game canvas
        // The game typically uses a canvas with id 'canvas' or the first large canvas
        const canvas = findGameCanvas();

        if (canvas) {
            // Create a new canvas to capture ONLY the canvas content (no padding/borders)
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = canvas.width;
            captureCanvas.height = canvas.height;

            const ctx = captureCanvas.getContext('2d');
            // Draw only the canvas image data (no CSS styling)
            ctx.drawImage(canvas, 0, 0);

            const dataUrl = captureCanvas.toDataURL('image/png');
            ipcRenderer.send('save-screenshot', dataUrl);
            console.log('Screenshot captured from canvas:', canvas.width, 'x', canvas.height);
        } else {
            console.log('No game canvas found for screenshot');
        }
    } catch (err) {
        console.error('Error capturing screenshot:', err);
    }
});

// Adventure screenshot capture functionality
ipcRenderer.on('request-adventure-screenshot', () => {
    try {
        const canvas = findGameCanvas();

        if (canvas) {
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = canvas.width;
            captureCanvas.height = canvas.height;

            const ctx = captureCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0);

            const dataUrl = captureCanvas.toDataURL('image/png');
            ipcRenderer.send('save-adventure-screenshot', dataUrl);
            console.log('Adventure screenshot captured from canvas:', canvas.width, 'x', canvas.height);
        } else {
            console.log('No game canvas found for adventure screenshot');
        }
    } catch (err) {
        console.error('Error capturing adventure screenshot:', err);
    }
});

// Find the game canvas element
function findGameCanvas() {
    // Try multiple strategies to find the game canvas
    
    // Strategy 1: Look for canvas with specific IDs commonly used by game clients
    const canvasIds = ['canvas', 'gamecanvas', 'game-canvas', 'playcanvas', 'rs-canvas'];
    for (const id of canvasIds) {
        const canvas = document.getElementById(id);
        if (canvas && canvas.tagName === 'CANVAS') {
            return canvas;
        }
    }
    
    // Strategy 2: Look for canvas with specific dimensions (typically game canvases are large)
    const canvases = document.querySelectorAll('canvas');
    let largestCanvas = null;
    let largestArea = 0;
    
    for (const canvas of canvases) {
        const area = canvas.width * canvas.height;
        if (area > largestArea && area > 50000) { // At least 50k pixels
            largestArea = area;
            largestCanvas = canvas;
        }
    }
    
    if (largestCanvas) {
        return largestCanvas;
    }
    
    // Strategy 3: If there's only one canvas, use it
    if (canvases.length === 1) {
        return canvases[0];
    }
    
    return null;
}
