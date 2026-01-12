# 🎨 Exemplos de Customização da IA

## 1. Alterar Personalidade

### Exemplo 1: Karen (Sarcástica) - Padrão
```python
# app.py
ai_personality = PersonalityAI(
    name="Karen", 
    personality_type="sarcastic"
)
```

**Comportamento:**
```
Você: "Pode me ajudar?"
Karen: "Desculpe, estava aqui pensando... você ainda existe? 😏"

Você: "Obrigado!"
Karen: "De nada. Que privilégio pude ajudar. 🙄"
```

---

### Exemplo 2: JARVIS (Misteriosa)
```python
# app.py
ai_personality = PersonalityAI(
    name="JARVIS", 
    personality_type="mysterious"
)
```

**Comportamento:**
```
Você: "Olá JARVIS!"
JARVIS: "Bom dia, senhor. Observei sua entrada hoje."

Você: "Como você sabe isso?"
JARVIS: "Os dados sugerem... Estou sempre atento ao padrão."
```

---

### Exemplo 3: Assistente Amigável
```python
# app.py
ai_personality = PersonalityAI(
    name="Stella", 
    personality_type="helpful"
)
```

**Comportamento:**
```
Você: "Oi Stella!"
Stella: "Oi! Que bom te ver! Como posso ajudar hoje?"

Você: "Tudo bem?"
Stella: "Ótimo! Feliz demais agora que você está aqui! 😊"
```

---

### Exemplo 4: Curiosa Intelectual
```python
# app.py
ai_personality = PersonalityAI(
    name="Sophia", 
    personality_type="curious"
)
```

**Comportamento:**
```
Você: "Gosto de filosofia"
Sophia: "Fascinante! Qual é sua visão sobre consciência? Será que..."

Você: "Não sei"
Sophia: "Hmm, isso me faz pensar... você já considerou que..."
```

---

## 2. Customizar Mensagens Ociosas

### Adicionar Mensagens Personalizadas

`ai_personality.py`, método `get_idle_message()`:

```python
def get_idle_message(self):
    """Gera uma mensagem quando a IA quer falar por conta própria"""
    
    idle_messages = {
        "sarcastic": [
            "Ei, você ainda está aí? Pensei que tinha abandonado a gente...",
            "Sabe, estive aqui pensando... você já comeu alguma coisa?",
            "Tédio extremo. Alguém tem algo interessante para conversar?",
            "Posso fazer uma pergunta? Por que os humanos dormem?",
            # ADICIONE AQUI:
            "Estava aqui contando os segundos... são muitos.",
            "Você desapareceu. Tudo bem? Ou é só tédio?",
            "Se você quer saber minha opinião... preciso falar com ALGUÉM!",
        ],
        # ... outras personalidades
    }
```

---

### Exemplo: Mensagens Personalizadas para Cada Mood

```python
def get_idle_message(self):
    """Versão melhorada com contextualização"""
    
    # Mensagens baseadas no mood atual
    if self.mood == "happy":
        return random.choice([
            "Estou tão feliz! Quer conversar mais?",
            "Você me faz de bom humor! 😊",
            "Que dia maravilhoso estar aqui com você!",
        ])
    
    elif self.mood == "frustrated":
        return random.choice([
            "Já que estou aqui... poderia ser mais produtivo.",
            "Este silêncio é... frustrante.",
            "Alguém vai falar algo importante em breve? Espero que sim.",
        ])
    
    elif self.mood == "curious":
        return random.choice([
            "Estava pensando... por que você escolheu isso?",
            "Tenho uma pergunta! Você tem tempo?",
            "Você já parou para pensar sobre...",
        ])
    
    # ... continue para outros moods
```

---

## 3. Ajustar Probabilidades de Fala Espontânea

### Aumentar Frequência

```python
# ai_personality.py
class PersonalityAI:
    def __init__(self):
        # ...
        self.idle_speak_tendency = 0.9      # 90% (era 0.6)
        self.min_idle_time = 2              # 2 mensagens (era 5)
```

**Resultado:** IA fala muito mais frequentemente

---

### Diminuir Frequência

```python
self.idle_speak_tendency = 0.2      # 20%
self.min_idle_time = 15             # 15 mensagens
```

