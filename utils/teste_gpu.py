import torch

print("--- DIAGNÓSTICO DE GPU ---")
print(f"PyTorch Version: {torch.__version__}")
try:
    gpu_available = torch.cuda.is_available()
    print(f"CUDA Disponível? {gpu_available}")
    
    if gpu_available:
        print(f"Nome da Placa: {torch.cuda.get_device_name(0)}")
        print("SUCESSO: Agora você pode rodar o 'python app.py'")
    else:
        print("FALHA: O sistema ainda não detecta a GPU.")
        print("Dica: Verifique se instalou o driver da NVIDIA e reiniciou o PC.")
except Exception as e:
    print(f"Erro: {e}")