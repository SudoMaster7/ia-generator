from transformers import pipeline, set_seed
import random

class MagicPromptGenerator:
    def __init__(self):
        print("--- Carregando Gerador de Prompts (CPU) ---")
        # Usamos um modelo pequeno (GPT-2 fine-tuned) que roda tranquilo na CPU
        # Ele baixa automaticamente na primeira vez (~300MB)
        self.generator = pipeline(
            'text-generation', 
            model='succinctly/text2image-prompt-generator',
            device=-1 # -1 força rodar na CPU para não gastar VRAM da GPU
        )
        print("--- Gerador de Prompts Pronto ---")

    def enhance(self, idea):
        """
        Recebe uma ideia simples (ex: "gato") e retorna um prompt complexo.
        """
        try:
            # Adiciona vírgula se o usuário não botou, para induzir a lista de estilos
            seed_text = idea.strip()
            if not seed_text.endswith(','):
                seed_text += ","

            # Gera variações
            set_seed(random.randint(0, 10000))
            
            # Pede para a IA completar o texto
            result = self.generator(
                seed_text, 
                max_length=random.randint(60, 90), # Tamanho do prompt
                num_return_sequences=1,
                do_sample=True,
                top_k=50, 
                temperature=0.8
            )
            
            generated_text = result[0]['generated_text']
            
            # Limpeza básica (remove quebras de linha estranhas)
            clean_text = generated_text.replace("\n", " ").strip()
            
            # Garante que as palavras mágicas de qualidade estejam no final
            quality_boosters = ", highly detailed, 8k, sharp focus, cinematic lighting"
            if "detailed" not in clean_text:
                clean_text += quality_boosters
                
            return clean_text
            
        except Exception as e:
            print(f"Erro no Magic Prompt: {e}")
            return idea + ", highly detailed, photorealistic, 8k" # Fallback