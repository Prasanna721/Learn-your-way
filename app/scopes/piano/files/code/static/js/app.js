// Piano keyboard configuration
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

// Web Audio API setup
let audioContext;

function initAudio() {
    try {
        audioContext = new AudioContext();
    } catch (error) {
        console.error('Web Audio API not supported:', error);
    }
}

function getFrequency(note) {
    // A4 = 440 Hz, calculate frequency based on note name
    const noteIndex = NOTES.indexOf(note);
    const semitonesFromA = noteIndex - 9; // A is index 9 in NOTES array
    return 440 * Math.pow(2, semitonesFromA / 12);
}

function playNote(note) {
    if (!audioContext) {
        initAudio();
    }
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    const frequency = getFrequency(note);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Simple note: play for fixed duration
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(now);
    oscillator.stop(now + 0.5);
}

function createPiano() {
    const piano = document.getElementById('piano');
    
    NOTES.forEach((note, index) => {
        const key = document.createElement('div');
        key.className = 'key';
        key.dataset.note = note;
        
        const isWhiteKey = WHITE_KEYS.includes(note);
        key.classList.add(isWhiteKey ? 'white' : 'black');
        
        const label = document.createElement('div');
        label.className = 'key-label';
        label.textContent = note;
        key.appendChild(label);
        
        // Mouse events
        key.addEventListener('mousedown', () => {
            key.classList.add('active');
            playNote(note);
            // Send note activation to network
            sendNoteToNetwork(index);
        });
        
        key.addEventListener('mouseup', () => {
            key.classList.remove('active');
        });
        
        key.addEventListener('mouseleave', () => {
            key.classList.remove('active');
        });
        
        // Touch events for mobile
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            key.classList.add('active');
            playNote(note);
            // Send note activation to network
            sendNoteToNetwork(index);
        });
        
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            key.classList.remove('active');
        });
        
        piano.appendChild(key);
    });
}

// Keyboard mapping
const KEYBOARD_MAP = {
    'a': 'C',
    'w': 'C#',
    's': 'D',
    'e': 'D#',
    'd': 'E',
    'f': 'F',
    't': 'F#',
    'g': 'G',
    'y': 'G#',
    'h': 'A',
    'u': 'A#',
    'j': 'B'
};

function handleKeyPress(event) {
    const note = KEYBOARD_MAP[event.key.toLowerCase()];
    if (note) {
        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.add('active');
            playNote(note);
            const noteIndex = NOTES.indexOf(note);
            sendNoteToNetwork(noteIndex);
        }
    }
}

function handleKeyRelease(event) {
    const note = KEYBOARD_MAP[event.key.toLowerCase()];
    if (note) {
        const key = document.querySelector(`[data-note="${note}"]`);
        if (key) {
            key.classList.remove('active');
        }
    }
}

// Neural Network Visualization
const NUM_NEURONS = 100;
const NUM_NOTES = NOTES.length;
let neurons = [];
let networkCanvas;
let networkCtx;
let connectionsCanvas;
let connectionsCtx;

// Connection mappings (for Python backend)
// inputNeuronMap: maps note index -> neuron index (left side neurons)
// outputNeuronMap: maps neuron index -> note index (right side neurons)
let inputNeuronMap = new Map(); // noteIndex -> neuronIndex
let outputNeuronMap = new Map(); // neuronIndex -> noteIndex
let inputNeurons = []; // Array of neuron indices that receive input
let outputNeurons = []; // Array of neuron indices that produce output
let connectionsInitialized = false; // Flag to ensure connections are only created once

function initNetwork() {
    networkCanvas = document.getElementById('network-canvas');
    networkCtx = networkCanvas.getContext('2d');
    connectionsCanvas = document.getElementById('connections-canvas');
    connectionsCtx = connectionsCanvas.getContext('2d');
    
    function resizeCanvases() {
        const networkRect = networkCanvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Network canvas
        networkCanvas.style.width = networkRect.width + 'px';
        networkCanvas.style.height = networkRect.height + 'px';
        networkCanvas.width = networkRect.width * dpr;
        networkCanvas.height = networkRect.height * dpr;
        networkCtx.setTransform(1, 0, 0, 1, 0, 0);
        networkCtx.scale(dpr, dpr);
        
        // Connections canvas (covers entire viewport for drawing connections)
        connectionsCanvas.style.width = window.innerWidth + 'px';
        connectionsCanvas.style.height = window.innerHeight + 'px';
        connectionsCanvas.width = window.innerWidth * dpr;
        connectionsCanvas.height = window.innerHeight * dpr;
        connectionsCtx.setTransform(1, 0, 0, 1, 0, 0);
        connectionsCtx.scale(dpr, dpr);
        
        createNeurons();
        createConnections(); // This will preserve existing mappings if already initialized
        drawNetwork();
        drawConnections();
    }
    
    window.addEventListener('resize', () => {
        resizeCanvases();
        setTimeout(() => {
            drawConnections();
        }, 100);
    });
    resizeCanvases();
}

