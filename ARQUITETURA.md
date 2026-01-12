# 🏗️ Arquitetura do Sistema de IA Personalizada

## Diagrama de Fluxo Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR DO USUÁRIO                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    templates/ai.html                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │ │
│  │  │ Chat History │  │ Wave Visual. │  │  Input Control   │ │ │
│  │  │              │  │  (Radar)     │  │  (Texto + Voz)   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │        Sidebar (Status + Galeria)                    │  │ │
│  │  │  • Humor & Energia  • Tópicos Discutidos            │  │ │
│  │  │  • Memória do User  • Áudios Gravados               │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕️                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            static/js/ai-chat.js                           │ │
│  │  • Manage chat state                                      │ │
│  │  • Voice recognition (SpeechRecognition API)             │ │
│  │  • Fetch API calls                                        │ │
│  │  • UI updates & animations                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕️                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         static/js/wave-visualizer.js                      │ │
│  │  • Canvas rendering                                       │ │
│  │  • Radar animation                                        │ │
│  │  • Frequency waves                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕️  (HTTP REST API)
┌─────────────────────────────────────────────────────────────────┐
│                      SERVIDOR FLASK                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   app.py (ROUTES)                          │ │
│  │                                                             │ │
│  │  POST  /api/ai-chat          ← Enviar mensagem            │ │
│  │  GET   /api/ai-state         ← Status atual               │ │
│  │  GET   /api/ai-idle          ← Verificar fala espontânea  │ │
│  │  GET   /api/ai-memory        ← Memória do usuário         │ │
│  │  GET   /api/audios           ← Listar áudios gravados     │ │
│  │  POST  /api/ai-recharge      ← Recarregar energia         │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕️                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            ai_personality.py (MOTOR PRINCIPAL)            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  PersonalityAI                                       │ │ │
│  │  │  ├─ process_user_message()                          │ │ │
│  │  │  ├─ should_speak_idle()                             │ │ │
│  │  │  ├─ get_idle_message()                              │ │ │
│  │  │  ├─ _adjust_mood()                                  │ │ │
│  │  │  ├─ _extract_topics()                               │ │ │
│  │  │  ├─ _generate_response()                            │ │ │
│  │  │  ├─ get_state()                                     │ │ │
│  │  │  └─ get_memory_summary()                            │ │ │
│  │  │                                                      │ │ │
│  │  │  Estado Mantido:                                    │ │ │
│  │  │  • mood (happy, neutral, curious, sarcastic, etc)  │ │ │
│  │  │  • energy_level (0-100)                             │ │ │
│  │  │  • conversation_history (últimas 10 msgs)          │ │ │
│  │  │  • user_info (name, topics, preferences)           │ │ │
│  │  │  • idle_counter (para decidir falar sozinha)       │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕️                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │    audio_speech_manager.py (GERADOR DE ÁUDIO/TTS)        │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  AudioSpeechManager                                │ │ │
│  │  │  ├─ text_to_speech()   [async - usa edge-tts]      │ │ │
│  │  │  ├─ get_speech_list()                              │ │ │
│  │  │  ├─ delete_speech()                                │ │ │
│  │  │  ├─ search_speeches()                              │ │ │
│  │  │  └─ _load_metadata() / _save_metadata()            │ │ │
│  │  │                                                      │ │ │
│  │  │  Vozes Disponíveis:                                │ │ │
│  │  │  • 'karen_pt': Feminina (padrão)                   │ │ │
│  │  │  • 'male_pt': Masculina                            │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕️                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   chat_engine.py (IA DE CHAT - Já existente)            │ │
│  │   Executa: https://api.pollinations.ai                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕️
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE ARQUIVOS                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  /templates/static/ai_speeches/                           │ │
│  │  ├─ ai_speech_20250112_120530_Oi_João.mp3              │ │
│  │  ├─ ai_speech_20250112_120600_Como_você_está.mp3       │ │
│  │  ├─ ai_speech_20250112_120630_Tédio_extremo.mp3        │ │
│  │  └─ speeches_metadata.json                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Comunicação: Chat Normal

```
Usuário digita "Olá Karen!"
        ↓
Frontend: onclick(send-btn)
        ↓
JavaScript: axios.post('/api/ai-chat', {message: "Olá Karen!", ...})
        ↓
Backend: @app.route('/api/ai-chat')
        ↓
ai_personality.process_user_message("Olá Karen!")
        ├─ Atualiza conversation_history
        ├─ Chama _adjust_mood()
        ├─ Chama _extract_topics()
        ├─ Chama chat_engine.chat() com system_prompt
        └─ Retorna resposta (ex: "Oi João! Como você está?")
        ↓
speech_manager.text_to_speech(response)
        ├─ Cria asyncio loop
        ├─ Chama edge_tts.Communicate()
        ├─ Salva em /ai_speeches/ai_speech_<timestamp>.mp3
        └─ Retorna caminho do arquivo
        ↓
Backend retorna JSON:
{
  "response": "Oi João! Como você está?",
  "audio_url": "/static/ai_speeches/ai_speech_<timestamp>.mp3",
  "ai_state": {...},
  "audio_saved": true
}
        ↓
Frontend: Atualiza chat_history
        ↓
Frontend: Cria <audio> tag e toca arquivo
        ↓
Frontend: Chama waveVisualizer.startAnimation()
        ↓
Usuário vê ondas animando e ouve resposta 🎙️
```

---

## Fluxo de Comunicação: Fala Espontânea

