import torch
from diffusers import StableDiffusionPipeline
import io
import base64
import gc
import time
import os
import re
from datetime import datetime

class ImageGenerator:
    def __init__(self):
        self.current_progress = 0
        self.current_device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipe = None
        self.load_model(self.current_device)

    def load_model(self, target_device):
        print(f"--- Carregando modelo no dispositivo: {target_device} ---")
        
        # Limpa memória antiga
        if self.pipe is not None:
            del self.pipe
            gc.collect()
            torch.cuda.empty_cache()

        model_id = "runwayml/stable-diffusion-v1-5"
        
        try:
            if target_device == "cuda":
                # ESTRATÉGIA BLINDADA GTX 1650:
                # 1. Carregamos tudo em float32 (padrão). Removemos o 'torch_dtype=float16'.
                # Isso resolve o conflito de tipos (Half vs Float) e a tela preta.
                self.pipe = StableDiffusionPipeline.from_pretrained(
                    model_id, 
                    use_safetensors=True,
                    safety_checker=None, 
                    requires_safety_checker=False
                )

                # 2. Gerenciamento Agressivo de Memória
                # Como float32 ocupa o dobro de espaço, usamos o Sequential Offload.
                # Ele move camada por camada para a GPU. É a única forma de rodar float32 em 4GB.
                self.pipe.enable_sequential_cpu_offload()
                
                # Fatiamento de atenção para reduzir picos de memória
                self.pipe.enable_attention_slicing()
                
            else:
                # CPU Fallback
                self.pipe = StableDiffusionPipeline.from_pretrained(
                    model_id, 
                    use_safetensors=True,
                    safety_checker=None,
                    requires_safety_checker=False
                )
                self.pipe.to("cpu")
            
            self.current_device = target_device
            print("--- Modelo carregado (Modo Compatibilidade Total) ---")
            
        except Exception as e:
            print(f"Erro ao carregar modelo: {e}")

    def switch_device(self, device_name):
        if device_name != self.current_device:
            self.load_model(device_name)
        return self.current_device

    def _save_to_disk(self, image, prompt):
        folder_name = "imagens_geradas"
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        safe_prompt = re.sub(r'[\\/*?:"<>|]', "", prompt)[:30].replace(" ", "_")
        filename = f"{timestamp}_{safe_prompt}.png"
        filepath = os.path.join(folder_name, filename)

        try:
            image.save(filepath)
            print(f"✅ Salvo: {filename}")
        except Exception as e:
            print(f"Erro ao salvar: {e}")

    def generate(self, prompt, steps=20): # Reduzi steps padrão para 20 para testar mais rápido
        try:
            self.current_progress = 0
            start_time = time.time()
            
            def callback_fn(step, timestep, latents):
                self.current_progress = int((step / steps) * 100)
            
            print(f"Gerando '{prompt}'...")
            
            # Limpa cache forçado
            gc.collect()
            torch.cuda.empty_cache()

            image = self.pipe(
                prompt, 
                num_inference_steps=steps, 
                callback=callback_fn, 
                callback_steps=1
            ).images[0]
            
            self._save_to_disk(image, prompt)

            end_time = time.time()
            duration = round(end_time - start_time, 2)
            self.current_progress = 100
            
            buffered = io.BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
            return {
                "image": img_str,
                "duration": duration,
                "device": self.current_device.upper(),
                "steps": steps
            }
            
        except Exception as e:
            print(f"Erro fatal na geração: {e}")
            return None