function createNeurons() {
    neurons = [];
    const rect = networkCanvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Make blob wider - use more of the width, less of the height
    const radiusX = rect.width * 0.45; // Wide horizontally
    const radiusY = rect.height * 0.4; // Less tall
    
    // Create neurons positioned chaotically within elliptical/blob shape
    for (let i = 0; i < NUM_NEURONS; i++) {
        // Use polar coordinates with random radius and angle, then add some chaos
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random();
        
        // Create elliptical distribution for wider and larger blob
        const x = centerX + Math.cos(angle) * distance * radiusX + (Math.random() - 0.5) * radiusX * 0.2;
        const y = centerY + Math.sin(angle) * distance * radiusY + (Math.random() - 0.5) * radiusY * 0.2;
        
        neurons.push({
            x: x,
            y: y,
            activation: 0,
            index: i
        });
    }
}

function createConnections() {
    // Only create connections once - preserve mappings across resizes
    if (connectionsInitialized) {
        // Just update the networkConfig with existing mappings
        updateNetworkConfig();
        return;
    }
    
    // Clear existing mappings (should be empty on first run)
    inputNeuronMap.clear();
    outputNeuronMap.clear();
    inputNeurons = [];
    outputNeurons = [];
    
    const rect = networkCanvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    
    // Separate neurons into left and right based on their x position
    const leftNeurons = neurons.filter(n => n.x < centerX).map(n => n.index);
    const rightNeurons = neurons.filter(n => n.x >= centerX).map(n => n.index);
    
    // Shuffle to randomize selection (only done once)
    const shuffledLeft = [...leftNeurons].sort(() => Math.random() - 0.5);
    const shuffledRight = [...rightNeurons].sort(() => Math.random() - 0.5);
    
    // Map each note to a unique input neuron on the left
    for (let noteIndex = 0; noteIndex < NUM_NOTES; noteIndex++) {
        if (noteIndex < shuffledLeft.length) {
            const neuronIndex = shuffledLeft[noteIndex];
            inputNeuronMap.set(noteIndex, neuronIndex);
            if (!inputNeurons.includes(neuronIndex)) {
                inputNeurons.push(neuronIndex);
            }
        }
    }
    
    // Map output neurons on the right back to notes (ensure unique mapping)
    // Use same number of outputs as inputs for symmetry
    const numOutputs = Math.min(NUM_NOTES, shuffledRight.length);
    
    // Create array of note indices and shuffle to ensure random but unique assignment
    const availableNotes = Array.from({ length: NUM_NOTES }, (_, i) => i);
    const shuffledNotes = [...availableNotes].sort(() => Math.random() - 0.5);
    
    // Track which notes have been assigned to ensure uniqueness
    const assignedNotes = new Set();
    
    for (let i = 0; i < numOutputs; i++) {
        const neuronIndex = shuffledRight[i];
        
        // Find first available note that hasn't been assigned
        let noteIndex = -1;
        for (let j = 0; j < shuffledNotes.length; j++) {
            const candidateNote = shuffledNotes[j];
            if (!assignedNotes.has(candidateNote)) {
                noteIndex = candidateNote;
                assignedNotes.add(candidateNote);
                break;
            }
        }
        
        // Only assign if we found a unique note
        if (noteIndex >= 0) {
            outputNeuronMap.set(neuronIndex, noteIndex);
            if (!outputNeurons.includes(neuronIndex)) {
                outputNeurons.push(neuronIndex);
            }
        }
    }
    
    // Verify uniqueness
    const outputNoteValues = Array.from(outputNeuronMap.values());
    const uniqueNotes = new Set(outputNoteValues);
    if (outputNoteValues.length !== uniqueNotes.size) {
        console.warn('Warning: Duplicate note assignments detected!');
    } else {
        console.log(`Output mapping: ${outputNoteValues.length} unique notes assigned`);
    }
    
    // Mark as initialized
    connectionsInitialized = true;
    
    // Store mappings as arrays for Python backend
    updateNetworkConfig();
}

