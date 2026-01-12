# 🧪 Guia de Testes - IA Personalizada

## Checklist de Verificação

Use este guia para garantir que tudo está funcionando corretamente.

---

## ✅ Teste 1: Instalação

### 1.1 Verificar Dependências

```bash
python -c "import torch; print('✓ PyTorch OK')"
python -c "import flask; print('✓ Flask OK')"
python -c "import edge_tts; print('✓ Edge-TTS OK')"
python -c "import nest_asyncio; print('✓ Nest-Asyncio OK')"
```

**Resultado Esperado:**
```
✓ PyTorch OK
✓ Flask OK
✓ Edge-TTS OK
✓ Nest-Asyncio OK
```

### 1.2 Criar Pastas Necessárias

```bash
mkdir -p templates/static/ai_speeches
mkdir -p templates/static/audio_generated
```

Verificar:
```bash
ls -la templates/static/
```

**Esperado:** Dois diretórios: `ai_speeches/` e `audio_generated/`

---

## ✅ Teste 2: Iniciar Servidor

### 2.1 Executar

```bash
python app.py
```

**Resultado Esperado:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
 * WARNING: This is a development server. Do not use in production.
```

### 2.2 Verificar Saúde (em outro terminal)

```bash
curl http://localhost:5000/
# Deve retornar HTML da página principal
```

---

## ✅ Teste 3: API Endpoints

### 3.1 Estado Inicial da IA

```bash
curl http://localhost:5000/api/ai-state
```

**Resultado Esperado:**
```json
{
  "name": "Karen",
  "mood": "neutral",
  "mood_value": 50,
  "energy_level": 70,
  "user_name": "Desconhecido",
  "idle_counter": 0,
  "topics_discussed": []
}
```

### 3.2 Enviar Mensagem via API

```bash
curl -X POST http://localhost:5000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá Karen, tudo bem?",
    "history": [],
    "user_name": "João"
  }'
```

**Resultado Esperado:**
```json
{
  "response": "[resposta da IA]",
  "ai_state": {
    "mood": "[novo humor]",
    "mood_value": 50,
    "energy_level": 68,
    "user_name": "João",
    "topics_discussed": []
  },
  "audio_url": "/static/ai_speeches/ai_speech_[timestamp].mp3",
  "audio_saved": true
}
```

### 3.3 Verificar Áudio Gerado

```bash
curl http://localhost:5000/api/audios
```

**Resultado Esperado:**
```json
[
  {
    "filename": "ai_speech_[timestamp].mp3",
    "title": "Olá João! Como você está?",
    "date": "2025-01-12T12:00:00",
    "duration": 2.5,
    "url": "/static/ai_speeches/ai_speech_[timestamp].mp3"
  }
]
```

### 3.4 Verificar Memória

```bash
curl http://localhost:5000/api/ai-memory
```

**Resultado Esperado:**
```json
{
  "user_name": "João",
  "topics_discussed": [],
  "conversation_count": 1,
  "interactions": [...]
}
```

---

## ✅ Teste 4: Interface Web

### 4.1 Página Principal

Abra: `http://localhost:5000/`

**Verificar:**
- [ ] Página carrega sem erros
- [ ] Logo CEREBRO visível
- [ ] Menu de navegação presente

### 4.2 Interface da IA

Abra: `http://localhost:5000/ai`

**Verificar:**
- [ ] Nome "Karen" exibido
- [ ] Ondas de radar aparecem (preto com linhas azuis)
- [ ] Input de texto funciona
- [ ] Botão "Enviar" está visível
- [ ] Botão 🎙️ "Falar" está presente

### 4.3 Escrever Primeira Mensagem

1. Clique no input de texto
2. Digite: "Olá Karen!"
3. Clique "Enviar"

**Esperado:**
- Sua mensagem aparece no lado direito em azul
- A resposta da IA aparece no lado esquerdo em cinza
- Ondas começam a animar
- Áudio começa a tocar (speaker 🔊)

### 4.4 Verificar Sidebar

**Status:**
- [ ] Humor exibido com emoji
- [ ] Barra de energia visível

**Abas:**
- [ ] Aba "Info" mostra informações
- [ ] Aba "Memória" listável
- [ ] Abas de "Imagens" e "Áudios" na galeria

### 4.5 Teste de Voz

1. Clique no botão 🎙️
2. Fale algo (ex: "Como você está?")
3. Espere reconhecer e enviar

**Esperado:**
- Botão fica vermelho pulsante
- Label mostra "🎤 Ouvindo..."
- Mensagem é transcrita e enviada automaticamente
- IA responde

---

## ✅ Teste 5: Fala Espontânea

### 5.1 Esperar Fala Sozinha

1. Vá para a página `/ai`
2. Envie uma mensagem: "Olá"
3. **Não faça nada por 30-40 segundos**
4. Observe se a IA fala por conta própria

**Esperado:**
- Mensagem da IA aparece de repente
- Tem badge 💭 próximo ao timestamp
- Áudio toca automaticamente
- Ondas animam

### 5.2 Verificar Probabilidade

Se não falar no teste anterior:
- Aumentar `idle_speak_tendency` em `ai_personality.py` para 0.9
- Reduzir `min_idle_time` para 2
- Testar novamente

---

## ✅ Teste 6: Galeria

### 6.1 Acessar Galeria

Abra: `http://localhost:5000/gallery`

**Verificar:**
- [ ] Página carrega
- [ ] Abas "Falas da IA" e "Imagens" presentes
- [ ] Aba "Falas" é o padrão

### 6.2 Listar Áudios

