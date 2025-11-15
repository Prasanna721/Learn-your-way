"""
Neural Network with Hebbian Learning - Numba Accelerated
Simple feed-forward network optimized for speed
"""
import numpy as np
from numba import njit
from termcolor import colored

# Network Configuration
NUM_NEURONS = 100
NUM_NOTES = 12
ETA = np.float64(0.01)  # Learning rate for Hebbian rule
LAMBDA_DECAY = np.float64(0.001)  # Weight decay to prevent runaway growth
MAX_WEIGHT = np.float64(2.0)  # Maximum weight value
MIN_WEIGHT = np.float64(-2.0)  # Minimum weight value
ACTIVATION_THRESHOLD = np.float64(0.5)  # Base threshold for output neuron activation
ACTIVATION_DECAY = np.float64(0.9)  # Decay factor for activations over time
INHIBITION_GAIN = np.float64(0.3)  # Strength of global inhibition
WEIGHT_NORMALIZATION_RATE = np.float64(0.01)  # Rate for weight vector normalization
HOMEOSTATIC_TAU = np.float64(0.95)  # Time constant for homeostatic threshold adaptation
TARGET_FIRING_RATE = np.float64(0.1)  # Target average firing rate per neuron

# Global state (will be initialized)
WEIGHTS = None
ACTIVATIONS = None
NOTE_TO_NEURON = None  # Array mapping note_index -> neuron_index
NEURON_TO_NOTE = None  # Array mapping neuron_index -> note_index (-1 if not output)
NEURON_THRESHOLDS = None  # Adaptive thresholds for each neuron (homeostasis)


@njit
def propagate_activations(weights, activations):
    """
    Fast forward propagation through fully connected network.
    Uses tanh activation to keep signed values (biologically plausible).
    """
    new_activations = weights @ activations
    # Use tanh to keep signed activations (allows inhibition)
    new_activations = np.tanh(new_activations)
    return new_activations


@njit
def apply_inhibitory_pool(activations, inhibition_gain):
    """
    Apply global inhibition (inhibitory pool) to create competition.
    Subtracts a fraction of mean activation from all neurons.
    """
    mean_activation = np.mean(activations)
    inhibition = mean_activation * inhibition_gain
    # Subtract inhibition but keep signed values
    inhibited = activations - inhibition
    # Clip to reasonable range but keep negatives (use manual clipping for numba)
    result = np.empty_like(inhibited)
    for i in range(len(inhibited)):
        if inhibited[i] < -1.0:
            result[i] = -1.0
        elif inhibited[i] > 1.0:
            result[i] = 1.0
        else:
            result[i] = inhibited[i]
    return result


@njit
def apply_hebbian_learning(weights, pre_activations, post_activations, eta, lambda_decay):
    """
    Hebbian learning rule: ΔW = η * (pre * post^T) - λ * W
    Also applies weight decay and clamping.
    """
    # Outer product for Hebbian update
    delta = eta * np.outer(post_activations, pre_activations)
    
    # Apply weight decay
    weights *= (1.0 - lambda_decay)
    
    # Add Hebbian update
    weights += delta
    
    # Clamp weights to prevent runaway
    weights = np.clip(weights, MIN_WEIGHT, MAX_WEIGHT)
    
    return weights


@njit
def normalize_weight_vectors(weights, normalization_rate):
    """
    Normalize weight vectors (L2 normalization) to prevent runaway growth.
    Implements weight vector normalization for biological plausibility.
    """
    num_neurons = weights.shape[0]
    for i in range(num_neurons):
        # Calculate L2 norm of weight vector
        norm = np.sqrt(np.sum(weights[i, :] ** 2))
        if norm > 1e-10:  # Avoid division by zero
            # Slowly normalize toward unit length
            target_norm = 1.0
            current_norm_factor = 1.0 + normalization_rate * (target_norm - norm)
            weights[i, :] *= current_norm_factor
    
    return weights


@njit
def update_homeostatic_thresholds(thresholds, activations, tau, target_rate):
    """
    Update adaptive thresholds based on recent firing rates (homeostasis).
    Neurons that fire too much increase threshold, quiet neurons decrease it.
    """
    # Update thresholds based on how much each neuron fired
    for i in range(len(thresholds)):
        # Current firing rate (positive activation)
        firing_rate = max(0.0, activations[i])
        # Adaptive threshold: move toward target firing rate
        error = firing_rate - target_rate
        thresholds[i] = thresholds[i] * tau + (1.0 - tau) * (thresholds[i] + error * 0.1)
        # Keep thresholds in reasonable range (use min/max instead of np.clip for numba)
        if thresholds[i] < 0.0:
            thresholds[i] = 0.0
        elif thresholds[i] > 1.0:
            thresholds[i] = 1.0
    
    return thresholds