function updateNetworkConfig() {
    // Update the networkConfig object with current mappings
    // These will be sent to Python for network computation
    window.networkConfig = {
        num_neurons: NUM_NEURONS,
        num_notes: NUM_NOTES,
        input_neuron_indices: Array.from(inputNeuronMap.values()), // Which neurons receive input
        output_neuron_indices: Array.from(outputNeuronMap.keys()), // Which neurons produce output
        output_to_note: Array.from(outputNeuronMap.entries()).map(([neuronIdx, noteIdx]) => [neuronIdx, noteIdx])
    };
}

function drawNetwork() {
    const rect = networkCanvas.getBoundingClientRect();
    
    // Clear canvas
    networkCtx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw connections first (so neurons appear on top)
    // Draw all connections (fully connected network)
    for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
            const neuronA = neurons[i];
            const neuronB = neurons[j];
            const activationA = neuronA.activation || 0;
            const activationB = neuronB.activation || 0;
            
            // Check if this connection has recent weight changes
            const key1 = `${i}-${j}`;
            const key2 = `${j}-${i}`;
            const weightChange = weightChangeHistory.get(key1) || weightChangeHistory.get(key2) || 0;
            
            // Calculate connection strength based on activations
            const connectionStrength = Math.max(activationA, activationB);
            
            // Base connection visibility (very subtle - only faint background)
            let baseOpacity = 0.03;
            let lineWidth = 0.2;
            let strokeColor = 'rgba(255, 255, 255, ';
            
            // Only show enhanced connection when significantly active (increased threshold)
            if (connectionStrength > 0.25) {
                // Tone down opacity - cap at lower maximum
                const strengthFactor = Math.min((connectionStrength - 0.25) / 0.75, 1.0); // Normalize to 0-1
                baseOpacity = 0.08 + strengthFactor * 0.25; // Max opacity 0.33 instead of higher
                lineWidth = 0.4 + strengthFactor * 1.5; // Max width 1.9 instead of higher
                // More muted blue/cyan colors - tone down intensity
                const blueComponent = Math.min(200, 80 + strengthFactor * 120); // Softer blue, max 200
                strokeColor = `rgba(80, ${blueComponent}, 220, `; // Muted cyan-blue
            }
            
            // Only show weight changes when significant (increased threshold)
            if (weightChange > 0.02) {
                const strengthIntensity = Math.min((weightChange - 0.02) / 0.18, 1.0); // Normalize better
                // Cap opacity more aggressively
                baseOpacity = Math.max(baseOpacity, 0.15 + strengthIntensity * 0.2); // Max 0.35
                lineWidth = Math.max(lineWidth, 0.8 + strengthIntensity * 1.2); // Max 2.0
                // More muted green tint
                strokeColor = `rgba(80, ${Math.min(220, 120 + strengthIntensity * 100)}, 120, `; // Softer green
            }
            
            networkCtx.strokeStyle = strokeColor + baseOpacity + ')';
            networkCtx.lineWidth = lineWidth;
            
            // Draw the connection line
            networkCtx.beginPath();
            networkCtx.moveTo(neuronA.x, neuronA.y);
            networkCtx.lineTo(neuronB.x, neuronB.y);
            networkCtx.stroke();
            
            // Only draw activation pulse when connection is significantly active
            // And only if both neurons have meaningful activation
            if (connectionStrength > 0.3 && activationA > 0.2 && activationB > 0.2) {
                const pulseKey = key1;
                const pulseProgress = connectionPulses.get(pulseKey);
                
                // Only draw if pulse exists (was triggered by actual activity)
                if (pulseProgress !== undefined && pulseProgress < 1.0) {
                    // Calculate position along the line for pulse
                    const pulseX = neuronA.x + (neuronB.x - neuronA.x) * pulseProgress;
                    const pulseY = neuronA.y + (neuronB.y - neuronA.y) * pulseProgress;
                    
                    // Draw pulsing dot (size and opacity based on activation - toned down)
                    const pulseSize = 1.5 + connectionStrength * 3; // Smaller pulses
                    const pulseOpacity = (1 - Math.abs(pulseProgress - 0.5) * 2) * connectionStrength * 0.5; // More muted
                    
                    networkCtx.beginPath();
                    networkCtx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
                    networkCtx.fillStyle = `rgba(120, 180, 240, ${pulseOpacity})`; // Softer blue
                    networkCtx.fill();
                }
            }
        }
    }
    
    // Draw neurons with activation-based coloring
    neurons.forEach(neuron => {
        const activation = neuron.activation || 0;
        
        // Base color based on neuron type
        let baseColor = { r: 255, g: 255, b: 255 };
        if (inputNeurons.includes(neuron.index)) {
            baseColor = { r: 100, g: 200, b: 255 }; // Blue tint for input neurons
        } else if (outputNeurons.includes(neuron.index)) {
            baseColor = { r: 255, g: 200, b: 100 }; // Orange tint for output neurons
        }
        
        // Brightness based on activation (only show when meaningfully active - toned down)
        const brightness = activation > 0.15 ? 0.4 + Math.min((activation - 0.15) * 0.8, 0.4) : 0.25; // Max 0.8 instead of 1.0
        const fillColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${brightness})`;
        
        // Neuron circle - size varies with activation (only grow when active)
        const radius = activation > 0.15 ? 2 + (activation - 0.15) * 4 : 2; // Slightly smaller max size
        networkCtx.beginPath();
        networkCtx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
        networkCtx.fillStyle = fillColor;
        networkCtx.fill();
        
        // Glow effect only for significantly active neurons (more muted)
        if (activation > 0.25) {
            networkCtx.beginPath();
            networkCtx.arc(neuron.x, neuron.y, radius + 2, 0, Math.PI * 2); // Smaller glow radius
            // More muted glow opacity
            networkCtx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${(activation - 0.25) * 0.3})`; // Max 0.3 instead of 0.5
            networkCtx.fill();
        }
    });
}

