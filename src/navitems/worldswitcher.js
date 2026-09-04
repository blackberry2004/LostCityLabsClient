const { ipcRenderer } = require('electron');

// The four Lost Citizens worlds. `url` is loaded directly in the game tab.
const worlds = [
    {
        key: 'world1',
        num: 1,
        title: 'World 1',
        url: 'https://www.lostcitylabs.com/play/world-1/'
    },
    {
        key: 'world2',
        num: 2,
        title: 'World 2',
        url: 'https://www.lostcitylabs.com/play/world-2/'
    },
    {
        key: 'world3',
        num: 3,
        title: 'World 3',
        url: 'https://www.lostcitylabs.com/play/world-3/'
    },
    {
        key: 'world4',
        num: 4,
        title: 'World 4',
        url: 'https://www.lostcitylabs.com/play/world-4/'
    }
];

// Latest per-world player counts pushed from main.js (scraped from
// lostcitylabs.com/play/'s player-count API, refreshed every 120s).
let latestPlayerCounts = {};

function applyPlayerCounts(counts) {
    latestPlayerCounts = counts || {};
    worlds.forEach(world => {
        const el = document.querySelector(`#world-${world.key} .world-players`);
        if (!el) return;
        const count = latestPlayerCounts[world.num];
        el.textContent = (count === null || count === undefined)
            ? 'players: —'
            : `${count} ${count === 1 ? 'player' : 'players'}`;
    });
}

ipcRenderer.invoke('get-world-player-counts').then(applyPlayerCounts).catch(() => {});
ipcRenderer.on('world-player-counts', (event, counts) => applyPlayerCounts(counts));

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
            <div class="world-players">players: …</div>
            <div class="world-latency" style="color: #888888;">pinging...</div>
        `;
        item.onclick = () => selectWorld(world);
        grid.appendChild(item);

        // Ping the world in the background to show latency.
        measureWorldLatency(world);
    });

    applyPlayerCounts(latestPlayerCounts);
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
