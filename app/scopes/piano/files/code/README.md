# Neural Music Network 🎹🧠

An interactive musical neural network that learns to play piano through biologically-inspired Hebbian learning. Play notes on a virtual piano, watch a 100-neuron network process the input, and listen as it responds with its own musical output—all in real-time.

## Overview

This project demonstrates a **feed-forward neural network** that learns musical patterns through **Hebbian learning**—a simple, biologically plausible learning rule based on the principle "neurons that fire together, wire together." The network receives musical notes as input, processes them through 100 interconnected neurons, and outputs musical notes in response, creating a feedback loop where the network learns from its own behavior.

### Key Features

- **Real-time neural network visualization** - Watch 100 neurons activate and connect in a chaotic, organic blob
- **Interactive piano interface** - Play notes and observe the network's response
- **Hebbian learning** - Connections strengthen when neurons fire together
- **Biologically plausible mechanisms** - Inhibition, homeostasis, and adaptive thresholds
- **Live connection highlighting** - See input/output wires light up when engaged
- **Notes history** - Track the last 10 input/output note pairs

## How It Works

### Architecture

The system consists of three main components:

1. **Frontend (JavaScript/HTML5 Canvas)**
   - Interactive piano keyboard (12 notes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
   - Real-time neural network visualization
   - WebSocket client for bidirectional communication

2. **Backend (Python/FastAPI)**
   - FastAPI server serving static files and WebSocket endpoint
   - Neural network computation engine
   - Numba-accelerated NumPy operations for speed

3. **Neural Network (100 neurons)**
   - Fully connected feed-forward architecture
   - 12 input neurons (one per musical note)
   - 12 output neurons (mapped back to notes)
   - 76 hidden neurons

### Network Flow

```
Piano Key → Input Neuron → [100-Neuron Network] → Output Neuron → Piano Key
   (C)         (Left)        (Fully Connected)       (Right)        (G)
```

1. **Input**: When you press a piano key, it activates a corresponding input neuron on the left side of the network
2. **Propagation**: Activation spreads through the fully connected network
3. **Processing**: Biologically plausible mechanisms shape the activation pattern
4. **Output**: If an output neuron's activation exceeds its threshold, it triggers the corresponding note
5. **Learning**: Connections between active neurons are strengthened via Hebbian learning
6. **Feedback Loop**: Output notes can be fed back as input, creating a self-reinforcing learning cycle

## Learning Mechanisms

### 1. Hebbian Learning Rule

The core learning mechanism follows the classic Hebbian rule:

```
ΔW = η × (pre_activation × post_activation) - λ × W
```

Where:
- **ΔW**: Change in connection strength (weight)
- **η (eta)**: Learning rate (0.01) - controls how fast connections strengthen
- **pre_activation**: Activation of the source neuron
- **post_activation**: Activation of the target neuron
- **λ (lambda)**: Weight decay (0.001) - prevents runaway growth

**What this means**: When two neurons fire simultaneously, the connection between them strengthens. The more often they fire together, the stronger their connection becomes.

### 2. Weight Decay

To prevent connections from growing unbounded:
- All weights decay slightly each iteration: `W = W × (1 - λ)`
- Weights are clamped between -2.0 and +2.0

### 3. Weight Vector Normalization

Each neuron's incoming weights are normalized using L2 normalization:
- Prevents individual neurons from dominating
- Maintains biological plausibility (neurons have limited resources)
- Normalization rate: 0.01 (gradual adjustment)

## Biologically Plausible Features

To make the network more realistic and prevent pathological behaviors, we implemented several biologically-inspired mechanisms:

### 1. Signed Activations (tanh)

- Uses `tanh` activation function instead of ReLU
- Allows neurons to have **negative activations** (inhibition)
- Range: [-1, 1]
- Enables more nuanced signal processing

### 2. Inhibitory Pool (Global Competition)

Implements global inhibition to create competition between neurons:
```
inhibited_activation = activation - (mean_activation × inhibition_gain)
```

- **Inhibition gain**: 0.3
- Subtracts a fraction of the mean activation from all neurons
- Prevents all neurons from firing simultaneously
- Creates sparse, distributed representations

### 3. Homeostatic Thresholds (Adaptive Firing)

Each neuron has an **adaptive threshold** that adjusts based on its firing rate:

```
threshold = threshold × τ + (1 - τ) × (threshold + error × 0.1)
```

Where:
- **τ (tau)**: 0.95 - time constant for adaptation
- **error**: `firing_rate - target_firing_rate`
- **Target firing rate**: 0.1 (10% average activation)

**Effect**: 
- Neurons that fire too often increase their threshold (become harder to activate)
- Quiet neurons decrease their threshold (become easier to activate)
- Maintains balanced activity across the network

### 4. Unique Output Mapping

Each output neuron is mapped to a **unique note** to prevent multiple outputs from triggering the same note, encouraging specialization.

### 5. Activation Decay

After each processing step, activations decay:
```
activation = activation × decay_factor
```

- **Decay factor**: 0.9
- Prevents activations from persisting indefinitely
- Creates temporal dynamics

## Visualization

The visualization provides real-time insight into network dynamics:

### Connection Visualization

- **Base connections**: Faint white lines (opacity 0.03) showing the fully connected network
- **Active connections**: Brighten and thicken when neurons are active (blue/cyan)
- **Strengthened connections**: Green tint when weights increase significantly
- **Pulses**: Animated dots travel along active connections showing signal flow

### Neuron Visualization

- **Size**: Neurons grow based on activation (radius 2-6 pixels)
- **Color**: 
  - Input neurons: Blue tint
  - Output neurons: Orange tint
  - Hidden neurons: White
- **Glow**: Active neurons (>0.25 activation) emit a subtle glow
- **Thresholds**: Only significantly active neurons (>0.15) become visible

### Input/Output Wires

- **Input wires**: Blue curved lines from piano keys to input neurons
- **Output wires**: Orange curved lines from output neurons to piano keys
- **Highlighting**: Wires brighten, thicken, and glow when engaged
- **Fade-out**: Highlights fade smoothly over 800ms

## Setup and Usage

### Prerequisites

- Python 3.8+
- Modern web browser with WebSocket support

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python main.py
```

4. Open your browser and navigate to:
```
http://127.0.0.1:8000
```

### Usage

1. **Play notes**: Click piano keys or use keyboard (ASDF... for white keys, WETYU for black keys)
2. **Observe**: Watch the network activate and connections strengthen
3. **Listen**: Hear the network's responses (output delay adjustable via slider)
4. **Learn**: The network learns patterns as you play - repeated sequences strengthen related connections

### Controls

- **Output Delay Slider**: Adjust delay (0-1000ms) before playing output notes (default: 300ms)
- **Notes History Panel**: View the last 10 input/output note pairs in the top-right corner

## Technical Details

### Performance Optimizations

- **Numba JIT compilation**: All neural network operations are compiled to machine code using `@njit`
- **Vectorized operations**: Uses NumPy matrix operations (`@` operator) for efficient computation
- **Float64 precision**: Ensures numerical stability for Numba
- **Selective updates**: Only sends top 20 weight changes to frontend

### Network Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Neurons | 100 | Total network size |
| Input neurons | 12 | One per musical note |
| Output neurons | 12 | One per musical note |
| Learning rate (η) | 0.01 | Hebbian learning strength |
| Weight decay (λ) | 0.001 | Prevents runaway growth |
| Activation decay | 0.9 | Temporal decay factor |
| Inhibition gain | 0.3 | Global competition strength |
| Homeostatic τ | 0.95 | Threshold adaptation rate |
| Target firing rate | 0.1 | Desired average activation |

### WebSocket Protocol

**Client → Server:**
- `init`: Initialize network with connection mappings
- `note_input`: Send a note index (0-11) to process
- `ping`: Keep-alive message

**Server → Client:**
- `initialized`: Network ready confirmation
- `update`: Activation values, triggered notes, weight changes
- `pong`: Keep-alive response

## How the Network Learns to Play Piano

### Initial State

- All connections start with small random weights (±0.2)
- Output neurons have adaptive thresholds that start at 0.5
- The network has no musical "knowledge"

### Learning Process

1. **Input Injection**: When you play a note (e.g., C), the corresponding input neuron receives strong activation (1.0)

2. **Signal Propagation**: 
   - Activation spreads through the network via weighted connections
   - Strong connections amplify signals; weak connections dampen them
   - Inhibitory pool prevents all neurons from firing

3. **Pattern Formation**:
   - If certain neurons consistently fire together in response to specific notes, their connections strengthen
   - Over time, the network develops pathways that respond to musical patterns

4. **Output Generation**:
   - When output neurons exceed their adaptive thresholds, they trigger notes
   - Initially random, but as connections strengthen, patterns emerge

5. **Feedback Loop**:
   - Output notes can be fed back as input
   - The network learns from its own responses
   - Creates self-reinforcing musical motifs

### What the Network Learns

- **Associations**: Notes that are played together become associated
- **Sequences**: Temporal patterns in your playing create sequential pathways
- **Harmonies**: Notes that sound good together (and are played together) strengthen connections
- **Rhythms**: Repetitive patterns create stable pathways

### Limitations

- **No explicit memory**: The network doesn't remember long sequences (short-term decay)
- **Local learning**: Only learns correlations, not complex musical rules
- **Stochastic behavior**: Output is probabilistic based on activation patterns
- **Threshold adaptation**: Over time, thresholds adjust, changing the network's sensitivity

## Future Enhancements

Potential improvements:

- **Longer sequences**: Add recurrent connections for temporal memory
- **Multiple layers**: Deepen the network for more complex patterns
- **Musical constraints**: Add rules for chord progressions or scales
- **Multi-user**: Multiple pianos feeding into the same network
- **Export patterns**: Save and load learned weight matrices
- **Analysis tools**: Visualize learned patterns and statistics

## License

This project is open source and available for educational and research purposes.

## Acknowledgments

Inspired by:
- Hebbian learning theory (Donald Hebb, 1949)
- Biological neural networks and homeostatic plasticity
- Interactive AI art and generative music systems

---

**Enjoy watching your neural network learn to play piano!** 🎹✨