function getKeyPosition(noteIndex) {
    const piano = document.getElementById('piano');
    const keys = piano.querySelectorAll('.key');
    if (noteIndex >= keys.length) return null;
    
    const key = keys[noteIndex];
    const rect = key.getBoundingClientRect();
    
    // Return position relative to viewport (for fixed canvas)
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        leftEdge: rect.left,
        rightEdge: rect.right
    };
}

function drawConnections() {
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    const networkRect = networkCanvas.getBoundingClientRect();
    const networkLeft = networkRect.left;
    const networkTop = networkRect.top;
    const currentTime = Date.now();
    
    // Clear connections canvas (use viewport dimensions)
    connectionsCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // Draw input connections (piano keys -> left neurons)
    inputNeuronMap.forEach((neuronIndex, noteIndex) => {
        const keyPos = getKeyPosition(noteIndex);
        const neuron = neurons[neuronIndex];
        
        if (keyPos && neuron) {
            // Check if this connection is active
            const activationTime = activeInputConnections.get(noteIndex);
            const isActive = activationTime && (currentTime - activationTime) < 800; // Active for 800ms
            const fadeProgress = isActive ? Math.max(0, 1 - (currentTime - activationTime) / 800) : 0;
            
            // Curve from left edge of key to neuron
            const startX = keyPos.leftEdge;
            const startY = keyPos.y;
            const endX = networkLeft + neuron.x;
            const endY = networkTop + neuron.y;
            
            // Control points for curved line
            const controlX1 = startX - 50;
            const controlY1 = startY;
            const controlX2 = endX - 30;
            const controlY2 = endY;
            
            // Draw connection with varying intensity based on activity
            if (isActive) {
                // Highlighted active connection
                connectionsCtx.strokeStyle = `rgba(100, 200, 255, ${0.3 + fadeProgress * 0.5})`;
                connectionsCtx.lineWidth = 1.5 + fadeProgress * 2.5;
                // Draw glow effect
                connectionsCtx.shadowBlur = 8;
                connectionsCtx.shadowColor = 'rgba(100, 200, 255, 0.6)';
            } else {
                // Normal inactive connection (more subtle)
                connectionsCtx.strokeStyle = 'rgba(100, 200, 255, 0.12)';
                connectionsCtx.lineWidth = 0.8;
                connectionsCtx.shadowBlur = 0;
            }
            
            connectionsCtx.beginPath();
            connectionsCtx.moveTo(startX, startY);
            connectionsCtx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
            connectionsCtx.stroke();
            
            // Reset shadow
            connectionsCtx.shadowBlur = 0;
        }
    });
    
    // Draw output connections (right neurons -> piano keys)
    outputNeuronMap.forEach((noteIndex, neuronIndex) => {
        const keyPos = getKeyPosition(noteIndex);
        const neuron = neurons[neuronIndex];
        
        if (keyPos && neuron) {
            // Check if this connection is active
            const activationTime = activeOutputConnections.get(noteIndex);
            const isActive = activationTime && (currentTime - activationTime) < 800; // Active for 800ms
            const fadeProgress = isActive ? Math.max(0, 1 - (currentTime - activationTime) / 800) : 0;
            
            // Curve from neuron to right edge of key
            const startX = networkLeft + neuron.x;
            const startY = networkTop + neuron.y;
            const endX = keyPos.rightEdge;
            const endY = keyPos.y;
            
            // Control points for curved line
            const controlX1 = startX + 30;
            const controlY1 = startY;
            const controlX2 = endX + 50;
            const controlY2 = endY;
            
            // Draw connection with varying intensity based on activity
            if (isActive) {
                // Highlighted active connection
                connectionsCtx.strokeStyle = `rgba(255, 200, 100, ${0.3 + fadeProgress * 0.5})`;
                connectionsCtx.lineWidth = 1.5 + fadeProgress * 2.5;
                // Draw glow effect
                connectionsCtx.shadowBlur = 8;
                connectionsCtx.shadowColor = 'rgba(255, 200, 100, 0.6)';
            } else {
                // Normal inactive connection (more subtle)
                connectionsCtx.strokeStyle = 'rgba(255, 200, 100, 0.12)';
                connectionsCtx.lineWidth = 0.8;
                connectionsCtx.shadowBlur = 0;
            }
            
            connectionsCtx.beginPath();
            connectionsCtx.moveTo(startX, startY);
            connectionsCtx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
            connectionsCtx.stroke();
            
            // Reset shadow
            connectionsCtx.shadowBlur = 0;
        }
    });
}

