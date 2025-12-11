import torch
from transformers import pipeline
import gc

class ChatAssistant:
    def __init__(self):
        self.pipe = None
        # TROCA DE MODELO: Qwen 2.5 é MUITO melhor em Português e lógica
        self.model_id = "Qwen/Qwen2.5-1.5B-Instruct" 
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_model()

    def load_model(self):
        print(f"--- Carregando Chatbot Inteligente ({self.device}) ---")
        try:
            self.pipe = pipeline(
                "text-generation",
                model=self.model_id,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto"
            )
            print("--- Chatbot Qwen Pronto ---")
        except Exception as e:
            print(f"Erro ao carregar Chatbot: {e}")

    def generate_response(self, user_input):
        if not self.pipe:
            return "Erro: O cérebro do chat não está carregado."

        # --- PROMPT DO SISTEMA EM PORTUGUÊS ---
        # Isso força o modelo a pensar e responder em PT-BR
        messages = [
            {"role": "system", "content": (
                "Você é a SUDO AI, uma assistente virtual especialista em arte e criatividade. "
                "Você fala Português do Brasil fluentemente. "
                "Seja direta, amigável e prestativa. "
                "Se o usuário pedir uma imagem, ajude a descrever a cena visualmente."
            )},
            {"role": "user", "content": user_input}
        ]

        try:
            # O Qwen usa um formato de chat diferente (apply_chat_template)
            # Isso evita que a gente erre a formatação manual
            prompt = self.pipe.tokenizer.apply_chat_template(
                messages, 
                tokenize=False, 
                add_generation_prompt=True
            )

            outputs = self.pipe(
                prompt,
                max_new_tokens=256,
                do_sample=True,
                temperature=0.6,     # Reduzi para 0.6 (menos criatividade louca, mais foco)
                top_p=0.9,
                repetition_penalty=1.15 # Importante: Evita que ele fique repetindo frases
            )
            
            full_text = outputs[0]['generated_text']
            
            # Extrai apenas a resposta do assistente (lógica específica do Qwen/ChatML)
            if "<|im_start|>assistant" in full_text:
                response = full_text.split("<|im_start|>assistant")[-1].strip()
            else:
                # Fallback genérico
                response = full_text[len(prompt):].strip()

            return response

        except Exception as e:
            print(f"Erro no chat: {e}")
            return "Desculpe, tive um pequeno erro de processamento. Pode tentar de novo?"

    def unload(self):
        del self.pipe
        gc.collect()
        torch.cuda.empty_cache()