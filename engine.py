import torch
from diffusers import StableDiffusionPipeline, AutoencoderKL
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
        self.stop_signal = False
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
                from diffusers import DPMSolverMultistepScheduler

                # 1. Carrega em Float32 (Elimina Tela Preta e Erros de Tipo)
                self.pipe = StableDiffusionPipeline.from_pretrained(
                    model_id, 
                    torch_dtype=torch.float32, # Precisão total para estabilidade
                    use_safetensors=True,
                    safety_checker=None, 
                    requires_safety_checker=False
                )

                # 2. Scheduler DPM++ (Recupera a velocidade)
                # Permite usar steps=20 com alta qualidade
                self.pipe.scheduler = DPMSolverMultistepScheduler.from_config(
                    self.pipe.scheduler.config, 
                    use_karras_sigmas=True
                )

                # 3. Otimização de Memória Rápida
                # 'model_cpu_offload' é muito melhor que 'sequential'.
                # Ele mantém o modelo pronto na RAM e joga para a VRAM instantaneamente.
                self.pipe.enable_model_cpu_offload()
                
                # Otimizações extras
                self.pipe.enable_vae_tiling() 
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
            self.current_device = device_name
            self.load_model(device_name)
        return self.current_device

    def _save_to_disk(self, image, prompt):
        folder_name = "imagens_geradas"
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        # Limita o nome do arquivo para evitar erros, mas salva o prompt inteiro no txt
        safe_prompt = re.sub(r'[\\/*?:"<>|]', "", prompt)[:30].replace(" ", "_")
        filename = f"{timestamp}_{safe_prompt}.png"
        
        path = os.path.join(folder_name, filename)
        image.save(path)
        
        # --- NOVO: Salva o prompt completo em um arquivo de texto ---
        txt_filename = f"{timestamp}_{safe_prompt}.txt"
        txt_path = os.path.join(folder_name, txt_filename)
        try:
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(prompt)
        except Exception as e:
            print(f"Erro ao salvar prompt txt: {e}")
            
        print(f"Imagem salva em: {path}")


    def cancel(self):
        """Ativa o sinal de parada"""
        print("!!! SINAL DE CANCELAMENTO RECEBIDO !!!")
        self.stop_signal = True

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
            
        except RuntimeError as e:
            if "CANCELLED_BY_USER" in str(e):
                print("--- Geração abortada com sucesso ---")
                return {"status": "cancelled"}
            print(f"Erro de Runtime: {e}")
            return {"status": "error", "message": str(e)}
            
        except Exception as e:
            print(f"Erro fatal na geração: {e}")
            return {"status": "error", "message": str(e)}