// WebSocket connection
let ws = null;
let weightChangeHistory = new Map(); // Track weight changes for visualization
let connectionPulses = new Map(); // Track activation pulses along connections
let animationTime = 0; // For animation timing
let OUTPUT_DELAY_MS = 300; // Delay before playing output notes (0-1000ms, default 300ms)
let notesHistory = []; // Track last 10 input/output note pairs
let currentInputNote = null; // Track the most recent input note
let activeInputConnections = new Map(); // Track active input connections: noteIndex -> activationTime
let activeOutputConnections = new Map(); // Track active output connections: noteIndex -> activationTime
let networkOnlyPlayback = false; // Flag to play only network outputs (skip normal playback)

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        // Hide loading overlay once connected
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        }
        // Send initialization with network config
        if (window.networkConfig) {
            ws.send(JSON.stringify({
                type: 'init',
                config: window.networkConfig
            }));
        }
    };
    
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'initialized') {
            console.log('Network initialized:', message.message);
        } else if (message.type === 'update') {
            // Receive activations and triggered notes
            console.log('Received update:', {
                activations_length: message.activations?.length,
                max_activation: message.activations ? Math.max(...message.activations).toFixed(3) : 'N/A',
                triggered_notes: message.triggered_notes,
                weight_changes: message.weight_changes?.length || 0
            });
            receiveNeuronActivations(message.activations, message.triggered_notes, message.weight_changes);
        } else if (message.type === 'reset_complete') {
            console.log('Network reset:', message.message);
            const resetBtn = document.getElementById('reset-network-btn');
            resetBtn.disabled = false;
            resetBtn.textContent = 'Reset Network';
            
            // Clear notes history
            notesHistory = [];
            updateNotesHistoryDisplay();
            
            // Clear visualization state
            weightChangeHistory.clear();
            connectionPulses.clear();
            activeInputConnections.clear();
            activeOutputConnections.clear();
            
            // Reset neuron activations
            if (neurons) {
                neurons.forEach(neuron => {
                    neuron.activation = 0;
                });
            }
        } else if (message.type === 'reset_error') {
            console.error('Reset error:', message.message);
            alert('Error resetting network: ' + message.message);
            const resetBtn = document.getElementById('reset-network-btn');
            resetBtn.disabled = false;
            resetBtn.textContent = 'Reset Network';
        } else if (message.type === 'pong') {
            // Keep-alive response
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected, attempting reconnect...');
        setTimeout(connectWebSocket, 3000);
    };
}

