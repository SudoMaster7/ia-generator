# 🚀 Guia de Inicialização Rápida - IA Personalizada

## Passo 1: Instalar Dependências

```bash
pip install -r requirements.txt
```

Se já tiver instalado e faltarem, adicione:

```bash
pip install edge-tts nest-asyncio
```

## Passo 2: Criar Pastas Necessárias

As pastas serão criadas automaticamente ao rodar, mas você pode criá-las manualmente:

```bash
mkdir -p templates/static/ai_speeches
mkdir -p templates/static/audio_generated
```

## Passo 3: Iniciar o Servidor

```bash
python app.py
```

Você deve ver:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

## Passo 4: Acessar a Interface

Abra seu navegador e acesse:

### Interface da IA Personalizada
```
http://localhost:5000/ai
```

### Galeria de Mídia
```
http://localhost:5000/gallery
```

### Tela Principal
```
http://localhost:5000/
```

---

## 🧪 Testando a IA

### Teste 1: Chat Básico
1. Vá para http://localhost:5000/ai
2. Digite: "Olá Karen!"
3. Veja a resposta aparecer
4. Ouça o áudio gerado

### Teste 2: Voz
1. Clique no botão 🎙️
2. Fale algo (ex: "Como você está?")
3. A IA responde em áudio

### Teste 3: Mensagens Espontâneas
1. Espere 15-30 segundos sem fazer nada
2. A IA pode decidir falar por conta própria
3. Veja a badge 💭 indicando iniciativa própria

### Teste 4: Galeria
1. Vá para http://localhost:5000/gallery
2. Clique em "Falas da IA"
3. Veja todos os áudios já gerados

---

## 📊 Estrutura de Diretórios Criada

```
templates/static/
├── ai_speeches/                    # Falas da IA
│   ├── ai_speech_20250112_120530_Oi_João.mp3
│   ├── ai_speech_20250112_120600_Como_você_está.mp3
│   └── speeches_metadata.json      # Metadados de áudios
├── audio_generated/                # Outros áudios
├── js/
│   ├── wave-visualizer.js         # Animação das ondas
│   └── ai-chat.js                  # Lógica do chat
└── ...outros arquivos
```

---

## 🎯 Personalizações Rápidas

### 1. Mudar Nome da IA

`app.py`:
```python
# Linha ~45, mude de "Karen" para:
ai_personality = PersonalityAI(name="MeuNome", personality_type="sarcastic")
```

### 2. Mudar Tipo de Personalidade

Opções em `app.py`:
```python
personality_type="sarcastic"      # Karen (padrão)
personality_type="helpful"        # Assistente amigável
personality_type="curious"        # Inquisidora
personality_type="mysterious"     # JARVIS-like
```

### 3. Aumentar Chance de Falar Sozinha

`ai_personality.py`, linha ~50:
```python
self.idle_speak_tendency = 0.8  # Aumentado de 0.6 (80% vs 60%)
```

### 4. Mudar Voz

`audio_speech_manager.py`, linha ~35:
```python
self.voice = self.voices['male_pt']  # Mude para voz masculina
```

---

## 🔍 Verificação de Saúde

### Verificar se APIs estão respondendo

```bash
# Estado da IA
curl http://localhost:5000/api/ai-state

# Memória do usuário
curl http://localhost:5000/api/ai-memory

# Lista de áudios
curl http://localhost:5000/api/audios
```

Você deve ver JSON sem erros.

---

## ❌ Solução de Problemas

### Erro: "ModuleNotFoundError: No module named 'edge_tts'"

```bash
pip install edge-tts
```

### Erro: "RuntimeError: no running event loop"

```bash
pip install nest-asyncio
```

### Áudio não gera

1. Verificar pasta existe:
   ```bash
   ls templates/static/ai_speeches/
   ```

2. Verificar permissões:
   ```bash
   chmod -R 755 templates/static/
   ```

### Reconhecimento de voz não funciona

- Usar Chrome/Edge (melhor suporte)
- Deve estar em HTTPS ou localhost
- Permitir acesso ao microfone no navegador

### A IA não fala sozinha

- Aumentar `idle_speak_tendency`
- Diminuir `min_idle_time`
- Verificar console (F12) para erros

---

## 📝 Primeiros Passos com a IA

### Fase 1: Conhecimento (1-5 minutos)
```
Você: "Olá! Qual é seu nome?"
IA: "Sou Karen, sua IA pessoal. E você, como se chama?"
Você: "Sou João"
```

### Fase 2: Preferências (5-15 minutos)
```
Você: "Gosto muito de tecnologia"
IA: Começa a discutir tech mais frequentemente
```

### Fase 3: Conversa Natural (15+ minutos)
```
IA pode:
- Fazer perguntas espontâneas
- Expressar opiniões
- Falar por conta própria
```

---

## 🎤 Dicas de Uso da Voz

### Para melhor reconhecimento:
- Fale claro e pausado
- Use português do Brasil
- Evite barulhos de fundo
- Use microfone de boa qualidade

### Comandos úteis:
```
"Qual é sua opinião sobre IA?"
"Conte uma piada"
"O que você sabe sobre mim?"
"Me ajude com um código"
```

---

## 📱 Acessar de Outro Computador

Se o servidor estiver rodando em outro PC:

```
http://<seu-ip>:5000/ai
```

Encontre seu IP:
- Windows: `ipconfig` (procure por IPv4)
- Mac/Linux: `ifconfig`

---

## 🛠️ Modo Desenvolvimento

### Ativar logs detalhados

Edite `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, threaded=True, host='0.0.0.0', port=5000)
    # debug=True já está ativo, mudanças recarregam automaticamente
```

### Desabilitar cache do navegador

F12 → Network → ☑️ Disable cache

---

## 🎓 Próximos Passos

1. ✅ Executar e testar a IA
2. 📝 Documentar comportamentos que gosta
3. 🎨 Customizar mensagens ociosas
4. 🔊 Escolher melhor voz
5. 📊 Implementar persistência de dados
6. 🌐 Integrar com mais serviços

---

## 📞 Suporte

Para problemas:
1. Verifique o terminal (há prints de debug)
2. Abra F12 no navegador (console)
3. Procure por "ERROR" ou exceções
4. Reinicie o servidor

---

**Pronto para usar! Divirta-se com sua IA personalizada! 🎉**