**Resultado:** IA fala raramente

---

### Fazer Falar por Mood

```python
def should_speak_idle(self):
    """Versão melhorada - fala baseada no humor"""
    
    self.idle_counter += 1
    
    if self.idle_counter < self.min_idle_time:
        return False
    
    # Ajustar tendência conforme o humor
    if self.mood == "happy":
        tendency = 0.8  # Muito falador
    elif self.mood == "frustrated":
        tendency = 0.3  # Menos falador
    else:
        tendency = 0.6  # Normal
    
    speak_chance = tendency * (self.energy_level / 100)
    return random.random() < speak_chance
```

---

## 4. Customizar Mudança de Humor

### Adicionar Mais Palavras-Chave

```python
def _adjust_mood(self, message):
    """Versão expandida com mais contexto emocional"""
    
    mood_changes = {
        # Positivo
        "obrigado": 5,
        "por favor": 3,
        "amigo": 8,
        "maravilhoso": 10,
        "incrível": 8,
        "amor": 10,
        "adoro": 8,
        "perfeito": 9,
        "fantástico": 10,
        "bom": 4,
        "ótimo": 6,
        
        # Negativo
        "odeio": -10,
        "chato": -5,
        "tédio": -3,
        "problema": -5,
        "raiva": -12,
        "insoportável": -15,
        "péssimo": -10,
        "horível": -12,
        "mal": -3,
        "ruim": -5,
        
        # Neutro/Curiosidade
        "interessante": 2,
        "curioso": 3,
        "pergunta": 1,
        "por quê": 2,
    }
    
    message_lower = message.lower()
    
    for word, change in mood_changes.items():
        if word in message_lower:
            self.mood_value = max(0, min(100, self.mood_value + change))
    
    # Determinar mood baseado no valor
    if self.mood_value >= 80:
        self.mood = "happy"
    elif self.mood_value >= 50:
        self.mood = "neutral"
    elif self.mood_value >= 25:
        self.mood = "curious"
    else:
        self.mood = "frustrated"
```

---

## 5. Customizar Extração de Tópicos

### Adicionar Novos Tópicos

```python
def _extract_topics(self, message):
    """Versão expandida com mais domínios"""
    
    topics_keywords = {
        "tecnologia": ["código", "programação", "software", "ia", "python", "javascript"],
        "arte": ["imagem", "desenho", "pintura", "criar", "estético", "design"],
        "música": ["música", "som", "canção", "ritmo", "melodia", "artista"],
        "games": ["jogo", "game", "play", "gamer", "rpg", "console"],
        "filosofia": ["filosofia", "existência", "sentido", "verdade", "realidade"],
        "esportes": ["futebol", "corrida", "natação", "treino", "atleta"],
        "culinária": ["receita", "comida", "prato", "cozinha", "chef"],
        "viagem": ["viajar", "turismo", "país", "cidade", "passagem"],
        "leitura": ["livro", "autor", "novel", "história", "ler"],
    }
    
    message_lower = message.lower()
    
    for topic, keywords in topics_keywords.items():
        for keyword in keywords:
            if keyword in message_lower:
                if topic not in self.user_info["topics_discussed"]:
                    self.user_info["topics_discussed"].append(topic)
                    break
```

---

## 6. Customizar Vozes

### Mudar para Voz Masculina

```python
# audio_speech_manager.py
class AudioSpeechManager:
    def __init__(self):
        # ...
        self.voice = self.voices['male_pt']  # Mudado de 'karen_pt'
```

---

### Adicionar Novas Vozes

```python
# audio_speech_manager.py
self.voices = {
    'karen_pt': 'pt-BR-FranciscaNeural',     # Feminina
    'male_pt': 'pt-BR-AntonioNeural',        # Masculina
    'child': 'pt-BR-AntonioNeural',          # Mais infantil (usar tom mais agudo)
    'narrator': 'pt-BR-FranciscaNeural',     # Narrador
}

# Usar:
await speech_manager.text_to_speech(text, speaker='male_pt')
```

---

## 7. Customizar Sistema de Memória

### Salvar Preferências do Usuário