A aba de Falas deve mostrar:
- [ ] Reprodutor de áudio
- [ ] Data/hora da fala
- [ ] Texto da fala
- [ ] Controles de volume

### 6.3 Listar Imagens

Clique em "Imagens":
- [ ] Grid de imagens gera
- [ ] Ao clicar em imagem, modal abre
- [ ] Botão "Copiar" copia o prompt

---

## ✅ Teste 7: Mudanças de Humor

### 7.1 Humor Positivo

```
Você: "Obrigado pela ajuda!"
Você: "Você é incrível!"
Você: "Amo conversar com você!"
```

**Esperado:**
- Emoji do mood muda para 😊 (happy)
- Energia sobe
- Respostas mais entusiastas

### 7.2 Humor Negativo

```
Você: "Você é péssima!"
Você: "Isto é horrível!"
```

**Esperado:**
- Emoji muda para 😤 (frustrated)
- Energia diminui
- Respostas mais curtas/sarcásticas

---

## ✅ Teste 8: Extração de Tópicos

### 8.1 Mencionar Vários Tópicos

Converse sobre:
```
"Adoro programação em Python!"
"Que imagem incrível! Gosto muito de arte."
"Você já ouviu essa música? Amo música eletrônica."
```

**Esperado:**
- Sidebar mostra tópicos: "tecnologia, arte, música"
- IA passa a referenciar esses tópicos

---

## ✅ Teste 9: Recarregar Energia

```bash
curl -X POST http://localhost:5000/api/ai-recharge
```

**Esperado:**
- Energy sobe para ~100
- Mood value sobe
- IA fica mais faladora

---

## ✅ Teste 10: Verificação de Arquivos

### 10.1 Verificar Áudios Salvos

```bash
ls -la templates/static/ai_speeches/
```

**Esperado:**
```
total XX
-rw-r--r-- ... ai_speech_20250112_120530_Oi_João.mp3
-rw-r--r-- ... ai_speech_20250112_120600_Como_você_está.mp3
-rw-r--r-- ... speeches_metadata.json
```

### 10.2 Verificar Metadados

```bash
cat templates/static/ai_speeches/speeches_metadata.json | python -m json.tool
```

**Esperado:**
```json
{
  "ai_speech_20250112_120530_Oi_João.mp3": {
    "text": "Oi João! Como você está?",
    "voice": "karen_pt",
    "date": "2025-01-12T12:05:30...",
    "duration": 2.5,
    "file_path": "/templates/static/ai_speeches/..."
  }
}
```

---

## ✅ Teste 11: Múltiplas Personalidades

### 11.1 Trocar para Sarcástica (Padrão)

Em `app.py`, verifique:
```python
ai_personality = PersonalityAI(name="Karen", personality_type="sarcastic")
```

Reinicie e teste.

### 11.2 Trocar para Helpful

```python
ai_personality = PersonalityAI(name="Stella", personality_type="helpful")
```

**Esperado:**
- Respostas mais positivas
- Menos irônicas

### 11.3 Trocar para Mysterious

```python
ai_personality = PersonalityAI(name="JARVIS", personality_type="mysterious")
```

**Esperado:**
- Respostas mais formais
- Tom enigmático

---

## ✅ Teste 12: Performance

### 12.1 Verificar Latência

```bash
time curl -X POST http://localhost:5000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá"}'
```

**Esperado:**
- Resposta em < 3 segundos (depende de internet para chat)
- Áudio gerado em < 5 segundos

### 12.2 Múltiplas Requisições

```bash
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/ai-chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Teste '$i'"}'
done
```

**Esperado:**
- Todas retornam sucesso
- Sem travamentos

---

## ❌ Troubleshooting

### Problema: "ModuleNotFoundError: edge_tts"

```bash
pip install edge-tts
```

### Problema: Áudio não gera

1. Verificar pasta existe:
   ```bash
   mkdir -p templates/static/ai_speeches
   ```

2. Verificar permissões:
   ```bash
   chmod 755 templates/static/ai_speeches
   ```

3. Verificar log no servidor (terminal):
   ```
   ERROR: Erro ao gerar fala: [mensagem]
   ```

### Problema: Voz não reconhece

- Usar Chrome/Edge (melhor suporte)
- Falar claro e lentamente
- Verificar permissões de microfone do navegador

### Problema: IA não fala sozinha nunca

```python
# Aumentar em ai_personality.py
self.idle_speak_tendency = 0.95  # Bem provável
self.min_idle_time = 1           # Bem rápido
```

### Problema: "RuntimeError: no running event loop"

```bash
pip install --upgrade nest-asyncio
```

---

## 📊 Relatório de Teste

Preencha após completar os testes:

```markdown
## Relatório de Testes - [Data]

### Ambiente
- [ ] Python 3.10+
- [ ] CUDA/GPU disponível (ou CPU)
- [ ] 8GB+ RAM

### Testes Básicos
- [ ] Teste 1: Instalação ✓
- [ ] Teste 2: Servidor ✓
- [ ] Teste 3: APIs ✓
- [ ] Teste 4: Web ✓

### Funcionalidades
- [ ] Chat funciona
- [ ] Áudio gera
- [ ] Fala espontânea ocorre
- [ ] Galeria exibe

### Performance
- Latência média: ___ ms
- Tempo TTS: ___ s
- Sem travamentos: Sim/Não

### Problemas Encontrados
(Listar se houver)

### Notas
(Adicionar qualquer observação)
```

---

**Parabéns! Se passou em todos os testes, sua IA está funcionando perfeitamente! 🎉**