// Function to send note activation to Python backend
function sendNoteToNetwork(noteIndex) {
    if (ws && ws.readyState === WebSocket.OPEN && window.networkConfig) {
        console.log(`Sending note ${noteIndex} (${NOTES[noteIndex]}) to network`);
        // Track input note
        currentInputNote = noteIndex;
        // Highlight input connection
        activeInputConnections.set(noteIndex, Date.now());
        ws.send(JSON.stringify({
            type: 'note_input',
            note_index: noteIndex
        }));
    } else {
        console.warn('WebSocket not ready, note not sent. Ready state:', ws ? ws.readyState : 'null');
    }
}

// Function to receive neuron activations from Python backend
function receiveNeuronActivations(activations, triggeredNotes, weightChanges) {
    // Update neuron visualizations
    activations.forEach((activation, neuronIndex) => {
        if (neurons[neuronIndex]) {
            // Less aggressive smoothing to preserve activation strength
            const current = neurons[neuronIndex].activation || 0;
            neurons[neuronIndex].activation = current * 0.5 + activation * 0.5;
            
            // Only trigger pulse on connections when neuron significantly activates
            if (activation > 0.25) {
                // Reset pulse for connections to other active neurons only
                for (let k = 0; k < neurons.length; k++) {
                    if (k !== neuronIndex && neurons[k] && neurons[k].activation > 0.2) {
                        const key1 = `${neuronIndex}-${k}`;
                        const key2 = `${k}-${neuronIndex}`;
                        // Start pulse from source neuron
                        connectionPulses.set(key1, 0.0);
                        connectionPulses.set(key2, 0.0);
                    }
                }
            }
        }
    });
    
    // Debug: log max activation to see if we're getting data
    const maxActivation = Math.max(...activations);
    if (maxActivation > 0.01) {
        console.log(`Max activation: ${maxActivation.toFixed(3)}, triggered notes:`, triggeredNotes);
    }
    
    // Update weight change history for visualization
    if (weightChanges) {
        weightChanges.forEach(([i, j, delta]) => {
            const key = `${i}-${j}`;
            const current = weightChangeHistory.get(key) || 0;
            weightChangeHistory.set(key, current + delta);
            
            // Decay weight changes over time (more gradual)
            setTimeout(() => {
                const existing = weightChangeHistory.get(key);
                if (existing) {
                    weightChangeHistory.set(key, existing * 0.9);
                    if (weightChangeHistory.get(key) < 0.001) {
                        weightChangeHistory.delete(key);
                    }
                }
            }, 2000);
        });
    }
    
    // Update notes history with input/output pair
    if (currentInputNote !== null) {
        const inputNote = NOTES[currentInputNote];
        const outputNotes = triggeredNotes && triggeredNotes.length > 0 
            ? triggeredNotes.map(idx => NOTES[idx]) 
            : [];
        
        // Add to history (limit to 10 entries)
        notesHistory.unshift({
            input: inputNote,
            outputs: outputNotes,
            timestamp: Date.now()
        });
        if (notesHistory.length > 10) {
            notesHistory.pop();
        }
        
        // Update display
        updateNotesHistoryDisplay();
        
        // Reset current input note
        currentInputNote = null;
    }
    
    // Play triggered notes with delay and highlight output connections
    // Skip normal playback if in network-only mode (will be handled by network playback handler)
    if (!networkOnlyPlayback && triggeredNotes && triggeredNotes.length > 0) {
        triggeredNotes.forEach(noteIndex => {
            const note = NOTES[noteIndex];
            if (note) {
                // Highlight output connection
                activeOutputConnections.set(noteIndex, Date.now());
                
                if (OUTPUT_DELAY_MS > 0) {
                    setTimeout(() => {
                        playNote(note);
                    }, OUTPUT_DELAY_MS);
                } else {
                    playNote(note);
                }
            }
        });
    } else if (networkOnlyPlayback && triggeredNotes && triggeredNotes.length > 0) {
        // Still highlight connections even in network-only mode
        triggeredNotes.forEach(noteIndex => {
            activeOutputConnections.set(noteIndex, Date.now());
        });
    }
    
    // Network will be redrawn by animation loop
}

// Tune definition: "Twinkle Twinkle Little Star"
// C C G G A A G - F F E E D D C
const TWINKLE_TUNE = [
    { note: 'C', duration: 400 },
    { note: 'C', duration: 400 },
    { note: 'G', duration: 400 },
    { note: 'G', duration: 400 },
    { note: 'A', duration: 400 },
    { note: 'A', duration: 400 },
    { note: 'G', duration: 800 },
    { note: 'F', duration: 400 },
    { note: 'F', duration: 400 },
    { note: 'E', duration: 400 },
    { note: 'E', duration: 400 },
    { note: 'D', duration: 400 },
    { note: 'D', duration: 400 },
    { note: 'C', duration: 800 }
];