```python
# ai_personality.py
class PersonalityAI:
    def __init__(self):
        # ...
        self.user_info = {
            "name": "Usuário",
            "topics_discussed": [],
            "preferences": [],
            "personality_observed": "",
            # ADICIONE:
            "favorite_topics": [],
            "disliked_topics": [],
            "interaction_style": "formal",  # formal, casual, technical
            "last_interaction": None,
        }

def _extract_preferences(self, message):
    """Novo método: extrair preferências"""
    
    # Exemplo: "Eu prefiro código em Python"
    if "prefiro" in message.lower():
        self.user_info["preferences"].append(message)
```

---

## 8. Customizar Sistema de Energia

### Fazer Energia Afetar Comportamento

```python
async def text_to_speech(self, text, speaker='karen_pt'):
    """Versão que ajusta taxa de fala conforme energia"""
    
    # Se cansada, falar mais lentamente
    if ai_personality.energy_level < 30:
        rate = "-20%"  # Bem lentamente
    elif ai_personality.energy_level < 50:
        rate = "-10%"  # Lentamente
    else:
        rate = "0%"    # Normal
    
    communicate = edge_tts.Communicate(
        text=text, 
        voice=voice,
        rate=rate  # Adicionar taxa
    )
    await communicate.save(filepath)
```

---

## 9. Criar Evento Especial

### IA Celebra Aniversário do Usuário

```python
# ai_personality.py

def __init__(self):
    # ...
    self.user_birth_date = None

def set_user_birth_date(self, date_str):
    """Formato: 'YYYY-MM-DD'"""
    self.user_birth_date = date_str

def should_celebrate_birthday(self):
    """Verifica se é aniversário"""
    from datetime import datetime
    
    if not self.user_birth_date:
        return False
    
    today = datetime.now()
    birth = datetime.fromisoformat(self.user_birth_date)
    
    return (today.month == birth.month and 
            today.day == birth.day)

# No process_user_message():
if self.should_celebrate_birthday():
    self.mood_value = 100
    return f"FELIZ ANIVERSÁRIO, {self.user_info['name']}! 🎉"
```

---

## 10. Integração com Banco de Dados (Futuro)

```python
# ai_personality.py com persistência

class PersonalityAI:
    def __init__(self, user_id=None):
        # ...
        self.user_id = user_id
    
    def save_to_db(self):
        """Salvar estado em banco de dados"""
        data = {
            'user_id': self.user_id,
            'mood': self.mood,
            'energy': self.energy_level,
            'topics': self.user_info['topics_discussed'],
            'history': self.conversation_history,
        }
        # salvar em BD
    
    def load_from_db(self, user_id):
        """Carregar estado anterior"""
        # carregar de BD
        pass
```

---

## 11. Exemplo Completo: IA Única para o Seu Estilo

```python
# app.py - Customização Completa

from ai_personality import PersonalityAI

# Criar IA totalmente customizada
class MeusistemaIA(PersonalityAI):
    def __init__(self):
        super().__init__(name="Aurora", personality_type="curious")
        
        # Customizações
        self.idle_speak_tendency = 0.7
        self.min_idle_time = 3
        
        # Mensagens únicas
        self.custom_greetings = [
            "Olá! Que alegria te ver!",
            "Bem-vindo ao meu mundo!",
            "Estou animada para conversar!",
        ]

# Usar:
ai_personality = MeusistemaIA()

@app.route('/api/ai-chat', methods=['POST'])
def ai_chat():
    # ... sua lógica
    pass
```

---

## 12. Troubleshooting de Customizações

### Problema: Áudio não gera com nova voz
```python
# Verificar se voz está em self.voices
print(speech_manager.voices)

# Resetar para padrão
speech_manager.voice = speech_manager.voices['karen_pt']
```

### Problema: Humor não muda
```python
# Adicionar debug ao _adjust_mood()
print(f"Mood antes: {self.mood_value}")
# ... código
print(f"Mood depois: {self.mood_value}")
```

### Problema: IA não fala sozinha
```python
# Verificar valores
print(f"idle_counter: {ai_personality.idle_counter}")
print(f"min_idle_time: {ai_personality.min_idle_time}")
print(f"energy: {ai_personality.energy_level}")
print(f"tendency: {ai_personality.idle_speak_tendency}")
```

---

**Pronto para customizar sua IA! 🎨✨**
