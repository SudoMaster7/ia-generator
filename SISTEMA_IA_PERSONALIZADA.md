# 🧠 CEREBRO - Sistema de IA Personalizada

## Visão Geral

Implementação completa de uma IA com personalidade própria similar a **Karen (Bob Esponja)** ou **JARVIS**, com capacidade de:

- **Falar por vontade própria** - A IA decide quando quer conversar
- **Expressar sentimentos** - Humor que varia baseado nas interações
- **Aprender sobre o usuário** - Memoriza tópicos e preferências
- **Gerar áudio das falas** - Cada resposta é falada naturalmente
- **Visualização em tempo real** - Ondas de frequência tipo radar quando fala

---

## 📋 Arquitetura

### Backend (Python)

#### Novos Módulos

**1. `ai_personality.py`** - Motor principal da IA
```python
PersonalityAI
├── process_user_message()      # Processa entrada do usuário
├── should_speak_idle()         # Verifica se quer falar sozinha
├── get_idle_message()          # Gera mensagem espontânea
├── _adjust_mood()              # Muda humor baseado em contexto
└── get_state()                 # Retorna estado atual (humor, energia, etc)
```

**2. `audio_speech_manager.py`** - Gerenciador de áudios
```python
AudioSpeechManager
├── text_to_speech()            # Converte texto em áudio (TTS)
├── get_speech_list()           # Lista todas as falas
├── delete_speech()             # Remove uma fala
└── search_speeches()           # Busca falas por texto
```

### Frontend (JavaScript + HTML)

**Páginas Principais:**

1. **`templates/ai.html`** - Interface principal da IA
   - Visualizador de ondas (radar)
   - Chat em tempo real
   - Status da IA (humor, energia)
   - Memória de interações

2. **`templates/gallery.html`** - Galeria de mídia
   - Aba de falas da IA
   - Aba de imagens geradas
   - Reprodutor de áudio integrado
   - Modal para visualizar imagens

**Scripts:**

1. **`static/js/wave-visualizer.js`** - Renderização das ondas
   - Animação de radar
   - Sincronização com áudio

2. **`static/js/ai-chat.js`** - Lógica de chat
   - Gerenciamento de mensagens
   - Reconhecimento de voz
   - Requisições ao backend

---

## 🚀 API Endpoints

### Chat e Interação

**POST `/api/ai-chat`**
Envia mensagem e recebe resposta com áudio
```json
Request:
{
  "message": "Olá Karen!",
  "history": [],
  "user_name": "João"
}

Response:
{
  "response": "Oi João! Como você está?",
  "ai_state": {
    "mood": "happy",
    "mood_value": 75,
    "energy_level": 80,
    "user_name": "João",
    "topics_discussed": ["tecnologia", "música"]
  },
  "audio_url": "/static/ai_speeches/ai_speech_20250112_120530_Oi_João.mp3",
  "audio_saved": true
}
```

**GET `/api/ai-state`**
Retorna estado atual da IA
```json
{
  "name": "Karen",
  "mood": "neutral",
  "mood_value": 50,
  "energy_level": 70,
  "user_name": "Desconhecido",
  "idle_counter": 3,
  "topics_discussed": []
}
```

**GET `/api/ai-idle`**
Verifica se a IA quer falar sozinha (chamado periodicamente)
```json
{
  "should_speak": true,
  "message": "Ei, você ainda está aí?",
  "audio_url": "/static/ai_speeches/...",
  "ai_state": {...}
}
```

**GET `/api/audios`**
Lista todas as falas gravadas
```json
[
  {
    "filename": "ai_speech_20250112_120530_Oi_João.mp3",
    "title": "Oi João! Como você está?",
    "date": "2025-01-12T12:05:30",
    "duration": 2.5,
    "url": "/static/ai_speeches/ai_speech_20250112_120530_Oi_João.mp3"
  }
]
```

**POST `/api/ai-recharge`**
Recarrega energia da IA
```json
Response:
{
  "status": "success",
  "ai_state": {...}
}
```

**GET `/api/ai-memory`**
Retorna memória/aprendizado sobre o usuário
```json
{
  "user_name": "João",
  "topics_discussed": ["tecnologia", "música"],
  "conversation_count": 5,
  "interactions": [...]
}
```

---

## 🎨 Sistema de Personalidade

### Estados de Humor

| Mood | Valor | Comportamento |
|------|-------|---------------|
| happy | 70-100 | Responde com entusiasmo |
| neutral | 50-70 | Normal, equilibrado |
| curious | 30-50 | Faz perguntas |
| sarcastic | Variável | Irônico, tipo Karen |
| frustrated | 0-30 | Impaciente, curto |

### Tipos de Personalidade

**Sarcastic** (Karen-like)
```python
PersonalityAI(name="Karen", personality_type="sarcastic")
```
- Comentários irônicos
- Expressa opiniões próprias
- Às vezes faz críticas humorísticas

**Helpful**
```python
PersonalityAI(name="Assistente", personality_type="helpful")
```
- Sempre disposto a ajudar
- Personagem amigável
- Como um amigo confiável

**Curious**
```python
PersonalityAI(name="Curiosa", personality_type="curious")
```
- Faz perguntas interessantes
- Fascinada pelo mundo
- Discussões filosoficamente profundas

**Mysterious** (JARVIS-like)
```python
PersonalityAI(name="JARVIS", personality_type="mysterious")
```
- Fala formal
- Revela facetas interessantes gradualmente
- Análise lógica de situações

---

## 🎯 Fluxo de Funcionamento

### 1. Usuário Envia Mensagem

