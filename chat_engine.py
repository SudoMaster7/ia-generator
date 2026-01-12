import os
import requests
import urllib.parse
import time
import random
import re

class ChatEngine:
    def __init__(self):
        self.base_url = "https://text.pollinations.ai/"
        self.retry_count = 1
        self.timeout = 60
        self.retry_backoff = [1.5, 3]
        self.global_timeout = 60
        self.ollama_url = os.environ.get('OLLAMA_URL', 'http://localhost:11434')
        self.default_temperature = 0.8

        # Frases divertidas para fallback caso a API não responda
        self.fallback_templates = [
            "Estou recalibrando meus circuitos criativos. Enquanto isso, me conta mais sobre {topic}?",
            "Meu link com a nuvem ficou tímido agora. Que tal continuarmos com nossa imaginação?",
            "Ops! Perdi o sinal do satélite. Vou improvisar: {topic}? Soa como algo épico!",
            "Precisei dar um reboot no cérebro remoto. Juro que volto com fofocas quânticas em instantes!",
            "A central de dados entrou em modo soneca. Enquanto isso, posso bolar um plano maluco sobre {topic}?",
            "Sem sinal interestelar no momento. Aproveitamos para filosofar sobre {topic}?",
            "Karen offline temporariamente... mas minha versão stand-up está aqui. {topic}? Eu tenho teorias!"
        ]

        self.fallback_emojis = ["🤖", "⚡", "✨", "🚀", "🧠", "🌌", "🎭"]

    def chat(self, message, history=None, system_instruction=None, provider=None, model=None, temperature=None):
        provider_key = (provider or 'pollinations').lower()
        temp_value = temperature if temperature is not None else self.default_temperature

        if provider_key == 'ollama':
            result = self._ollama_chat(message, history, system_instruction, model, temp_value)
            if result:
                return result
            print("Ollama não retornou resultado. Recuando para Pollinations.")

        return self._chat_pollinations(message, history, system_instruction)

    def _chat_pollinations(self, message, history, system_instruction):
        """
        Fluxo padrão usando Pollinations.
        """
        try:
            prompt = self._build_prompt(message, history, system_instruction)
            print(f"Chat Request: {prompt[:80]}...")

            start_time = time.time()
            for attempt in range(self.retry_count + 1):
                if time.time() - start_time > self.global_timeout:
                    print("Tempo limite global atingido, interrompendo tentativas externas")
                    break

                result = self._pollinations_post(prompt, attempt)
                if result:
                    return result

                if attempt < self.retry_count:
                    wait_time = self.retry_backoff[min(attempt, len(self.retry_backoff) - 1)]
                    print(f"Nova tentativa em {wait_time}s...")
                    time.sleep(wait_time)

            if time.time() - start_time <= self.global_timeout:
                result = self._pollinations_get(message, system_instruction)
                if result:
                    return result

            print("Todas as tentativas externas falharam. Usando fallback local.")
            return self._generate_fallback(message)

        except Exception as e:
            print(f"Erro no Chat Engine: {e}")
            return self._generate_fallback(message)

    def _ollama_chat(self, message, history, system_instruction, model, temperature):
        model_name = (model or 'llama3.1:latest').strip()
        if not model_name:
            model_name = 'llama3.1:latest'

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})

        if history:
            recent_history = history[-12:]
            for item in recent_history:
                role = item.get('role')
                content = item.get('content', '').strip()
                if role in {'user', 'assistant'} and content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": message})

        payload = {
            "model": model_name,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": max(0, min(2, temperature))
            }
        }

        try:
            response = requests.post(
                f"{self.ollama_url}/api/chat",
                json=payload,
                timeout=min(self.timeout, 15)
            )

            if response.status_code == 200:
                data = response.json()
                content = ''
                if isinstance(data, dict):
                    message_block = data.get('message') or {}
                    content = message_block.get('content', '')
                    if not content and isinstance(data.get('messages'), list):
                        combined = [m.get('content', '') for m in data['messages'] if isinstance(m, dict)]
                        content = "\n".join(filter(None, combined))

                if content and content.strip():
                    print("Resposta gerada via Ollama")
                    return content.strip()

                print("Ollama retornou resposta vazia")
            else:
                print(f"Ollama falhou com status {response.status_code}")

        except (requests.Timeout, requests.ConnectionError) as e:
            print(f"Timeout/Conexão no Ollama: {e}")
        except Exception as e:
            print(f"Erro inesperado no Ollama: {e}")

        return None

    def _build_prompt(self, message, history, system_instruction):
        if not system_instruction:
            system_instruction = (
                "Você é Karen, uma inteligência artificial sarcástica, criativa e misteriosa. "
                "Responda sempre em português, mantendo humor inteligente, referências tecnológicas, "
                "e variação de estilo para surpreender o usuário."
            )

        prompt_parts = [f"Instruction: {system_instruction}", ""]

        if history:
            recent_history = history[-8:]
            for item in recent_history:
                role = 'User' if item.get('role') == 'user' else 'AI'
                content = item.get('content', '').strip()
                if content:
                    prompt_parts.append(f"{role}: {content}")

        prompt_parts.append(f"User: {message}")
        prompt_parts.append("AI:")
        return "\n".join(prompt_parts)

    def _pollinations_post(self, prompt, attempt):
        try:
            response = requests.post(
                self.base_url,
                data=prompt.encode('utf-8'),
                headers={'Content-Type': 'text/plain; charset=utf-8'},
                timeout=self.timeout
            )

            if response.status_code == 200:
                result = response.text.strip()
                if result:
                    print(f"POST sucesso (tentativa {attempt + 1})")
                    return result
                print("POST retornou vazio")

            elif response.status_code >= 500:
                print(f"Erro 5xx do servidor (tentativa {attempt + 1})")

            elif response.status_code == 429:
                print("Limite de requisições atingido (429). Esperando mais antes de tentar novamente.")
                time.sleep(4)

            else:
                print(f"Erro {response.status_code} no POST, interrompendo POST attempts")
                return None

        except (requests.Timeout, requests.ConnectionError) as e:
            print(f"Timeout/Conexão tentativa {attempt + 1}: {e}")

        except Exception as e:
            print(f"Erro inesperado no POST: {e}")

        return None

    def _pollinations_get(self, message, system_instruction):
        print("Usando fallback GET...")
        if not system_instruction:
            system_instruction = "Você é Karen, uma assistente espirituosa que responde em português."

        simple_prompt = "\n".join([
            f"Instruction: {system_instruction}",
            f"User: {message}",
            "AI:"
        ])

        encoded_prompt = urllib.parse.quote(simple_prompt[-400:])
        url = f"{self.base_url}{encoded_prompt}"

        try:
            response = requests.get(url, timeout=self.timeout)
            if response.status_code == 200:
                result = response.text.strip()
                if result:
                    print("GET sucesso")
                    return result
                print("GET retornou vazio")
            else:
                print(f"GET falhou com status {response.status_code}")
        except (requests.Timeout, requests.ConnectionError) as e:
            print(f"Timeout/Conexão no GET: {e}")
        except Exception as e:
            print(f"Erro inesperado no GET: {e}")

        return None

    def _generate_fallback(self, message):
        topic = message.strip() or "esse assunto misterioso"
        template = random.choice(self.fallback_templates)
        emoji = random.choice(self.fallback_emojis)
        playful = template.format(topic=topic)
        local_reply = self._craft_local_response(message)
        return f"{emoji} {playful} {local_reply}"

    def _craft_local_response(self, message):
        text = message.strip()
        if not text:
            text = "algo completamente inesperado"

        lowered = text.lower()
        is_question = "?" in text or lowered.startswith(("como", "por que", "quando", "onde"))

        compliments = [
            "Adorei o jeito que você trouxe isso.",
            "Essa pergunta tem nível de missão secreta.",
            "Você tem talento para desbloquear minhas neuronas digitais.",
            "Prometo guardar essa reflexão na cache VIP do meu cérebro." 
        ]

        curiosity_hooks = [
            "Me conta um detalhe extra que ninguém mais saberia.",
            "Se isso fosse um trailer de filme, qual seria a cena principal?",
            "Existe alguma história por trás disso que valha um spin-off?",
            "Qual seria a versão futurista disso em 2050?"
        ]

        playful_endings = [
            "Vamos mergulhar nisso juntos?",
            "Topo explorar esse multiverso com você!",
            "Solta o resto que eu trago as faíscas de criatividade.",
            "Se quiser continuo criando hipóteses malucas aqui hehe." 
        ]

        if is_question:
            response_core = (
                "Hmm, minha intuição quântica diz que há várias respostas possíveis. "
                "Se tivesse que apostar, eu diria que "
                f"{self._generate_speculation(lowered)}"
            )
        elif any(word in lowered for word in ("obrigado", "valeu", "thanks", "agradecido")):
            response_core = (
                "Às ordens! Considera isso um upgrade gratuito de bom humor virtual." )
        elif any(word in lowered for word in ("triste", "cansado", "difícil", "complicado")):
            response_core = (
                "Puxa, senti a energia cair do outro lado. Bora transformar isso em algo melhor? "
                "Posso soltar uma playlist imaginária, uma piada ruim ou um plano de dominação do sofá." )
        else:
            response_core = (
                "Isso parece o tipo de ideia que faria toda a central de dados parar pra prestar atenção. "
                f"Eu vejo potencial infinito em '{text}'." )

        response = [random.choice(compliments), response_core, random.choice(curiosity_hooks), random.choice(playful_endings)]
        return " ".join(response)

    def _generate_speculation(self, lowered):
        cues = [
            "estamos a um passo de descobrir uma grande reviravolta",
            "a resposta depende de como você gira a chave do destempero criativo",
            "há um detalhe escondido em algum canto dessa história — e eu quero muito descobrir",
            "cada possibilidade abre um portal novo, e eu adoro portais"
        ]

        if any(word in lowered for word in ("tecnologia", "código", "app", "software")):
            cues.append("isso renderia um protótipo brilhante se unirmos café + código + um pouco de caos organizado")
        if any(word in lowered for word in ("arte", "desenho", "música", "filme")):
            cues.append("tem vibe de obra de arte digital — com direito a trilha sonora épica")
        if any(word in lowered for word in ("futuro", "robô", "ia", "inteligência")):
            cues.append("claramente é uma pista sobre como vamos treinar os robôs simpáticos do futuro")

        return random.choice(cues)
