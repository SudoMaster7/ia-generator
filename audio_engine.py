import torch
import scipy.io.wavfile
import os
import uuid
import numpy as np
from transformers import pipeline

class AudioGenerator:
    def __init__(self):
        self.synthesiser = None
        self.model_name = "facebook/musicgen-small"
        self.device = 0 if torch.cuda.is_available() else -1
        print(f"Audio Engine initialized. Device: {'CUDA' if self.device == 0 else 'CPU'}")

    def load_model(self):
        if self.synthesiser is None:
            print("Loading MusicGen model... (this might take a while on first run)")
            try:
                self.synthesiser = pipeline("text-to-audio", self.model_name, device=self.device)
                print("MusicGen model loaded successfully.")
            except Exception as e:
                print(f"Error loading MusicGen: {e}")
                raise e

    def generate(self, prompt, output_dir):
        """
        Generates audio from a text prompt.
        Returns the filename of the generated audio.
        """
        self.load_model()
        
        print(f"Generating audio for prompt: {prompt}")
        
        # Generate audio
        # forward_params={"do_sample": True} allows for more creative generation
        # max_new_tokens: ~256 tokens = 5 segundos. 1500 tokens ~= 30 segundos.
        music = self.synthesiser(prompt, forward_params={"do_sample": True, "max_new_tokens": 1500})
        
        audio_data = music["audio"]
        sampling_rate = music["sampling_rate"]
        
        # Ensure numpy array
        if not isinstance(audio_data, np.ndarray):
            audio_data = np.array(audio_data)
            
        # Handle dimensions: MusicGen output is usually (batch, channels, samples) or (channels, samples)
        # We want (samples,) for mono or (samples, channels) for stereo for scipy
        
        # Remove batch dimension if present
        if audio_data.ndim == 3:
            audio_data = audio_data[0] # -> (channels, samples)
            
        # Handle channels
        if audio_data.ndim == 2:
            # If shape is (1, samples), flatten to (samples,)
            if audio_data.shape[0] == 1:
                audio_data = audio_data[0]
            else:
                # If (channels, samples), transpose to (samples, channels)
                audio_data = audio_data.T
        
        # Normalize and convert to int16 to avoid struct errors and ensure compatibility
        if audio_data.dtype.kind == 'f':
            # Normalize to -1..1 if not already
            max_val = np.max(np.abs(audio_data))
            if max_val > 0:
                audio_data = audio_data / max_val
            
            # Convert to 16-bit PCM
            audio_data = (audio_data * 32767).astype(np.int16)
        
        # Generate unique filename
        filename = f"audio_{uuid.uuid4().hex}.wav"
        output_path = os.path.join(output_dir, filename)
        
        # Save to file
        scipy.io.wavfile.write(output_path, rate=sampling_rate, data=audio_data)
        
        return filename
