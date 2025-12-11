import torch
from diffusers import DiffusionPipeline
from PIL import Image

# 1. Define the model you want to use from the Hugging Face Hub
# We use a standard Stable Diffusion v1.5 model here.
model_id = "runwayml/stable-diffusion-v1-5"

# 2. Load the pipeline
# Use torch.float16 and "cuda" to optimize for speed and memory on an NVIDIA GPU.
try:
    pipe = DiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        variant="fp16" # Use the float16 variant of the weights if available
    ).to("cuda")
except Exception as e:
    print(f"Error loading model to GPU, falling back to CPU: {e}")
    # Fallback to CPU if GPU is not available or for troubleshooting
    pipe = DiffusionPipeline.from_pretrained(model_id).to("cpu")

# 3. Define your creative prompt
prompt = "An oil painting of a majestic cat roaring in a field of roses, dramatic lighting, detailed, 8k"

# 4. Generate the image
# The 'pipe' object is callable. This runs the full diffusion process.
image = pipe(prompt).images[0]

# 5. Display and save the result
image.show()
image.save("lion_in_sunflowers.png")
print("Image saved as lion_in_sunflowers.png")
