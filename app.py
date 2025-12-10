from flask import Flask, render_template, request, jsonify
from engine import ImageGenerator
import threading

app = Flask(__name__)

# Inicializa o gerador
generator = ImageGenerator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    device = data.get('device', 'cuda')
    
    # Troca de dispositivo se necessário
    generator.switch_device(device)
    
    # Gera
    result = generator.generate(prompt)
    
    return jsonify(result)

@app.route('/progress')
def progress():
    return jsonify({'progress': generator.current_progress})

if __name__ == '__main__':
    # threaded=True é importante para que a rota /progress 
    # funcione enquanto /generate está processando
    app.run(debug=True, threaded=True, port=5000)