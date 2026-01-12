"""
Gerenciador de Áudios da IA
Responsável por gerar falas, salvar áudios e gerenciar a galeria
"""

import os
import asyncio
import edge_tts
import re
from datetime import datetime
import json
from pathlib import Path

class AudioSpeechManager:
    """
    Gerencia a geração de fala (TTS) das respostas da IA
    e o armazenamento dos áudios gerados
    """
    
    def __init__(self, audio_dir='templates/static/audio_generated', speech_dir='templates/static/ai_speeches'):
        self.audio_dir = audio_dir
        self.speech_dir = speech_dir
        self.metadata_file = os.path.join(self.speech_dir, 'speeches_metadata.json')
        
        # Criar diretórios se não existirem
        os.makedirs(self.audio_dir, exist_ok=True)
        os.makedirs(self.speech_dir, exist_ok=True)
        
        # Carregar metadados existentes
        self.metadata = self._load_metadata()
        
        # Vozes disponíveis em português (edge-tts)
        self.voices = {
            'karen_pt': 'pt-BR-FranciscaNeural',  # Voz feminina (como Karen)
            'male_pt': 'pt-BR-AntonioNeural',     # Voz masculina
            'default': 'pt-BR-FranciscaNeural'
        }
        
        self.voice = self.voices['karen_pt']
    
    def _load_metadata(self):
        """Carrega metadados de áudios já salvos"""
        if os.path.exists(self.metadata_file):
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_metadata(self):
        """Salva metadados dos áudios"""
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.metadata, f, ensure_ascii=False, indent=2)
    
    def _clean_text_for_speech(self, text):
        """
        Remove caracteres especiais e emojis para leitura natural
        Mantém apenas letras, números, espaços e pontuação básica
        """
        # Remover emojis e símbolos especiais
        text = re.sub(r'[^\w\s\.\,\!\?\-\(\)\'\"]', '', text, flags=re.UNICODE)
        
        # Remover espaços múltiplos
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Substituir algumas abreviações comuns
        replacements = {
            r'\bIA\b': 'Inteligência Artificial',
            r'\bTTS\b': 'Síntese de fala',
            r'\bAPI\b': 'Interface de Programação',
        }
        
        for pattern, replacement in replacements.items():
            text = re.sub(pattern, replacement, text)
        
        return text
    
    async def text_to_speech(self, text, speaker='karen_pt'):
        """
        Converte texto em fala usando edge-tts
        
        Args:
            text: Texto a ser convertido
            speaker: Qual voz usar ('karen_pt', 'male_pt', etc)
        
        Returns:
            Caminho do arquivo de áudio gerado
        """
        try:
            # Limpar texto para leitura natural
            clean_text = self._clean_text_for_speech(text)
            
            # Sanitizar nome do arquivo
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Usar primeiros caracteres do texto como nome
            safe_text = "".join(c if c.isalnum() or c in ' -_' else '' 
                               for c in clean_text[:30]).strip()
            safe_text = safe_text.replace(' ', '_')
            
            filename = f"ai_speech_{timestamp}_{safe_text}.mp3"
            filepath = os.path.join(self.speech_dir, filename)
            
            # Selecionar voz
            voice = self.voices.get(speaker, self.voices['default'])
            
            # Criar cliente e gerar fala (usando texto limpo)
            communicate = edge_tts.Communicate(text=clean_text, voice=voice, rate="-10%")
            await communicate.save(filepath)
            
            # Salvar metadados (com texto original)
            self.metadata[filename] = {
                'text': text,
                'voice': speaker,
                'date': datetime.now().isoformat(),
                'duration': self._estimate_duration(clean_text),
                'file_path': filepath
            }
            self._save_metadata()
            
            return filepath, filename
            
        except Exception as e:
            print(f"Erro ao gerar fala: {e}")
            return None, None
    
    def _estimate_duration(self, text):
        """Estima duração da fala baseada no texto"""
        # Aproximação: ~150 palavras por minuto em português
        words = len(text.split())
        duration = max(1, words / 150)  # em minutos
        return round(duration, 2)
    
    def get_speech_list(self):
        """Retorna lista de todas as falas gravadas"""
        speeches = []
        
        for filename, metadata in self.metadata.items():
            speeches.append({
                'filename': filename,
                'title': metadata['text'][:60] + '...' if len(metadata['text']) > 60 else metadata['text'],
                'date': metadata['date'],
                'duration': metadata['duration'],
                'url': f'/static/ai_speeches/{filename}'
            })
        
        # Ordenar por data (mais recente primeiro)
        speeches.sort(key=lambda x: x['date'], reverse=True)
        return speeches
    
    def delete_speech(self, filename):
        """Deleta uma fala e seu metadado"""
        filepath = os.path.join(self.speech_dir, filename)
        
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
                if filename in self.metadata:
                    del self.metadata[filename]
                    self._save_metadata()
                return True
            except:
                return False
        return False
    
    def get_speech_text(self, filename):
        """Retorna o texto de uma fala específica"""
        if filename in self.metadata:
            return self.metadata[filename]['text']
        return None
    
    def search_speeches(self, query):
        """Busca falas por texto"""
        results = []
        query_lower = query.lower()
        
        for filename, metadata in self.metadata.items():
            if query_lower in metadata['text'].lower():
                results.append({
                    'filename': filename,
                    'title': metadata['text'][:60] + '...' if len(metadata['text']) > 60 else metadata['text'],
                    'date': metadata['date'],
                    'url': f'/static/ai_speeches/{filename}'
                })
        
        return results
