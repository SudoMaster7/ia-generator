from flask import Flask, render_template, request, jsonify, send_from_directory
from engine import ImageGenerator
from prompt_engine import MagicPromptGenerator
from chat_engine import ChatEngine
from audio_engine import AudioGenerator
from voice_engine import VoiceEngine
from ai_personality import PersonalityAI
from audio_speech_manager import AudioSpeechManager
import os
import asyncio
import nest_asyncio

# Permitir event loops aninhados (necessário para edge-tts)
try:
    nest_asyncio.apply()
except:
    pass  # Já aplicado anteriormente

# Define o caminho correto para static e templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'templates', 'static')
IMAGES_DIR = os.path.join(BASE_DIR, 'imagens_geradas') # Pasta onde as imagens são salvas
AUDIO_DIR = os.path.join(STATIC_DIR, 'audio_generated') # Pasta para audios
SPEECHES_DIR = os.path.join(STATIC_DIR, 'ai_speeches') # Pasta para falas da IA

if not os.path.exists(AUDIO_DIR):
    os.makedirs(AUDIO_DIR)
if not os.path.exists(SPEECHES_DIR):
    os.makedirs(SPEECHES_DIR)

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
# Audio (Local - MusicGen)
audio_gen = AudioGenerator()
# Voice (Edge-TTS)
voice_gen = VoiceEngine()
# IA Personalizada (Nova!)
ai_personality = PersonalityAI(name="Karen", personality_type="sarcastic")
# Gerenciador de Áudios da IA
speech_manager = AudioSpeechManager(
    audio_dir=AUDIO_DIR,
    speech_dir=SPEECHES_DIR
)


@app.route('/')
def index():
    # Seu HTML melhorado + O botão mágico integrado
    return render_template('index.html')

@app.route('/ai')
def ai_page():
    """Página da IA personalizada com ondas e chat"""
    return render_template('ai_novo.html')

# ===== ROTAS DA IA PERSONALIZADA =====