@njit
def apply_homeostatic_thresholds(activations, thresholds):
    """
    Apply adaptive thresholds to activations (subtract threshold before checking).
    Returns thresholded activations.
    """
    thresholded = activations - thresholds
    return thresholded


@njit
def decay_activations(activations, decay_factor):
    """Apply decay to activations over time."""
    return activations * decay_factor


@njit
def get_triggered_notes(activations, neuron_to_note, thresholds):
    """
    Check which output neurons are activated above their adaptive threshold.
    Returns array of note indices that should be played.
    Uses homeostatic thresholds for each neuron.
    """
    triggered = []
    for i in range(len(activations)):
        # Use adaptive threshold instead of fixed threshold
        if activations[i] > thresholds[i] and neuron_to_note[i] >= 0:
            triggered.append(neuron_to_note[i])
    return np.array(triggered, dtype=np.int32)


def initialize_network(note_to_neuron_indices, neuron_to_note_mapping):
    """
    Initialize the neural network with connection mappings from frontend.
    
    Args:
        note_to_neuron_indices: List of neuron indices that receive input (one per note)
        neuron_to_note_mapping: List of [neuron_index, note_index] pairs for outputs
    """
    global WEIGHTS, ACTIVATIONS, NOTE_TO_NEURON, NEURON_TO_NOTE, NEURON_THRESHOLDS
    
    # Initialize weights with small random values (smaller for signed activations)
    WEIGHTS = np.random.randn(NUM_NEURONS, NUM_NEURONS).astype(np.float64) * 0.2
    # Set diagonal to zero (neurons don't connect to themselves)
    np.fill_diagonal(WEIGHTS, 0.0)
    
    # Initialize activations
    ACTIVATIONS = np.zeros(NUM_NEURONS, dtype=np.float64)
    
    # Initialize homeostatic thresholds (start at base threshold)
    NEURON_THRESHOLDS = np.full(NUM_NEURONS, ACTIVATION_THRESHOLD, dtype=np.float64)
    
    # Store mappings
    NOTE_TO_NEURON = np.array(note_to_neuron_indices, dtype=np.int32)
    
    # Create neuron_to_note array (-1 means not an output neuron)
    NEURON_TO_NOTE = np.full(NUM_NEURONS, -1, dtype=np.int32)
    for neuron_idx, note_idx in neuron_to_note_mapping:
        NEURON_TO_NOTE[neuron_idx] = note_idx
    
    print(colored(f"Network initialized: {NUM_NEURONS} neurons, {NUM_NOTES} notes", "green"))
    print(colored(f"Input neurons: {len(NOTE_TO_NEURON)}", "cyan"))
    print(colored(f"Output neurons: {np.sum(NEURON_TO_NOTE >= 0)}", "cyan"))
    print(colored("Biologically plausible features: signed activations, inhibition, normalization, homeostasis", "cyan"))


def warmup_numba_functions():
    """
    Pre-compile all Numba functions to avoid JIT delay on first use.
    This should be called once during server startup.
    """
    print(colored("Warming up Numba functions (this may take 30-40 seconds)...", "yellow"))
    
    # Create dummy arrays with correct shapes and types
    dummy_weights = np.random.randn(NUM_NEURONS, NUM_NEURONS).astype(np.float64) * 0.1
    np.fill_diagonal(dummy_weights, 0.0)
    dummy_activations = np.random.randn(NUM_NEURONS).astype(np.float64) * 0.1
    dummy_thresholds = np.full(NUM_NEURONS, ACTIVATION_THRESHOLD, dtype=np.float64)
    dummy_neuron_to_note = np.full(NUM_NEURONS, -1, dtype=np.int32)
    dummy_neuron_to_note[0] = 0  # Set one output neuron
    
    # Warm up all functions
    try:
        _ = propagate_activations(dummy_weights, dummy_activations)
        _ = apply_inhibitory_pool(dummy_activations, INHIBITION_GAIN)
        _ = apply_hebbian_learning(dummy_weights, dummy_activations, dummy_activations, ETA, LAMBDA_DECAY)
        _ = normalize_weight_vectors(dummy_weights.copy(), WEIGHT_NORMALIZATION_RATE)
        _ = update_homeostatic_thresholds(dummy_thresholds.copy(), dummy_activations, HOMEOSTATIC_TAU, TARGET_FIRING_RATE)
        _ = apply_homeostatic_thresholds(dummy_activations, dummy_thresholds)
        _ = get_triggered_notes(dummy_activations, dummy_neuron_to_note, dummy_thresholds)
        _ = decay_activations(dummy_activations, ACTIVATION_DECAY)
        
        print(colored("✓ Numba functions compiled successfully!", "green"))
        return True
    except Exception as e:
        print(colored(f"⚠ Numba warmup warning: {e}", "yellow"))
        return False


