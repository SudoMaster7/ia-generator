import requests
import urllib.parse

class ChatEngine:
    def __init__(self):
        self.base_url = "https://text.pollinations.ai/"

    def chat(self, message, history=None):
        """
        Envia uma mensagem para a API de texto do Pollinations.
        """
        try:
            # Construção do prompt
            full_prompt = ""
            
            # System instruction
            full_prompt += "Instruction: You are SUDO, a helpful and intelligent AI assistant.\n\n"
            
            if history:
                # Com POST podemos enviar mais contexto
                recent_history = history[-8:] 
                for msg in recent_history:
                    role = "User" if msg['role'] == 'user' else "AI"
                    full_prompt += f"{role}: {msg['content']}\n"
            
            full_prompt += f"User: {message}\nAI:"
            
            print(f"💬 Chat Request: {full_prompt[:50]}...")
            
            # Tenta POST primeiro para suportar textos longos
            # Pollinations aceita o prompt no corpo da requisição POST
            response = requests.post(
                self.base_url, 
                data=full_prompt.encode('utf-8'),
                headers={'Content-Type': 'text/plain'},
                timeout=30
            )
            
            # Se o servidor não aceitar POST (405) ou der erro de cliente (400), tentamos GET com fallback
            if response.status_code >= 400:
                print(f"POST falhou com {response.status_code}, tentando GET truncado...")
                # Trunca severamente para caber na URL
                encoded_prompt = urllib.parse.quote(full_prompt[-500:]) 
                url = f"{self.base_url}{encoded_prompt}"
                response = requests.get(url, timeout=30)
            
            response.raise_for_status()
            return response.text.strip()
            
        except Exception as e:
            print(f"Erro no Chat Engine: {e}")
            return "Desculpe, estou tendo problemas para conectar com meu cérebro na nuvem agora. Tente novamente em instantes."