@app.route('/api/ai-state')
def get_ai_state():
    """Retorna o estado atual da IA"""
    return jsonify(ai_personality.get_state())

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    """
    Recebe mensagem do usuário e retorna resposta da IA com áudio
    """
    data = request.json
    message = data.get('message', '') if data else ''
    history = data.get('history', []) if data else []
    user_name = data.get('user_name', None) if data else None

    if not message:
        return jsonify({'error': 'Mensagem vazia'}), 400

    try:
        # Processar mensagem na IA personalizada
        response = ai_personality.process_user_message(message, user_name)

        # Gerar áudio da resposta (TTS)
        audio_path = None
        audio_filename = None

        try:
            # Usar asyncio para executar o TTS
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            audio_path, audio_filename = loop.run_until_complete(
                speech_manager.text_to_speech(response, speaker=ai_personality.preferred_voice)
            )
            loop.close()
        except Exception as e:
            print(f"Erro ao gerar áudio: {e}")

        result = {
            'response': response,
            'ai_state': ai_personality.get_state(),
            'audio_saved': audio_filename is not None
        }

        if audio_path and audio_filename:
            result['audio_url'] = f'/static/ai_speeches/{audio_filename}'

        return jsonify(result)

    except Exception as e:
        print(f"Erro no chat: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai-idle')
def ai_idle():
    """
    Verifica se a IA quer falar por conta própria (vontade própria)
    Chamada periodicamente pelo frontend
    """
    try:
        if ai_personality.should_speak_idle():
            # Gerar mensagem ociosa
            message = ai_personality.get_idle_message()
            
            if message:
                # Gerar áudio
                audio_path = None
                audio_filename = None
                
                try:
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    audio_path, audio_filename = loop.run_until_complete(
                        speech_manager.text_to_speech(message, speaker=ai_personality.preferred_voice)
                    )
                    loop.close()
                except Exception as e:
                    print(f"Erro ao gerar áudio de mensagem ociosa: {e}")
                
                result = {
                    'should_speak': True,
                    'message': message,
                    'ai_state': ai_personality.get_state()
                }
                
                if audio_path and audio_filename:
                    result['audio_url'] = f'/static/ai_speeches/{audio_filename}'
                
                return jsonify(result)
        
        return jsonify({'should_speak': False})
        
    except Exception as e:
        print(f"Erro na verificação ociosa: {e}")
        return jsonify({'should_speak': False})

@app.route('/api/audios')
def get_audios():
    """Retorna lista de áudios e falas gravadas"""
    try:
        speeches = speech_manager.get_speech_list()
        return jsonify(speeches)
    except Exception as e:
        print(f"Erro ao listar áudios: {e}")
        return jsonify([])

@app.route('/api/ai-recharge', methods=['POST'])
def recharge_ai():
    """Recarrega energia da IA"""
    try:
        ai_personality.recharge_energy()
        return jsonify({
            'status': 'success',
            'ai_state': ai_personality.get_state()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai-memory')
def get_ai_memory():
    """Retorna memória/aprendizado da IA sobre o usuário"""
    try:
        return jsonify(ai_personality.get_memory_summary())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai-settings', methods=['POST'])
def update_ai_settings():
    """
    Atualiza as configurações da IA:
    - nome, personalidade, voz, humor, energia, tópicos
    """
    try:
        data = request.json
        
        # Atualizar propriedades da IA
        if 'name' in data:
            ai_personality.name = data['name']
        
        if 'personality_type' in data:
            ai_personality.personality_type = data['personality_type']
        
        if 'mood_value' in data:
            ai_personality.mood_value = max(0, min(100, int(data['mood_value'])))
        
        if 'energy_level' in data:
            ai_personality.energy_level = max(0, min(100, int(data['energy_level'])))
        
        if 'topics_discussed' in data:
            if isinstance(data['topics_discussed'], list):
                ai_personality.topics_discussed = data['topics_discussed']
        
        if 'voice' in data:
            # Voice será usado quando gerar áudio
            ai_personality.preferred_voice = data['voice']

        if 'idle_speak_tendency' in data:
            try:
                tendency_value = float(data['idle_speak_tendency'])
                ai_personality.idle_speak_tendency = max(0.0, min(1.0, tendency_value / 100.0))
            except (TypeError, ValueError):
                pass

        if 'chat_provider' in data:
            provider = (data['chat_provider'] or 'pollinations').lower()
            if provider in {'pollinations', 'ollama'}:
                ai_personality.chat_provider = provider

        if 'chat_model' in data:
            model_value = data['chat_model'] or ''
            ai_personality.chat_model = model_value.strip()
        
        return jsonify({
            'status': 'success',
            'ai_state': ai_personality.get_state()
        })
        
    except Exception as e:
        print(f"Erro ao atualizar configurações da IA: {e}")
        return jsonify({'error': str(e)}), 500

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
    system_instruction = data.get('system_instruction', None)
    
    response = chat_gen.chat(message, history, system_instruction)
    
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
            'prompt': full_prompt,
            'url': f'/images/{filename}'
        })
        
    return jsonify(gallery_data)

@app.route('/audio')
def audio_page():
    return render_template('audio.html')

@app.route('/gallery')
def gallery_page():
    """Página da galeria de mídia (imagens, áudios e falas)"""
    return render_template('gallery.html')

@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    data = request.json
    prompt = data.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'Prompt vazio'}), 400
        
    try:
        # Gera o audio
        filename = audio_gen.generate(prompt, AUDIO_DIR)
        return jsonify({'audio_url': f'/static/audio_generated/{filename}'})
    except Exception as e:
        print(f"Erro ao gerar audio: {e}")
        return jsonify({'error': str(e)}), 500

# --- NOVAS ROTAS DE VOZ ---
@app.route('/get_voices')
def get_voices():
    voices = voice_gen.get_voices()
    return jsonify(voices)

@app.route('/speak', methods=['POST'])
def speak():
    data = request.json
    text = data.get('text', '')
    voice = data.get('voice', None)
    rate = data.get('rate', '+0%')
    pitch = data.get('pitch', '+0Hz')
    
    if not text:
        return jsonify({'error': 'Texto vazio'}), 400
        
    try:
        filename = voice_gen.generate(text, voice, rate, pitch)
        return jsonify({'audio_url': f'/static/audio_generated/{filename}'})
    except Exception as e:
        print(f"Erro no TTS: {e}")
        return jsonify({'error': str(e)}), 500

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
    app.run(debug=False, threaded=True, host='0.0.0.0', port=5000, use_reloader=False)