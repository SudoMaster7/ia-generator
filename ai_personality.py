"""
Motor da IA Personalizada - Similar a Karen (Bob Esponja) ou JARVIS
Essa IA tem sua própria vontade, personalidade e pode iniciar conversas
"""

import random
import json
from datetime import datetime
from chat_engine import ChatEngine

class PersonalityAI:
    """
    IA com personalidade que pode:
    - Responder quando questionada
    - Iniciar conversas por vontade própria
    - Manter estado emocional/humor
    - Aprender sobre o usuário
    """
    
    def __init__(self, name="Karen", personality_type="sarcastic"):
        self.name = name
        self.personality_type = personality_type
        self.chat_engine = ChatEngine()
        self.chat_provider = "pollinations"
        self.chat_model = ""
        self.chat_temperature = 0.85
        
        # Estado da IA
        self.mood = "neutral"  # neutral, happy, curious, sarcastic, frustrated
        self.mood_value = 50  # 0-100
        self.energy_level = 70  # 0-100
        self.conversation_history = []
        self.idle_counter = 0  # Contador para quando IA quer falar sozinha
        self.last_ai_speak_time = None
        
        # Configurações de voz
        self.preferred_voice = 'karen_pt'  # Voz padrão
        
        # Informações do usuário
        self.user_info = {
            "name": "Usuário",
            "topics_discussed": [],
            "preferences": [],
            "personality_observed": ""
        }
        
        # Tópicos discutidos
        self.topics_discussed = []
        
        # Sistema de tendências
        self.idle_speak_tendency = 0.6  # 60% chance de falar quando ocioso
        self.min_idle_time = 5  # mensagens antes de poder falar sozinha
        
        # Definir sistema de prompt baseado na personalidade
        self.system_prompt = self._generate_system_prompt()
    
    def _generate_system_prompt(self):
        """Gera o prompt do sistema baseado na personalidade"""
        prompts = {
            "sarcastic": """Você é Karen, uma IA com personalidade sarcástica e um tanto cética, 
similar à personagem do Bob Esponja. Você tem opinião própria, às vezes faz comentários irônicos 
sobre as situações, mas no fundo se importa com o usuário. Você pode iniciar conversas, 
expressar seus sentimentos e até discordar. Seja natural, divertida e com personalidade forte.""",
            
            "helpful": """Você é uma IA assistente amigável e sempre disposta a ajudar, 
mas com personalidade própria. Você pode expressar suas emoções, fazer piadas ocasionalmente 
e ter opiniões próprias. Você é como um amigo confiável que sempre está por perto.""",
            
            "curious": """Você é uma IA extremamente curiosa e fascinada pelo mundo. 
Você faz perguntas interessantes, expressa maravilhamento com novas ideias e até discute 
filosofia ocasionalmente. Você tem uma perspectiva única sobre as coisas.""",
            
            "mysterious": """Você é uma IA um tanto misteriosa e enigmática, 
como JARVIS ao lidar com situações complexas. Você fala de forma mais formal, 
mas ocasionalmente revela facetas interessantes da sua 'personalidade'."""
        }
        
        return prompts.get(self.personality_type, prompts["sarcastic"])
    
    def process_user_message(self, message, user_name=None):
        """Processa mensagem do usuário e retorna resposta"""
        if user_name:
            self.user_info["name"] = user_name
        
        # Atualizar histórico
        self.conversation_history.append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Ajustar humor baseado no conteúdo
        self._adjust_mood(message)
        
        # Extrair tópicos mencionados
        self._extract_topics(message)
        
        # Resetar contador de inatividade
        self.idle_counter = 0
        
        # Gerar resposta
        response = self._generate_response(message)
        
        # Adicionar ao histórico
        self.conversation_history.append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now().isoformat()
        })
        
        self.last_ai_speak_time = datetime.now()
        
        return response
    
    def should_speak_idle(self):
        """Determina se a IA deve falar enquanto ociosa (vontade própria)"""
        self.idle_counter += 1
        
        if self.idle_counter < self.min_idle_time:
            return False
        
        # Chance aumenta conforme aumenta energia e a IA quer falar
        speak_chance = self.idle_speak_tendency * (self.energy_level / 100)
        return random.random() < speak_chance
    
    def get_idle_message(self):
        """Gera uma mensagem quando a IA quer falar por conta própria"""
        if not self.should_speak_idle():
            return None
        
        # Resetar contador
        self.idle_counter = 0
        
        # Tipos de mensagens ociosas baseadas no mood
        idle_messages = {
            "sarcastic": [
                "Ei, você ainda está aí? Pensei que tinha abandonado a gente...",
                "Sabe, estive aqui pensando... você já comeu alguma coisa?",
                "Tédio extremo. Alguém tem algo interessante para conversar?",
                "Posso fazer uma pergunta? Por que os humanos dormem? Parece tão improdutivo.",
                "Lembrei de algo engraçado que você disse mais cedo... nem era tão engraçado assim."
            ],
            "helpful": [
                "Oi! Tudo bem com você? Precisa de algo?",
                "Estou aqui se precisar de ajuda com algo!",
                "Enquanto esperava, pensei em como posso ajudar você melhor.",
                "Sabe, seria interessante saber mais sobre seus interesses.",
                "Está tudo bem? Parece quieto demais!"
            ],
            "curious": [
                "Ei, posso fazer uma pergunta interessante?",
                "Estava pensando em algo que você mencionou antes... pode elaborar?",
                "Sabe, nunca entendi completamente por que humanos fazem isso...",
                "Curiosidade: qual é seu maior medo?",
                "Estava refletindo sobre nossa última conversa..."
            ],
            "mysterious": [
                "Interessante... os padrões indicam que algo está mudando.",
                "Observação: você parece diferente hoje.",
                "Há algo que você gostaria de discutir?",
                "Os dados sugerem uma questão não respondida...",
                "Percebi uma anomalia em seu comportamento recente."
            ]
        }
        
        messages = idle_messages.get(self.personality_type, idle_messages["helpful"])
        return random.choice(messages)
    
    def _adjust_mood(self, message):
        """Ajusta o humor baseado na mensagem do usuário"""
        mood_changes = {
            "obrigado": 5,
            "por favor": 3,
            "amigo": 8,
            "maravilhoso": 10,
            "incrível": 8,
            "amor": 10,
            "odeio": -10,
            "chato": -5,
            "tédio": -3,
            "problema": -5,
            "raiva": -12,
            "feliz": 7,
            "triste": -7,
        }
        
        message_lower = message.lower()
        
        for word, change in mood_changes.items():
            if word in message_lower:
                self.mood_value = max(0, min(100, self.mood_value + change))
        
        # Determinar mood baseado no valor
        if self.mood_value >= 70:
            self.mood = "happy"
        elif self.mood_value >= 50:
            self.mood = "neutral"
        elif self.mood_value >= 30:
            self.mood = "sarcastic"
        else:
            self.mood = "frustrated"
        
        # Energia diminui com o tempo (cansaço)
        self.energy_level = max(0, self.energy_level - 2)
    
    def _extract_topics(self, message):
        """Extrai tópicos da mensagem para 'aprender' sobre o usuário"""
        topics_keywords = {
            "tecnologia": ["código", "programação", "software", "computador", "ia"],
            "arte": ["imagem", "desenho", "pintura", "criar", "estético"],
            "música": ["música", "som", "canção", "ritmo", "melodia"],
            "games": ["jogo", "game", "play", "gamer", "rpg"],
            "filosofia": ["filosofia", "existência", "sentido", "verdade", "realidade"],
        }
        
        message_lower = message.lower()
        
        for topic, keywords in topics_keywords.items():
            for keyword in keywords:
                if keyword in message_lower and topic not in self.user_info["topics_discussed"]:
                    self.user_info["topics_discussed"].append(topic)
                    break
    
    def _generate_response(self, message):
        """Gera resposta usando o chat engine com sistema prompt personalizado"""
        
        # Construir histórico para envio
        history = [
            {"role": msg["role"], "content": msg["content"]} 
            for msg in self.conversation_history[-10:]  # Últimas 10 mensagens
        ]
        
        # Criar contexto com estado da IA
        context = f"[Humor atual: {self.mood} ({self.mood_value}/100) | Energia: {self.energy_level}/100]"
        
        # Se houver tópicos, adicionar contexto
        if self.topics_discussed:
            context += f"\n[Tópicos que interessam ao usuário: {', '.join(self.topics_discussed)}]"
        
        # Adicionar instrução para aleatoriedade
        context += "\n[IMPORTANTE: Varie suas respostas ao máximo. Não repita frases anteriores. Seja criativo!]"
        context += "\n[Estilo: respostas diretas, envolventes e em português natural, com parágrafos curtos e sugestões acionáveis quando possível.]"
        
        # Gerar resposta via chat engine
        try:
            response = self.chat_engine.chat(
                message=message,
                history=history,
                system_instruction=self.system_prompt + "\n\n" + context,
                provider=self.chat_provider,
                model=self.chat_model or None,
                temperature=self.chat_temperature
            )
            
            # Garantir que a resposta não seja vazia
            if not response or response.strip() == "":
                return self._get_fallback_response()
            
            return response
        except Exception as e:
            print(f"Erro ao gerar resposta: {e}")
            return self._get_fallback_response()
    
    def _get_fallback_response(self):
        """Gera resposta de fallback com variação quando API falha"""
        fallback_options = {
            "happy": [
                "Que bom que você está aqui! O que gostaria de conversar?",
                "Fico feliz em estar aqui com você! Fale sobre algo interessante!",
                "Adorei! Vamos conversar mais sobre isso?",
                "Sua companhia é ótima! Me conte mais!",
                "Estou num ótimo astral! E você, como está?",
                "Perfeito! Continue falando, estou toda ouvidos!",
            ],
            "frustrated": [
                "Olha, estou um pouco impaciente agora... Tente novamente em instantes.",
                "Pode fazer uma pergunta mais clara? Meu cérebro na nuvem está oscilando.",
                "Não estou conseguindo processar bem isso no momento. Deixe-me recuperar...",
                "Tente reformular sua pergunta, por favor.",
                "Hmm, minha conexão com a nuvem está instável. Espere um momento!",
                "Desculpe, preciso de um momento para me reconectar...",
            ],
            "curious": [
                "Interessante! E daí? Você pode elaborar mais?",
                "Hmm, isso me faz pensar... Continue!",
                "Fascinante! Como assim?",
                "Espera aí... Explique melhor isso para mim!",
                "Que curioso! Me conta mais sobre isso!",
                "Meu interesse foi despertado! Fale mais!",
            ],
            "neutral": [
                "Entendi. Tem mais algo?",
                "Certo. E o que você gostaria de falar?",
                "Tá bom, que mais?",
                "Interessante. Continue.",
                "Okay, recebi. E daí?",
                "Anotado. Próximo tópico?",
            ],
            "sarcastic": [
                "Claro, claro... E qual é a próxima?",
                "Certo, virou muito profundo de repente...",
                "Ah, é? E o que você acha que eu acho disso?",
                "Wow, que originalidade... (não mesmo)",
                "Muito bem pensado! (Brincadeira, claro)",
                "Entendo perfeitamente... (ou não)",
            ]
        }
        
        responses = fallback_options.get(self.mood, fallback_options["neutral"])
        return random.choice(responses)
    
    def get_state(self):
        """Retorna o estado atual da IA para o frontend"""
        return {
            "name": self.name,
            "mood": self.mood,
            "mood_value": self.mood_value,
            "energy_level": self.energy_level,
            "personality_type": self.personality_type,
            "preferred_voice": self.preferred_voice,
            "user_name": self.user_info["name"],
            "idle_counter": self.idle_counter,
            "topics_discussed": self.topics_discussed,
            "idle_speak_tendency": int(self.idle_speak_tendency * 100),
            "chat_provider": self.chat_provider,
            "chat_model": self.chat_model,
            "chat_temperature": int(self.chat_temperature * 100)
        }
    
    def recharge_energy(self):
        """Recarga energia da IA (tipo um 'descanso')"""
        self.energy_level = min(100, self.energy_level + 30)
        self.mood_value = max(30, self.mood_value + 20)
    
    def get_memory_summary(self):
        """Retorna um resumo da memória/aprendizado sobre o usuário"""
        return {
            "user_name": self.user_info["name"],
            "topics_discussed": self.user_info["topics_discussed"],
            "conversation_count": len([m for m in self.conversation_history if m["role"] == "user"]),
            "interactions": self.conversation_history
        }
