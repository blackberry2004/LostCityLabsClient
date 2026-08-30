const { ipcRenderer } = require('electron');

// The four Lost Citizens worlds. `url` is loaded directly in the game tab.
const worlds = [
    {
        key: 'world1',
        title: 'World 1',
        url: 'https://www.lostcitylabs.com/play/world-1/'
    },
    {
        key: 'world2',
        title: 'World 2',
        url: 'https://www.lostcitylabs.com/play/world-2/'
    },
    {
        key: 'world3',
        title: 'World 3',
        url: 'https://www.lostcitylabs.com/play/world-3/'
    },
    {
        key: 'world4',
        title: 'World 4',
        url: 'https://www.lostcitylabs.com/play/world-4/'
    }
];

function displayWorlds() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="world-grid"></div>';
    const grid = content.querySelector('.world-grid');

    worlds.forEach(world => {
        const item = document.createElement('div');
        item.className = 'world-item';
        item.id = `world-${world.key}`;
        item.innerHTML = `
            <div class="world-title">${world.title}</div>
            <div class="world-latency" style="color: #888888;">pinging...</div>
        `;
        item.onclick = () => selectWorld(world);
        grid.appendChild(item);

        // Ping the world in the background to show latency.
        measureWorldLatency(world);
    });
}

async function measureWorldLatency(world) {
    try {
        const startTime = performance.now();
        await fetch(world.url, { method: 'HEAD', mode: 'no-cors' });
        const latency = Math.round(performance.now() - startTime);
        world.latency = latency;
        const el = document.querySelector(`#world-${world.key} .world-latency`);
        if (el) {
            el.textContent = `${latency}ms`;
            el.style.color = getLatencyColor(latency);
        }
    } catch (error) {
        console.error(`Failed to measure latency for ${world.title}:`, error);
        const el = document.querySelector(`#world-${world.key} .world-latency`);
        if (el) { el.textContent = 'offline'; el.style.color = '#ff0000'; }
    }
}

function getLatencyColor(latency) {
    if (latency <= 50) return '#00ff00';      // excellent
    if (latency <= 80) return '#ffff00';      // good
    if (latency <= 120) return '#ff8800';     // fair
    return '#ff0000';                         // poor
}

function selectWorld(world) {
    ipcRenderer.send('select-world', world.url, world.title);
}

function refreshWorlds() {
    displayWorlds();
}

function goBack() {
    ipcRenderer.send('switch-nav-view', 'nav');
}

window.onload = displayWorlds;