def reset_network():
    """
    Reset the neural network to initial state (preserves connection mappings).
    Reinitializes weights, activations, and thresholds.
    """
    global WEIGHTS, ACTIVATIONS, NEURON_THRESHOLDS
    
    if WEIGHTS is None or NOTE_TO_NEURON is None:
        raise RuntimeError("Network not initialized. Cannot reset.")
    
    # Reinitialize weights with small random values
    WEIGHTS = np.random.randn(NUM_NEURONS, NUM_NEURONS).astype(np.float64) * 0.2
    # Set diagonal to zero (neurons don't connect to themselves)
    np.fill_diagonal(WEIGHTS, 0.0)
    
    # Reset activations
    ACTIVATIONS = np.zeros(NUM_NEURONS, dtype=np.float64)
    
    # Reset homeostatic thresholds to base threshold
    NEURON_THRESHOLDS = np.full(NUM_NEURONS, ACTIVATION_THRESHOLD, dtype=np.float64)
    
    print(colored("Network reset to initial state", "yellow"))


def process_note_input(note_index):
    """
    Process a note input through the network with biologically plausible mechanisms.
    
    Args:
        note_index: Index of the note that was played (0-11)
    
    Returns:
        dict with:
            - activations: array of 100 activation values
            - triggered_notes: array of note indices to play
            - weight_changes: list of (i, j, delta) for visualization
    """
    global WEIGHTS, ACTIVATIONS, NEURON_THRESHOLDS
    
    if WEIGHTS is None or NOTE_TO_NEURON is None:
        raise RuntimeError("Network not initialized. Send connection config first.")
    
    # Store previous activations and weights for Hebbian learning
    pre_activations = ACTIVATIONS.copy()
    pre_weights = WEIGHTS.copy()
    
    # Inject input: activate the corresponding input neuron
    input_neuron_idx = NOTE_TO_NEURON[note_index]
    ACTIVATIONS[input_neuron_idx] = 1.0
    
    # Propagate through network (with signed activations via tanh)
    ACTIVATIONS = propagate_activations(WEIGHTS, ACTIVATIONS)
    
    # Apply inhibitory pool (global competition)
    ACTIVATIONS = apply_inhibitory_pool(ACTIVATIONS, INHIBITION_GAIN)
    
    # Apply homeostatic thresholds (adaptive firing thresholds)
    thresholded_activations = apply_homeostatic_thresholds(ACTIVATIONS, NEURON_THRESHOLDS)
    
    # Check for triggered output notes using adaptive thresholds on raw activations
    triggered_notes = get_triggered_notes(ACTIVATIONS, NEURON_TO_NOTE, NEURON_THRESHOLDS)
    
    # Store activations for sending (before decay, but after thresholding for visualization)
    # Convert to 0-1 range for visualization (tanh outputs -1 to 1)
    activations_to_send = ((ACTIVATIONS + 1.0) / 2.0).copy()
    
    # Update homeostatic thresholds based on current firing rates
    NEURON_THRESHOLDS = update_homeostatic_thresholds(
        NEURON_THRESHOLDS, activations_to_send, HOMEOSTATIC_TAU, TARGET_FIRING_RATE
    )
    
    # Apply Hebbian learning (using pre and post activations)
    WEIGHTS = apply_hebbian_learning(WEIGHTS, pre_activations, ACTIVATIONS, ETA, LAMBDA_DECAY)
    
    # Normalize weight vectors (L2 normalization)
    WEIGHTS = normalize_weight_vectors(WEIGHTS, WEIGHT_NORMALIZATION_RATE)
    
    # Calculate weight changes for visualization
    weight_deltas = WEIGHTS - pre_weights
    
    # Apply decay to all activations (for next iteration)
    ACTIVATIONS = decay_activations(ACTIVATIONS, ACTIVATION_DECAY)
    
    # For visualization: find significant weight changes (both positive and negative)
    weight_changes = []
    threshold = 0.001
    for i in range(NUM_NEURONS):
        for j in range(NUM_NEURONS):
            if i != j:  # Skip self-connections
                change = weight_deltas[i, j]
                if abs(change) > threshold:
                    weight_changes.append((int(i), int(j), float(change)))
    
    # Sort by magnitude and take top changes
    weight_changes.sort(key=lambda x: abs(x[2]), reverse=True)
    
    return {
        'activations': activations_to_send.tolist(),  # Send normalized activations (0-1 range)
        'triggered_notes': triggered_notes.tolist(),
        'weight_changes': weight_changes[:20]  # Limit to top 20 for performance
    }


def get_current_state():
    """Get current network state for visualization."""
    if ACTIVATIONS is None:
        return None
    
    return {
        'activations': ACTIVATIONS.tolist()
    }