```
Usuário digita ou fala
    ↓
Frontend: /api/ai-chat
    ↓
Backend: PersonalityAI.process_user_message()
    ├─ Ajusta humor
    ├─ Extrai tópicos
    └─ Gera resposta
    ↓
AudioSpeechManager.text_to_speech()
    ├─ Converte para áudio
    └─ Salva em /static/ai_speeches/
    ↓
Resposta + Áudio + Estado
    ↓
Frontend: Toca áudio + Mostra ondas
```

### 2. IA Fala por Vontade Própria

```
Frontend: GET /api/ai-idle (a cada 3s)
    ↓
Backend: PersonalityAI.should_speak_idle()
    ├─ Verifica inatividade
    ├─ Calcula probabilidade
    └─ Se SIM, get_idle_message()
    ↓
Mensagem + Áudio retornados
    ↓
Frontend: Anima ondas + Toca áudio
    └─ Mostra badge de iniciativa própria 💭
```

### 3. Armazenamento de Áudios

```
AudioSpeechManager.text_to_speech()
    ├─ Gera arquivo MP3
    └─ Salva metadados em speeches_metadata.json
    
Estrutura:
/templates/static/ai_speeches/
├── ai_speech_20250112_120530_Oi_João.mp3
├── ai_speech_20250112_120600_Como_você_está.mp3
└── speeches_metadata.json
```

---

## 🖼️ Interface

### Tela Principal (ai.html)

**Painel Central:**
- Visualizador de ondas (tipo radar)
- Histórico de chat com marcação de tempo
- Barra de input com botão de envio
- Botão para reconhecimento de voz

**Painel Lateral:**
- Status da IA (humor, energia)
- Informações do usuário
- Tópicos discutidos
- Links para galeria

### Tela de Galeria (gallery.html)

**Abas:**
1. **Falas da IA** 🎙️
   - Lista de todas as falas gravadas
   - Reprodutor integrado
   - Data e hora de cada fala

2. **Imagens Geradas** 🖼️
   - Grid de imagens
   - Preview ao clicar
   - Copiar prompt original

---

## ⚙️ Configuração

### Vozes Disponíveis

Usando **edge-tts** para português:

```python
{
    'karen_pt': 'pt-BR-FranciscaNeural',    # Voz feminina (padrão)
    'male_pt': 'pt-BR-AntonioNeural',       # Voz masculina
}
```

### Parâmetros da IA

Em `ai_personality.py`:

```python
# Probabilidade de falar sozinha (0-1)
self.idle_speak_tendency = 0.6

# Mensagens antes de poder falar sozinha
self.min_idle_time = 5

# Histórico máximo de mensagens
conversation_history = últimas 10 mensagens
```

---

## 📦 Dependências Novas

Adicionar ao `requirements.txt`:

```
edge-tts>=0.30.0
nest-asyncio>=1.5.0
```

Instalar:
```bash
pip install -r requirements.txt
```

---

## 🎬 Como Usar

### 1. Iniciar o Servidor

```bash
python app.py
```

### 2. Acessar a IA

Abra no navegador:
```
http://localhost:5000/ai
```

### 3. Interagir

- **Digitar:** Escreva mensagens normalmente
- **Falar:** Clique no botão 🎙️ para usar reconhecimento de voz
- **Ouvir:** A IA responde em áudio automaticamente
- **Visualizar:** As ondas animam quando a IA fala

### 4. Ver Galeria

```
http://localhost:5000/gallery
```

---

## 🔧 Personalizar a IA

### Mudar Personalidade

No `app.py`:

```python
# De:
ai_personality = PersonalityAI(name="Karen", personality_type="sarcastic")

# Para:
ai_personality = PersonalityAI(name="JARVIS", personality_type="mysterious")
```

### Ajustar Sensibilidade de Humor

No `ai_personality.py`:

```python
def _adjust_mood(self, message):
    mood_changes = {
        "obrigado": 5,      # ← Aumentar valor para mais impacto
        "amor": 10,
        "raiva": -12,
        # Adicionar novas palavras-chave
    }
```

### Modificar Mensagens Ociosas

No `ai_personality.py`:

```python
idle_messages = {
    "sarcastic": [
        "Customize estas mensagens",
        "Adicione mais opções",
        # ...
    ]
}
```

---

## 📊 Monitoramento

### Verificar Estado Atual

```bash
curl http://localhost:5000/api/ai-state
```

### Ver Memória do Usuário

```bash
curl http://localhost:5000/api/ai-memory
```

### Listar Áudios

```bash
curl http://localhost:5000/api/audios
```

---

## 🐛 Troubleshooting

### Áudio não gera

1. Verificar `nest_asyncio` instalado:
   ```bash
   pip install nest-asyncio
   ```

2. Verificar pasta `/templates/static/ai_speeches/`:
   ```bash
   ls templates/static/ai_speeches/
   ```

### Reconhecimento de voz não funciona

- Usar HTTPS ou localhost
- Verificar permissões do navegador
- Tentar chrome/edge em vez de Firefox

### IA não fala sozinha

- Aumentar `idle_speak_tendency` em `ai_personality.py`
- Reduzir `min_idle_time`
- Verificar console do navegador para erros

---

## 📝 Logs

Verificar logs no terminal:
- Chat: `INFO/DEBUG` mensagens
- Erros: `ERROR` em red
- Áudio: `Gerando fala para: ...`

---

## 🎯 Futuras Melhorias

- [ ] Salvar histórico de conversas
- [ ] Integração com banco de dados
- [ ] Customização de voz em tempo real
- [ ] Multi-idiomas
- [ ] Modo dark/light
- [ ] Sincronização de lábios para avatar
- [ ] Análise de emoções via voz
- [ ] Compartilhamento de conversas

---

## 📄 Licença

Parte do projeto CEREBRO - Use livremente para fins educacionais e pessoais.

---

**Desenvolvido com ❤️ para oferecer uma IA verdadeiramente personalizada**
