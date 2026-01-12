import asyncio
import edge_tts
import os
import uuid

class VoiceEngine:
    def __init__(self):
        self.output_dir = "templates/static/audio_generated"
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
        
        # Default voice
        self.default_voice = "pt-BR-FranciscaNeural"

    async def _get_voices_async(self):
        """List all available voices."""
        voices = await edge_tts.list_voices()
        # Filter for Portuguese voices for better relevance, or return all
        pt_voices = [v for v in voices if "pt-" in v["ShortName"]]
        return pt_voices

    def get_voices(self):
        """Synchronous wrapper to get voices."""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        return loop.run_until_complete(self._get_voices_async())

    async def _generate_async(self, text, voice, rate, pitch):
        """Generate audio file from text."""
        if not voice:
            voice = self.default_voice
            
        # Format rate and pitch strings
        # edge-tts expects strings like "+0%", "+10Hz"
        if isinstance(rate, int):
            rate_str = f"{rate:+d}%"
        else:
            # Ensure sign if missing for 0 or positive
            rate_str = rate
            if rate_str and rate_str[0] not in ['+', '-']:
                rate_str = f"+{rate_str}"

        if isinstance(pitch, int):
            pitch_str = f"{pitch:+d}Hz"
        else:
            # Ensure sign if missing for 0 or positive
            pitch_str = pitch
            if pitch_str and pitch_str[0] not in ['+', '-']:
                pitch_str = f"+{pitch_str}"

        communicate = edge_tts.Communicate(text, voice, rate=rate_str, pitch=pitch_str)
        
        filename = f"speech_{uuid.uuid4().hex}.mp3"
        output_path = os.path.join(self.output_dir, filename)
        
        await communicate.save(output_path)
        return filename

    def generate(self, text, voice=None, rate="+0%", pitch="+0Hz"):
        """Synchronous wrapper to generate audio."""
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        return loop.run_until_complete(self._generate_async(text, voice, rate, pitch))
