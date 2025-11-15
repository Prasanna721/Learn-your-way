from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import json
from termcolor import colored
import neural_network as nn

HOST = "127.0.0.1"
PORT = 8000

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(colored("Client connected via WebSocket", "green"))
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            msg_type = message.get('type')
            
            if msg_type == 'init':
                # Initialize network with connection mappings from frontend
                config = message.get('config', {})
                note_to_neuron = config.get('input_neuron_indices', [])
                neuron_to_note_pairs = config.get('output_to_note', [])
                
                nn.initialize_network(note_to_neuron, neuron_to_note_pairs)
                
                # Send confirmation
                await websocket.send_json({
                    'type': 'initialized',
                    'message': 'Network ready'
                })
                print(colored("Network initialized from frontend config", "cyan"))
            
            elif msg_type == 'note_input':
                # Process a note input
                note_index = message.get('note_index')
                if note_index is not None:
                    result = nn.process_note_input(note_index)
                    
                    # Send back activations and triggered notes
                    await websocket.send_json({
                        'type': 'update',
                        'activations': result['activations'],
                        'triggered_notes': result['triggered_notes'],
                        'weight_changes': result['weight_changes']
                    })
                    
                    if len(result['triggered_notes']) > 0:
                        print(colored(f"Note {note_index} triggered outputs: {result['triggered_notes']}", "yellow"))
            
            elif msg_type == 'reset':
                # Reset network to initial state
                try:
                    nn.reset_network()
                    await websocket.send_json({
                        'type': 'reset_complete',
                        'message': 'Network reset successfully'
                    })
                    print(colored("Network reset requested by client", "yellow"))
                except Exception as e:
                    await websocket.send_json({
                        'type': 'reset_error',
                        'message': str(e)
                    })
                    print(colored(f"Reset error: {e}", "red"))
            
            elif msg_type == 'ping':
                # Keep-alive ping
                await websocket.send_json({'type': 'pong'})
    
    except WebSocketDisconnect:
        print(colored("Client disconnected", "yellow"))
    except Exception as e:
        print(colored(f"WebSocket error: {e}", "red"))
        await websocket.close()


if __name__ == "__main__":
    print(colored(f"Starting FastAPI server at http://{HOST}:{PORT}", "green"))
    print(colored("Press CTRL+C to stop the server", "yellow"))
    print(colored(f"WebSocket endpoint: ws://{HOST}:{PORT}/ws", "cyan"))
    
    # Warm up Numba functions before starting server
    print(colored("\n" + "="*60, "cyan"))
    nn.warmup_numba_functions()
    print(colored("="*60 + "\n", "cyan"))
    
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