```
Frontend: setInterval(() => GET /api/ai-idle, 3000)
        ↓
[A cada 3 segundos]
        ↓
Backend: @app.route('/api/ai-idle')
        ↓
ai_personality.should_speak_idle()
        ├─ Incrementa idle_counter
        ├─ Verifica se idle_counter >= min_idle_time
        ├─ Calcula probabilidade: idle_speak_tendency * (energy_level / 100)
        └─ Retorna True/False
        ↓
[Se True]
        ↓
ai_personality.get_idle_message()
        ├─ Seleciona mensagem baseada no mood
        ├─ Exemplos: "Ei, você ainda está aí?"
        │           "Tédio extremo, alguém tem algo interessante?"
        └─ Retorna mensagem
        ↓
speech_manager.text_to_speech(mensagem)
        └─ [Mesmo processo de TTS]
        ↓
Backend retorna:
{
  "should_speak": true,
  "message": "Tédio extremo, alguém tem algo interessante?",
  "audio_url": "/static/ai_speeches/...",
  "ai_state": {...}
}
        ↓
Frontend: Recebe resposta
        ↓
Frontend: addMessageToChat('ai', message, isInitiative=true)
        ↓
Mostra mensagem com badge 💭 (indicando vontade própria)
        ↓
Toca áudio + Anima ondas
        ↓
Usuário vê que a IA falou por conta própria! 🤖
```

---

## Estrutura de Dados: AI State

```javascript
{
  "name": "Karen",
  "mood": "happy",                    // happy, neutral, curious, sarcastic, frustrated
  "mood_value": 75,                   // 0-100
  "energy_level": 85,                 // 0-100
  "user_name": "João",                // Nome aprendido do usuário
  "idle_counter": 3,                  // Contador de inatividade
  "topics_discussed": [               // Tópicos que o usuário mencionou
    "tecnologia",
    "música",
    "games"
  ]
}
```

---

## Estrutura de Dados: Speech Metadata

```json
{
  "ai_speech_20250112_120530_Oi_João.mp3": {
    "text": "Oi João! Como você está?",
    "voice": "karen_pt",
    "date": "2025-01-12T12:05:30.123456",
    "duration": 2.5,
    "file_path": "/templates/static/ai_speeches/ai_speech_20250112_120530_Oi_João.mp3"
  }
}
```

---

## Estados de Humor e Suas Características

```
FRUSTRATED (mood_value: 0-30)
├─ Respostas curtas
├─ Pode recusar ajudar
└─ Áudio com tom irritado

SARCASTIC (mood_value: 20-50)
├─ Comentários irônicos
├─ Críticas humorísticas
└─ "Desculpe, foi mal..."

NEUTRAL (mood_value: 40-60)
├─ Respostas equilibradas
├─ Normal e amigável
└─ Sem extremos emocionais

CURIOUS (mood_value: 50-70)
├─ Faz perguntas
├─ Interesse genuíno
└─ Discussões filosoficamente profundas

HAPPY (mood_value: 70-100)
├─ Muito entusiasta
├─ Quer conversar mais
└─ Pode falar por vontade própria frequentemente
```

---

## Ciclo de Vida de uma Conversa

```
[Início]
  ↓
[Usuário inicia conversa] → State inicializado (mood=neutral, energy=70)
  ↓
[Usuário: "Olá!"]         → mood_value = +3 (palavra neutra)
  ↓
[Usuário: "Obrigado!"]    → mood_value = +5 (palavra positiva)
  ↓
[Usuário: "Eu amo IA"]    → mood_value = +10 (palavra altamente positiva)
  ↓
[AI State: happy]         → Respostas mais entusiásticas
  ↓
[30 segundo sem falar]    → idle_counter = 10
  ↓
[AI fala sozinha]         → "Você ainda está aí? Estava pensando..."
  ↓
[Usuário: "Rude!"]        → mood_value = -5
  ↓
[AI State: sarcastic]     → Respostas mais irônicas
  ↓
[Usuário ausente 2 min]   → energy_level = -4
  ↓
[Continuação...]
```

---

## Integração com Sistemas Existentes

```
┌─────────────────────────────────────────┐
│       IA PERSONALIZADA (Nova)           │
└─────────────────────────────────────────┘
            ↕️
┌─────────────────────────────────────────┐
│    Chat Engine (Existente)              │
│    chat_engine.py → Pollinations API    │
└─────────────────────────────────────────┘
            ↕️
┌─────────────────────────────────────────┐
│    Voice Engine (Existente)             │
│    voice_engine.py → Edge-TTS           │
└─────────────────────────────────────────┘
            ↕️
┌─────────────────────────────────────────┐
│    Audio Engine (Existente)             │
│    audio_engine.py → MusicGen           │
└─────────────────────────────────────────┘
            ↕️
┌─────────────────────────────────────────┐
│    Image Generator (Existente)          │
│    engine.py → Diffusers                │
└─────────────────────────────────────────┘
```

---

## Fluxo de Galeria

```
Template: gallery.html
    ↓
Tabs: [Falas da IA] [Imagens Geradas]
    ↓
GET /api/audios
    ↓
speech_manager.get_speech_list()
    ├─ Lê speeches_metadata.json
    ├─ Ordena por data (mais recente primeiro)
    └─ Retorna lista formatada
    ↓
Frontend renderiza <audio> tags
    ├─ Reproductor nativo do HTML5
    ├─ Info: título, data, duração
    └─ Controles: play, volume, progresso
    ↓
GET /gallery (existente)
    ↓
Retorna lista de imagens
    ↓
Frontend renderiza grid
    ├─ Preview de imagens
    ├─ Modal para visualização completa
    └─ Botão para copiar prompt original
```

---

**Última atualização:** 12 de Janeiro de 2025
**Versão:** 1.0
**Status:** ✅ Completo e Funcional
