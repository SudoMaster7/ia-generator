from flask import Flask, render_template, request, jsonify, send_from_directory
from engine import ImageGenerator
from prompt_engine import MagicPromptGenerator
from chat_engine import ChatEngine
import os

# Define o caminho correto para static e templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'templates', 'static')
IMAGES_DIR = os.path.join(BASE_DIR, 'imagens_geradas') # Pasta onde as imagens são salvas

app = Flask(__name__, 
            template_folder=TEMPLATE_DIR,
            static_folder=STATIC_DIR,
            static_url_path='/static')

# Inicializa as IAs
# Imagem (GPU ou CPU)
image_gen = ImageGenerator()
# Texto (CPU - Leve)
prompt_gen = MagicPromptGenerator()
# Chat (Cloud - Pollinations)
chat_gen = ChatEngine()




@app.route('/')
def index():
    # Seu HTML melhorado + O botão mágico integrado
    return render_template('index.html')

@app.route('/magic-prompt', methods=['POST'])
def magic_prompt():
    data = request.json
    idea = data.get('idea', '')
    print(f"Melhorando ideia: {idea}")
    
    new_prompt = prompt_gen.enhance(idea)
    
    return jsonify({'prompt': new_prompt})

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    device = data.get('device', 'cuda')
    
    image_gen.switch_device(device)
    result = image_gen.generate(prompt)
    
    return jsonify(result)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    history = data.get('history', [])
    
    response = chat_gen.chat(message, history)
    
    return jsonify({'response': response})

@app.route('/progress')
def progress():
    return jsonify({'progress': image_gen.current_progress})

# --- NOVA ROTA: Listar Imagens ---
@app.route('/gallery')
def get_gallery():
    if not os.path.exists(IMAGES_DIR):
        return jsonify([])
    
    # Lista arquivos, ordena por data (mais recente primeiro)
    files = [f for f in os.listdir(IMAGES_DIR) if f.endswith('.png')]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(IMAGES_DIR, x)), reverse=True)
    
    gallery_data = []
    for filename in files:
        full_prompt = ""
        
        # 1. Tenta ler do arquivo .txt correspondente
        txt_filename = filename.replace('.png', '.txt')
        txt_path = os.path.join(IMAGES_DIR, txt_filename)
        
        if os.path.exists(txt_path):
            try:
                with open(txt_path, 'r', encoding='utf-8') as f:
                    full_prompt = f.read()
            except:
                pass
        
        # 2. Se não tiver txt (imagens antigas), tenta pegar do nome do arquivo
        if not full_prompt:
            try:
                parts = filename.split('_', 2)
                if len(parts) > 2:
                    full_prompt = parts[2].replace('.png', '').replace('_', ' ')
                else:
                    full_prompt = filename
            except:
                full_prompt = filename
            
        gallery_data.append({
            'filename': filename,
            'prompt': full_prompt
        })
        
    return jsonify(gallery_data)

# --- NOVA ROTA: Servir Imagem Específica ---
@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(IMAGES_DIR, filename)

# ADICIONE ESTA ROTA SE ELA NÃO EXISTIR
@app.route('/cancel', methods=['POST'])
def cancel_generation():
    print("--- Rota /cancel chamada! ---") # Debug para ver no terminal
    image_gen.cancel()
    return jsonify({'status': 'Cancelamento solicitado'})

if __name__ == '__main__':
    # host='0.0.0.0' permite acesso externo
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)