let isPlayingTune = false;

// Play tune directly (without network)
function playTuneDirectly() {
    if (isPlayingTune) return;
    isPlayingTune = true;
    
    const directBtn = document.getElementById('play-direct-btn');
    directBtn.classList.add('playing');
    directBtn.disabled = true;
    
    let delay = 0;
    TWINKLE_TUNE.forEach(({ note, duration }) => {
        setTimeout(() => {
            playNote(note);
        }, delay);
        delay += duration;
    });
    
    setTimeout(() => {
        isPlayingTune = false;
        directBtn.classList.remove('playing');
        directBtn.disabled = false;
    }, delay);
}

// Play tune through network (only play network outputs)
function playTuneThroughNetwork() {
    if (isPlayingTune || !ws || ws.readyState !== WebSocket.OPEN) {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            alert('Please wait for network connection...');
        }
        return;
    }
    
    isPlayingTune = true;
    const networkBtn = document.getElementById('play-network-btn');
    networkBtn.classList.add('playing');
    networkBtn.disabled = true;
    
    // Set network-only playback mode
    networkOnlyPlayback = true;
    
    // Function to send next note to network
    let tuneIndex = 0;
    function sendNextNote() {
        if (tuneIndex >= TWINKLE_TUNE.length) {
            // Wait a bit for final outputs, then restore
            setTimeout(() => {
                networkOnlyPlayback = false;
                isPlayingTune = false;
                networkBtn.classList.remove('playing');
                networkBtn.disabled = false;
            }, 1500);
            return;
        }
        
        const tuneNote = TWINKLE_TUNE[tuneIndex];
        const noteIndex = NOTES.indexOf(tuneNote.note);
        
        if (noteIndex >= 0) {
            // Send note to network (this will trigger network processing)
            // The receiveNeuronActivations function will handle playing outputs
            sendNoteToNetwork(noteIndex);
            
            // Wait before sending next note (gives network time to respond)
            setTimeout(() => {
                tuneIndex++;
                sendNextNote();
            }, tuneNote.duration);
        } else {
            tuneIndex++;
            sendNextNote();
        }
    }
    
    // Override receiveNeuronActivations to play outputs immediately in network-only mode
    const originalReceive = receiveNeuronActivations;
    const networkReceiveHandler = function(activations, triggeredNotes, weightChanges) {
        // Call original function for visualization and history
        originalReceive(activations, triggeredNotes, weightChanges);
        
        // In network-only mode, play outputs immediately (skip delay)
        if (networkOnlyPlayback && triggeredNotes && triggeredNotes.length > 0) {
            triggeredNotes.forEach(noteIndex => {
                const note = NOTES[noteIndex];
                if (note) {
                    // Play output note immediately
                    playNote(note);
                }
            });
        }
    };
    
    // Temporarily replace the handler
    window.receiveNeuronActivations = networkReceiveHandler;
    
    // Start playing
    sendNextNote();
    
    // Restore original handler after tune finishes
    setTimeout(() => {
        window.receiveNeuronActivations = originalReceive;
    }, TWINKLE_TUNE.reduce((sum, n) => sum + n.duration, 0) + 2000);
}

// Function to reset the network
function resetNetwork() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('Please wait for network connection...');
        return;
    }
    
    const resetBtn = document.getElementById('reset-network-btn');
    resetBtn.disabled = true;
    resetBtn.textContent = 'Resetting...';
    
    // Send reset message to backend
    ws.send(JSON.stringify({
        type: 'reset'
    }));
}

