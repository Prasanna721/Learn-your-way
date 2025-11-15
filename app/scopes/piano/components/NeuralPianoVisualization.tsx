'use client';

import { useEffect, useRef, useState } from 'react';
import CustomSlider from '@/components/CustomSlider';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];
const NUM_NEURONS = 100;

const KEYBOARD_MAP: Record<string, string> = {
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

interface Neuron {
  x: number;
  y: number;
  activation: number;
  index: number;
  layer: 'input' | 'hidden' | 'output';
  note?: string;
}

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  color: string;
}

interface NoteEntry {
  input: string;
  outputs: string[];
  timestamp: number;
}

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

export default function NeuralPianoVisualization({ backendUrl }: { backendUrl: string }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [outputDelay, setOutputDelay] = useState(300);
  const [notesHistory, setNotesHistory] = useState<NoteEntry[]>([]);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isPlayingTune, setIsPlayingTune] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);
  const connectionsCanvasRef = useRef<HTMLCanvasElement>(null);

  const neuronsRef = useRef<Neuron[]>([]);
  const inputNeuronMapRef = useRef<Map<number, number>>(new Map());
  const outputNeuronMapRef = useRef<Map<number, number>>(new Map());
  const inputNeuronsRef = useRef<number[]>([]);
  const outputNeuronsRef = useRef<number[]>([]);
  const weightChangeHistoryRef = useRef<Map<string, number>>(new Map());
  const connectionPulsesRef = useRef<Map<string, number>>(new Map());
  const activeInputConnectionsRef = useRef<Map<number, number>>(new Map());
  const activeOutputConnectionsRef = useRef<Map<number, number>>(new Map());
  const currentInputNoteRef = useRef<number | null>(null);
  const networkConfigRef = useRef<any>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize audio context
  const initAudio = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new AudioContext();
      } catch (error) {
        console.error('Web Audio API not supported:', error);
      }
    }
  };

  // Play a note
  const playNote = (note: string) => {
    if (!audioContextRef.current) {
      initAudio();
    }

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const frequency = getFrequency(note);
    const oscillator = audioContextRef.current!.createOscillator();
    const gainNode = audioContextRef.current!.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    const now = audioContextRef.current!.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current!.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
  };

  const getFrequency = (note: string) => {
    const noteIndex = NOTES.indexOf(note);
    const semitonesFromA = noteIndex - 9;
    return 440 * Math.pow(2, semitonesFromA / 12);
  };

  // Send note to network
  const sendNoteToNetwork = (noteIndex: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && networkConfigRef.current) {
      currentInputNoteRef.current = noteIndex;
      activeInputConnectionsRef.current.set(noteIndex, Date.now());
      wsRef.current.send(JSON.stringify({
        type: 'note_input',
        note_index: noteIndex
      }));
    }
  };

  // Handle key press
  const handleNotePress = (note: string) => {
    const noteIndex = NOTES.indexOf(note);
    if (noteIndex >= 0) {
      playNote(note);
      sendNoteToNetwork(noteIndex);
      setActiveKeys(prev => new Set(prev).add(note));
    }
  };

  const handleNoteRelease = (note: string) => {
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };

  // Play tune directly (without network)
  const playTuneDirectly = () => {
    if (isPlayingTune) return;
    setIsPlayingTune(true);

    let delay = 0;
    TWINKLE_TUNE.forEach(({ note, duration }) => {
      setTimeout(() => {
        playNote(note);
        setActiveKeys(prev => new Set(prev).add(note));
        setTimeout(() => {
          setActiveKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(note);
            return newSet;
          });
        }, duration - 50);
      }, delay);
      delay += duration;
    });

    setTimeout(() => {
      setIsPlayingTune(false);
    }, delay);
  };

  // Play tune through network (only play network outputs)
  const playTuneThroughNetwork = () => {
    if (isPlayingTune || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    setIsPlayingTune(true);

    let tuneIndex = 0;
    const sendNextNote = () => {
      if (tuneIndex >= TWINKLE_TUNE.length) {
        setTimeout(() => {
          setIsPlayingTune(false);
        }, 1500);
        return;
      }

      const tuneNote = TWINKLE_TUNE[tuneIndex];
      const noteIndex = NOTES.indexOf(tuneNote.note);

      if (noteIndex >= 0) {
        sendNoteToNetwork(noteIndex);

        setTimeout(() => {
          tuneIndex++;
          sendNextNote();
        }, tuneNote.duration);
      } else {
        tuneIndex++;
        sendNextNote();
      }
    };

    sendNextNote();
  };

  // Initialize neurons with organized layers
  const createNeurons = () => {
    const canvas = networkCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const neurons: Neuron[] = [];

    const padding = 80;
    const inputX = padding;
    const outputX = rect.width - padding;
    const hiddenX = rect.width / 2;

    // Create input neurons (left side)
    const inputCount = NOTES.length;
    const inputSpacing = (rect.height - 2 * padding) / (inputCount - 1);
    for (let i = 0; i < inputCount; i++) {
      neurons.push({
        x: inputX,
        y: padding + i * inputSpacing,
        activation: 0,
        index: i,
        layer: 'input',
        note: NOTES[i]
      });
    }

    // Create hidden neurons (middle, scattered)
    const hiddenCount = NUM_NEURONS - (inputCount * 2);
    const hiddenWidth = rect.width * 0.4;
    const hiddenHeight = rect.height - 2 * padding;
    for (let i = 0; i < hiddenCount; i++) {
      neurons.push({
        x: hiddenX + (Math.random() - 0.5) * hiddenWidth,
        y: padding + Math.random() * hiddenHeight,
        activation: 0,
        index: inputCount + i,
        layer: 'hidden'
      });
    }

    // Create output neurons (right side)
    const outputCount = NOTES.length;
    const outputSpacing = (rect.height - 2 * padding) / (outputCount - 1);
    for (let i = 0; i < outputCount; i++) {
      neurons.push({
        x: outputX,
        y: padding + i * outputSpacing,
        activation: 0,
        index: inputCount + hiddenCount + i,
        layer: 'output',
        note: NOTES[i]
      });
    }

    neuronsRef.current = neurons;
  };

  // Create connections
  const createConnections = () => {
    if (!networkCanvasRef.current) return;

    const inputNeurons = neuronsRef.current.filter(n => n.layer === 'input');
    const outputNeurons = neuronsRef.current.filter(n => n.layer === 'output');

    // Map input neurons to notes (direct mapping)
    inputNeurons.forEach((neuron, idx) => {
      inputNeuronMapRef.current.set(idx, neuron.index);
      inputNeuronsRef.current.push(neuron.index);
    });

    // Map output neurons to notes (direct mapping)
    outputNeurons.forEach((neuron, idx) => {
      outputNeuronMapRef.current.set(neuron.index, idx);
      outputNeuronsRef.current.push(neuron.index);
    });

    // Store config for backend
    networkConfigRef.current = {
      num_neurons: NUM_NEURONS,
      num_notes: NOTES.length,
      input_neuron_indices: Array.from(inputNeuronMapRef.current.values()),
      output_neuron_indices: Array.from(outputNeuronMapRef.current.keys()),
      output_to_note: Array.from(outputNeuronMapRef.current.entries()).map(([neuronIdx, noteIdx]) => [neuronIdx, noteIdx])
    };
  };

  // Draw network
  const drawNetwork = () => {
    const canvas = networkCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw connections
    const neurons = neuronsRef.current;
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const neuronA = neurons[i];
        const neuronB = neurons[j];
        const activationA = neuronA.activation || 0;
        const activationB = neuronB.activation || 0;

        const key1 = `${i}-${j}`;
        const key2 = `${j}-${i}`;
        const weightChange = weightChangeHistoryRef.current.get(key1) || weightChangeHistoryRef.current.get(key2) || 0;
        const connectionStrength = Math.max(activationA, activationB);

        let baseOpacity = 0.15;
        let lineWidth = 0.5;
        let strokeColor = 'rgba(100, 100, 120, ';

        if (connectionStrength > 0.25) {
          const strengthFactor = Math.min((connectionStrength - 0.25) / 0.75, 1.0);
          baseOpacity = 0.2 + strengthFactor * 0.3;
          lineWidth = 0.4 + strengthFactor * 1.5;
          const blueComponent = Math.min(200, 80 + strengthFactor * 120);
          strokeColor = `rgba(80, ${blueComponent}, 220, `;
        }

        if (weightChange > 0.02) {
          const strengthIntensity = Math.min((weightChange - 0.02) / 0.18, 1.0);
          baseOpacity = Math.max(baseOpacity, 0.15 + strengthIntensity * 0.2);
          lineWidth = Math.max(lineWidth, 0.8 + strengthIntensity * 1.2);
          strokeColor = `rgba(80, ${Math.min(220, 120 + strengthIntensity * 100)}, 120, `;
        }

        ctx.strokeStyle = strokeColor + baseOpacity + ')';
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(neuronA.x, neuronA.y);
        ctx.lineTo(neuronB.x, neuronB.y);
        ctx.stroke();
      }
    }

    // Draw neurons
    neurons.forEach(neuron => {
      const activation = neuron.activation || 0;
      let baseColor = { r: 255, g: 255, b: 255 };

      if (neuron.layer === 'input') {
        baseColor = { r: 100, g: 200, b: 255 };
      } else if (neuron.layer === 'output') {
        baseColor = { r: 255, g: 200, b: 100 };
      }

      const brightness = activation > 0.15 ? 0.4 + Math.min((activation - 0.15) * 0.8, 0.4) : 0.35;
      const fillColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${brightness})`;

      const radius = activation > 0.15 ? 4 + (activation - 0.15) * 6 : 4;

      // Draw pulse effect for high activation
      if (activation > 0.3) {
        const pulseRadius = radius + 4 + Math.sin(Date.now() * 0.005) * 3;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${(activation - 0.3) * 0.2})`;
        ctx.fill();
      }

      // Draw neuron
      ctx.beginPath();
      ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Draw glow for activated neurons
      if (activation > 0.25) {
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${(activation - 0.25) * 0.3})`;
        ctx.fill();
      }

      // Draw note labels for input and output neurons
      if (neuron.note) {
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = neuron.layer === 'input' ? 'right' : 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = activation > 0.4 ? `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.9)` : 'rgba(50, 50, 70, 0.7)';
        const labelX = neuron.layer === 'input' ? neuron.x - radius - 8 : neuron.x + radius + 8;
        ctx.fillText(neuron.note, labelX, neuron.y);
      }
    });

    // Draw particles
    particlesRef.current.forEach(particle => {
      particle.progress += particle.speed;
      particle.x = particle.x + (particle.targetX - particle.x) * particle.speed;
      particle.y = particle.y + (particle.targetY - particle.y) * particle.speed;

      const size = Math.max(0.5, 3 * (1 - particle.progress));
      const alpha = Math.max(0, Math.min(1, 1 - particle.progress));

      // Validate particle position and size before drawing
      if (isFinite(particle.x) && isFinite(particle.y) && isFinite(size) && size > 0) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace('1)', `${alpha})`);
        ctx.fill();
      }
    });

    // Remove completed particles
    particlesRef.current = particlesRef.current.filter(p => p.progress < 1);
  };

  // WebSocket connection
  useEffect(() => {
    if (!backendUrl) return;

    const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws';
    setConnectionStatus('Connecting...');

    // Prevent creating duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('Connected');

      // Initialize network
      if (networkConfigRef.current) {
        ws.send(JSON.stringify({
          type: 'init',
          config: networkConfigRef.current
        }));
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'initialized') {
        console.log('Network initialized');
      } else if (message.type === 'update') {
        const { activations, triggered_notes, weight_changes } = message;

        // Update neuron activations
        activations.forEach((activation: number, neuronIndex: number) => {
          if (neuronsRef.current[neuronIndex]) {
            const current = neuronsRef.current[neuronIndex].activation || 0;
            const newActivation = current * 0.5 + activation * 0.5;
            neuronsRef.current[neuronIndex].activation = newActivation;

            // Create particles for highly activated neurons
            if (newActivation > 0.5 && activation > current) {
              const neuron = neuronsRef.current[neuronIndex];
              // Find connected neurons and create particles
              neuronsRef.current.forEach((targetNeuron, targetIdx) => {
                if (targetIdx !== neuronIndex && Math.random() > 0.7) {
                  particlesRef.current.push({
                    x: neuron.x,
                    y: neuron.y,
                    targetX: targetNeuron.x,
                    targetY: targetNeuron.y,
                    progress: 0,
                    speed: 0.02 + Math.random() * 0.03,
                    color: neuron.layer === 'input' ? 'rgba(100, 200, 255, 1)' :
                      neuron.layer === 'output' ? 'rgba(255, 200, 100, 1)' :
                        'rgba(200, 200, 220, 1)'
                  });
                }
              });
            }
          }
        });

        // Update weight changes
        if (weight_changes) {
          weight_changes.forEach(([i, j, delta]: [number, number, number]) => {
            const key = `${i}-${j}`;
            const current = weightChangeHistoryRef.current.get(key) || 0;
            weightChangeHistoryRef.current.set(key, current + delta);
          });
        }

        // Update notes history
        if (currentInputNoteRef.current !== null) {
          const inputNote = NOTES[currentInputNoteRef.current];
          const outputNotes = triggered_notes?.length > 0 ? triggered_notes.map((idx: number) => NOTES[idx]) : [];

          setNotesHistory(prev => {
            const newHistory = [{
              input: inputNote,
              outputs: outputNotes,
              timestamp: Date.now()
            }, ...prev];
            return newHistory.slice(0, 10);
          });

          currentInputNoteRef.current = null;
        }

        // Play triggered notes
        if (triggered_notes && triggered_notes.length > 0) {
          triggered_notes.forEach((noteIndex: number) => {
            const note = NOTES[noteIndex];
            if (note) {
              activeOutputConnectionsRef.current.set(noteIndex, Date.now());
              if (outputDelay > 0) {
                setTimeout(() => playNote(note), outputDelay);
              } else {
                playNote(note);
              }
            }
          });
        }
      }
    };

    ws.onerror = () => {
      // WebSocket error events don't contain useful info
      console.log('WebSocket error - connection issue');
      setConnectionStatus('Connection error');
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    };

    return () => {
      // Only close if we're actually unmounting or backendUrl changed
      // Check if this is still the active WebSocket
      if (wsRef.current === ws && ws.readyState !== WebSocket.CLOSED) {
        console.log('Cleaning up WebSocket');
        ws.close();
        wsRef.current = null;
      }
    };
  }, [backendUrl]); // Dependencies for WebSocket connection

  // Initialize visualization
  useEffect(() => {
    createNeurons();
    createConnections();

    const handleResize = () => {
      const canvas = networkCanvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        createNeurons();
        drawNetwork();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      drawNetwork();

      // Decay weight changes
      weightChangeHistoryRef.current.forEach((value, key) => {
        if (value > 0.001) {
          weightChangeHistoryRef.current.set(key, value * 0.995);
        } else {
          weightChangeHistoryRef.current.delete(key);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const note = KEYBOARD_MAP[e.key.toLowerCase()];
      if (note && !activeKeys.has(note)) {
        handleNotePress(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEYBOARD_MAP[e.key.toLowerCase()];
      if (note) {
        handleNoteRelease(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys]);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[var(--brand-coral-lightest)] to-[var(--brand-sand)] p-6">
      {/* Left sidebar - Status, Controls, and Notes Timeline */}
      <div className="absolute top-4 left-4 z-50 space-y-4 max-w-xs">
        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md w-fit">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-black text-sm font-semibold">{connectionStatus}</span>
        </div>

        {/* Output Delay Control */}
        <div className="w-64">
          <CustomSlider
            value={outputDelay}
            min={0}
            max={1000}
            step={10}
            onChange={setOutputDelay}
            label={`Output Delay: ${outputDelay}ms`}
          />
        </div>

        {/* Play Buttons */}
        <div className="space-y-2">
          <button
            onClick={playTuneDirectly}
            disabled={isPlayingTune}
            className="w-full px-6 py-2.5 bg-[var(--brand-coral-light)] hover:bg-[var(--brand-coral)] disabled:bg-[var(--brand-coral-lighter)] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isPlayingTune ? '🎵 Playing...' : '🎹 Play Tune Directly'}
          </button>
          <button
            onClick={playTuneThroughNetwork}
            disabled={isPlayingTune || !isConnected}
            className="w-full px-6 py-2.5 bg-[var(--brand-coral-dark)] hover:bg-[var(--brand-coral-darkest)] disabled:bg-[var(--brand-coral-lighter)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isPlayingTune ? '🎵 Playing...' : '🧠 Play Through Network'}
          </button>
        </div>

        {/* Recent Notes Timeline */}
        <div>
          <h3 className="text-black text-sm font-semibold mb-2">Recent Notes</h3>
          <div className="space-y-1.5">
            {notesHistory.map((entry, idx) => (
              <div key={idx} className="text-sm flex items-center gap-2 font-mono">
                <span className="text-[var(--brand-coral-dark)] font-bold">{entry.input}</span>
                <span className="text-black/40">→</span>
                <span className="text-[var(--brand-coral)] font-medium">
                  {entry.outputs.length > 0 ? entry.outputs.join(', ') : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-full pt-20 pb-10 px-4">
        {/* Piano */}
        <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-3xl p-8">
          <div className="flex gap-1 relative justify-center">
            {NOTES.map((note) => {
              const isWhiteKey = WHITE_KEYS.includes(note);
              const isActive = activeKeys.has(note);

              return (
                <div
                  key={note}
                  onMouseDown={() => handleNotePress(note)}
                  onMouseUp={() => handleNoteRelease(note)}
                  onMouseLeave={() => handleNoteRelease(note)}
                  onTouchStart={(e) => { e.preventDefault(); handleNotePress(note); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleNoteRelease(note); }}
                  className={`
                    relative cursor-pointer transition-all select-none
                    ${isWhiteKey
                      ? `w-16 h-32 bg-gradient-to-b from-white to-gray-100 border border-black/10 rounded-b
                         ${isActive ? 'translate-y-0.5 from-gray-200 to-gray-300' : 'hover:-translate-y-0.5'}`
                      : `w-10 h-20 bg-gradient-to-b from-gray-900 to-black border border-black/50 rounded-b -mx-5 z-10
                         ${isActive ? 'translate-y-0.5 from-gray-700 to-gray-800' : 'hover:-translate-y-0.5'}`
                    }
                  `}
                >
                  <span className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium
                    ${isWhiteKey ? 'text-gray-600' : 'text-gray-400'}`}>
                    {note}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Network visualization */}
        <div className="relative w-full max-w-4xl h-96">
          <canvas
            ref={networkCanvasRef}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