// Function to update the notes history display
function updateNotesHistoryDisplay() {
    const historyList = document.getElementById('notes-history-list');
    if (!historyList) return;
    
    // Clear existing entries
    historyList.innerHTML = '';
    
    // Create entries for each note pair
    notesHistory.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'note-entry';
        if (index === 0) {
            entryDiv.classList.add('new');
            // Remove 'new' class after animation
            setTimeout(() => entryDiv.classList.remove('new'), 500);
        }
        
        // Input note
        const inputDiv = document.createElement('div');
        inputDiv.className = 'note-entry-input';
        const inputLabel = document.createElement('span');
        inputLabel.className = 'note-label';
        inputLabel.textContent = 'In:';
        const inputValue = document.createElement('span');
        inputValue.className = 'note-value input';
        inputValue.textContent = entry.input;
        inputDiv.appendChild(inputLabel);
        inputDiv.appendChild(inputValue);
        
        // Arrow
        const arrow = document.createElement('span');
        arrow.className = 'note-arrow';
        arrow.textContent = '→';
        
        // Output notes
        const outputDiv = document.createElement('div');
        outputDiv.className = 'note-entry-output';
        if (entry.outputs.length > 0) {
            const outputLabel = document.createElement('span');
            outputLabel.className = 'note-label';
            outputLabel.textContent = 'Out:';
            const outputValue = document.createElement('span');
            outputValue.className = 'note-value output';
            // Show multiple outputs separated by commas
            outputValue.textContent = entry.outputs.join(', ');
            outputDiv.appendChild(outputLabel);
            outputDiv.appendChild(outputValue);
        } else {
            const noOutput = document.createElement('span');
            noOutput.className = 'note-no-output';
            noOutput.textContent = '—';
            outputDiv.appendChild(noOutput);
        }
        
        entryDiv.appendChild(inputDiv);
        entryDiv.appendChild(arrow);
        entryDiv.appendChild(outputDiv);
        historyList.appendChild(entryDiv);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    createPiano();
    initNetwork();
    
    // Setup output delay slider
    const delaySlider = document.getElementById('output-delay-slider');
    const delayValue = document.getElementById('delay-value');
    
    delaySlider.addEventListener('input', (e) => {
        OUTPUT_DELAY_MS = parseInt(e.target.value);
        delayValue.textContent = OUTPUT_DELAY_MS;
    });
    
    // Initialize display
    delayValue.textContent = OUTPUT_DELAY_MS;
    
    // Setup play buttons
    const playDirectBtn = document.getElementById('play-direct-btn');
    const playNetworkBtn = document.getElementById('play-network-btn');
    
    playDirectBtn.addEventListener('click', playTuneDirectly);
    playNetworkBtn.addEventListener('click', playTuneThroughNetwork);
    
    // Setup reset button
    const resetBtn = document.getElementById('reset-network-btn');
    resetBtn.addEventListener('click', resetNetwork);
    
    // Connect WebSocket after network is initialized
    setTimeout(() => {
        connectWebSocket();
    }, 500);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);
    
    // Click anywhere to start audio context (browser autoplay policy)
    document.addEventListener('click', () => {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    }, { once: true });
    
    // Update connections when window resizes (will preserve mappings)
    window.addEventListener('resize', () => {
        setTimeout(() => {
            createConnections(); // Will skip creation if already initialized
            drawConnections();
        }, 100);
    });
    
    // Continuous animation loop for smooth visualization
    function animate() {
        animationTime += 0.016; // ~60fps
        
        // Update pulse progress for all connections (only animate if meaningful)
        connectionPulses.forEach((progress, key) => {
            const [i, j] = key.split('-').map(Number);
            const activationA = neurons[i]?.activation || 0;
            const activationB = neurons[j]?.activation || 0;
            const connectionStrength = Math.max(activationA, activationB);
            
            // Only animate pulse if connection is significantly active
            if (connectionStrength > 0.25 && activationA > 0.2 && activationB > 0.2) {
                const pulseSpeed = 0.04; // Fixed speed for active pulses
                const newProgress = progress + pulseSpeed;
                if (newProgress >= 1.0) {
                    // Remove pulse when it completes
                    connectionPulses.delete(key);
                } else {
                    connectionPulses.set(key, newProgress);
                }
            } else {
                // Remove pulse if connection is no longer active
                connectionPulses.delete(key);
            }
        });
        
        // Gradually decay weight change history
        weightChangeHistory.forEach((value, key) => {
            if (value > 0.001) {
                weightChangeHistory.set(key, value * 0.995);
            } else {
                weightChangeHistory.delete(key);
            }
        });
        
        // Clean up old inactive connections (older than 800ms)
        const currentTime = Date.now();
        activeInputConnections.forEach((time, noteIndex) => {
            if (currentTime - time > 800) {
                activeInputConnections.delete(noteIndex);
            }
        });
        activeOutputConnections.forEach((time, noteIndex) => {
            if (currentTime - time > 800) {
                activeOutputConnections.delete(noteIndex);
            }
        });
        
        drawNetwork();
        drawConnections();
        requestAnimationFrame(animate);
    }
    animate();
});
