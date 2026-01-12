/**
 * Sistema de Chat com IA Personalizada - MELHORADO
 * Gerencia interações, visualização de ondas e integração com backend
 */

class AIChatSystem {
    constructor() {
        // Elementos do DOM
        this.chatHistory = document.getElementById('chat-history');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.voiceBtn = document.getElementById('voice-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.waveLabel = document.getElementById('wave-label');
        this.waveContainer = document.getElementById('wave-container');
        this.moodDisplay = document.getElementById('mood-display');
        this.energyBar = document.getElementById('energy-bar');
        this.statusDisplay = document.getElementById('status-display');
        this.providerSelect = document.getElementById('chat-provider-select');
        this.modelInput = document.getElementById('chat-model-input');
        this.loadingBanner = document.getElementById('loading-banner');
        this.loadingText = document.getElementById('loading-text');
        this.loadingCancelBtn = document.getElementById('loading-cancel');
        
        // Estado
        this.aiState = {};
        this.isListening = false;
        this.isProcessing = false;
        this.isPlayingAudio = false; // NOVO: controlar áudio ativo
        this.currentAudio = null; // Rastrear áudio atualmente tocando
        this.conversationHistory = [];
        this.pendingController = null;
        this.loadingTimeout = null;
        this.cancelledByUser = false;
        
        // Reconhecimento de voz
        this.recognition = null;
        this.initVoiceRecognition();
        
        // Eventos
        this.setupEventListeners();
        this.loadInitialState();
        
        // Comportamento ocioso desativado para evitar falas aleatórias em segundo plano
        this.idleCheckInterval = null;

        this.handleProviderChange();
                this.updateSendButton();
    }

    quickCommand(command) {
        /**
         * Executa um comando rápido
         */
        const commands = {
            'hora': 'Que horas são agora?',
            'piada': 'Conte uma piada engraçada para me animar!',
            'noticia': 'Me conte uma notícia interessante de hoje',
            'dica': 'Dê-me uma dica de produtividade',
            'poesia': 'Escreva uma poesia criativa'
        };
        
        const message = commands[command] || command;
        this.messageInput.value = message;
        this.handleSendMessage();
    }

    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'pt-BR';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceBtn.classList.add('recording');
                this.waveLabel.textContent = '🎤 Ouvindo...';
                window.waveVisualizer?.startAnimation();
            };
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i].transcript;
                    if (event.results[i].isFinal) {
                        if (transcript.trim()) {
                            this.sendMessage(transcript.trim());
                        }
                    } else {
                        interimTranscript += transcript;
                    }
                }
                if (interimTranscript) {
                    this.messageInput.value = interimTranscript;
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceBtn.classList.remove('recording');
                this.waveLabel.textContent = '🎤 Aguardando...';
                window.waveVisualizer?.stopAnimation();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Erro de reconhecimento:', event.error);
                this.waveLabel.textContent = `❌ Erro: ${event.error}`;
            };
        }
    }

    setupEventListeners() {
        // Enviar mensagem
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        
        // Enviar ao pressionar Enter
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });
        
        // Voice button
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        
        // Settings button
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Settings Modal close button
        const closeBtn = document.querySelector('#settings-modal .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Settings Modal save button
        const saveBtn = document.querySelector('#settings-modal .save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
        
        // Settings Modal cancel button
        const cancelBtn = document.querySelector('#settings-modal .cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Sliders para mostrar valores em tempo real
        const moodSlider = document.getElementById('mood-slider');
        if (moodSlider) {
            moodSlider.addEventListener('input', () => this.updateMoodDisplay());
        }
        
        const energySlider = document.getElementById('energy-slider');
        if (energySlider) {
            energySlider.addEventListener('input', () => this.updateEnergyDisplay());
        }
        
        const tendencySlider = document.getElementById('tendency-slider');
        if (tendencySlider) {
            tendencySlider.addEventListener('input', () => this.updateTendencyDisplay());
        }

        if (this.providerSelect) {
            this.providerSelect.addEventListener('change', () => this.handleProviderChange());
        }
        
        if (this.loadingCancelBtn) {
            this.loadingCancelBtn.addEventListener('click', () => this.cancelPendingRequest());
        }

        // Fechar modal ao clicar fora
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeSettings();
                }
            });
        }
        
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target));
        });
        
        // Focus no input
        this.messageInput.focus();
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('active');
        
        // Carregar valores atuais
        document.getElementById('ai-name-input').value = this.aiState.name || 'Karen';
        document.getElementById('mood-slider').value = this.aiState.mood_value || 50;
        document.getElementById('energy-slider').value = this.aiState.energy_level || 70;
        document.getElementById('topics-input').value = (this.aiState.topics_discussed || []).join(', ');
        
        const personalitySelect = document.getElementById('personality-select');
        if (personalitySelect) {
            personalitySelect.value = this.aiState.personality_type || 'sarcastic';
        }

        const voiceSelect = document.getElementById('voice-select');
        if (voiceSelect) {
            voiceSelect.value = this.aiState.preferred_voice || 'karen_pt';
        }

        if (this.providerSelect) {
            this.providerSelect.value = this.aiState.chat_provider || 'pollinations';
        }

        if (this.modelInput) {
            this.modelInput.value = this.aiState.chat_model || '';
        }

        this.handleProviderChange();

        const tendencySlider = document.getElementById('tendency-slider');
        if (tendencySlider) {
            const tendencyValue = typeof this.aiState.idle_speak_tendency === 'number'
                ? this.aiState.idle_speak_tendency
                : 60;
            tendencySlider.value = tendencyValue;
        }
        
        this.updateMoodDisplay();
        this.updateEnergyDisplay();
        this.updateTendencyDisplay();
    }

    handleSendMessage() {
        if (this.isProcessing) {
            this.cancelPendingRequest();
            return;
        }

        if (this.isPlayingAudio) {
            this.stopAudioPlayback(true);
            return;
        }

        const message = this.messageInput.value.trim();
        if (message && !this.isProcessing) {
            this.sendMessage(message);
        }
    }

    async sendMessage(message) {
        if (this.isProcessing) return;
        
        this.stopAudioPlayback();
        this.isProcessing = true;
        this.cancelledByUser = false;
        this.updateSendButton();
        
        // Adicionar mensagem do usuário ao histórico visual
        this.addMessageToChat('user', message);
        this.messageInput.value = '';
        this.messageInput.focus();
        
        // Animar ondas enquanto processa
        this.waveLabel.textContent = '🧠 Pensando...';
        window.waveVisualizer?.startAnimation();
        this.showLoadingBanner('Processando sua resposta...', false);
        this.scheduleLoadingEscalation();
        
        const controller = new AbortController();
        this.pendingController = controller;
        
        try {
            // Enviar para backend
            const response = await axios.post('/api/ai-chat', {
                message: message,
                history: this.conversationHistory
            }, {
                signal: controller.signal
            });
            
            const aiMessage = response.data.response;
            const newState = response.data.ai_state;
            
            // Atualizar estado da IA
            if (newState) {
                this.updateAIState(newState);
            }
            
            // Adicionar resposta ao histórico
            this.addMessageToChat('ai', aiMessage);
            this.conversationHistory.push({ role: 'user', content: message });
            this.conversationHistory.push({ role: 'assistant', content: aiMessage });
            
            // Gerar áudio da resposta
            if (response.data.audio_url) {
                this.playAudioResponse(response.data.audio_url);
            }
            
            // Salvar áudio da fala da IA
            if (response.data.audio_saved) {
                this.updateAudioGallery();
            }
            
        } catch (error) {
            const isCanceled = error && (error.code === 'ERR_CANCELED' || error.message === 'canceled');
            if (isCanceled) {
                if (this.cancelledByUser) {
                    this.addMessageToChat('ai', '⚠️ Resposta cancelada a pedido.');
                }
                this.waveLabel.textContent = '🚫 Cancelado.';
            } else {
                console.error('Erro ao enviar mensagem:', error);
                this.addMessageToChat('ai', '❌ Desculpe, tive um problema ao processar sua mensagem.');
            }
        } finally {
            this.clearLoadingIndicator();
            this.pendingController = null;
            this.isProcessing = false;
            if (!this.isPlayingAudio) {
                this.waveLabel.textContent = '🎤 Aguardando...';
                window.waveVisualizer?.stopAnimation();
            }
            this.updateSendButton();
        }
    }

    async checkAIIdle() {
        /**
         * Verifica periodicamente se a IA quer falar sozinha
         * NÃO fala enquanto há áudio tocando
         */
        // Pular verificação se áudio está tocando
        if (this.isPlayingAudio) {
            return;
        }
        
        try {
            const response = await axios.get('/api/ai-idle');
            
            if (response.data.should_speak) {
                const message = response.data.message;
                const newState = response.data.ai_state;
                
                // Atualizar estado
                if (newState) {
                    this.updateAIState(newState);
                }
                
                // Mostrar que a IA está falando
                this.waveLabel.textContent = '💭 A IA quer falar...';
                window.waveVisualizer?.startAnimation();
                
                // Adicionar mensagem ao chat
                this.addMessageToChat('ai', message, true); // true = iniciativa própria
                
                // Gerar áudio se disponível
                if (response.data.audio_url) {
                    this.playAudioResponse(response.data.audio_url);
                }
                
                // Parar animação após 5 segundos
                setTimeout(() => {
                    this.waveLabel.textContent = '🎤 Aguardando...';
                    window.waveVisualizer?.stopAnimation();
                }, 5000);
            }
        } catch (error) {
            // Silenciosamente ignorar erros em verificações ociosas
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Reconhecimento de voz não suportado no seu navegador');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.messageInput.value = '';
            this.recognition.start();
        }
    }

    addMessageToChat(role, content, isInitiative = false) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        
        const timestamp = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Formatar o conteúdo da mensagem
        const formattedContent = this.formatMessageText(content);
        
        const badge = isInitiative && role === 'ai' ? ' 💭' : '';
        
        messageEl.innerHTML = `
            <div class="message-text">${formattedContent}</div>
            <div class="message-time">${timestamp}${badge}</div>
        `;
        
        this.chatHistory.appendChild(messageEl);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    formatMessageText(text) {
        /**
         * Formata texto com suporte a:
         * - Quebras de linha
         * - **negrito**
         * - *itálico*
         * - `código`
         * - Listas com - ou *
         */
        
        // Escapar HTML especial (exceto tags que vamos criar)
        let formatted = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Converter **texto** em <strong>
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Converter *texto* em <em>
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        // Converter `código` em <code>
        formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
        
        // Preservar quebras de linha
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    updateAIState(state) {
        if (state) {
            this.aiState = state;
        }
        
        const state_to_use = state || this.aiState;
        
        // Atualizar nome da IA no header
        const aiNameHeader = document.getElementById('ai-name');
        if (aiNameHeader && state_to_use.name) {
            aiNameHeader.textContent = state_to_use.name;
        }

        const aiNameSubHeader = document.getElementById('ai-name-header');
        if (aiNameSubHeader && state_to_use.name) {
            aiNameSubHeader.textContent = state_to_use.name;
        }

        const infoName = document.getElementById('info-name');
        if (infoName && state_to_use.name) {
            infoName.textContent = state_to_use.name;
        }

        const personalityLabels = {
            'sarcastic': 'Sarcástica',
            'helpful': 'Prestativa',
            'curious': 'Curiosa',
            'mysterious': 'Misteriosa'
        };

        const infoPersonality = document.getElementById('info-personality');
        if (infoPersonality) {
            const persona = personalityLabels[state_to_use.personality_type] || 'Personalizada';
            infoPersonality.textContent = persona;
        }

        const voiceLabels = {
            'karen_pt': 'Feminina',
            'male_pt': 'Masculina'
        };

        const infoVoice = document.getElementById('info-voice');
        if (infoVoice) {
            infoVoice.textContent = voiceLabels[state_to_use.preferred_voice] || 'Desconhecida';
        }

        const providerLabels = {
            'pollinations': 'Pollinations (nuvem)',
            'ollama': 'Ollama local'
        };

        const providerKey = state_to_use.chat_provider || 'pollinations';

        if (this.providerSelect) {
            this.providerSelect.value = providerKey;
            this.handleProviderChange();
        }

        if (this.modelInput) {
            this.modelInput.value = state_to_use.chat_model || '';
        }

        const infoProvider = document.getElementById('info-provider');
        if (infoProvider) {
            infoProvider.textContent = providerLabels[providerKey] || 'Padrão';
        }

        const infoModel = document.getElementById('info-model');
        if (infoModel) {
            infoModel.textContent = state_to_use.chat_model && state_to_use.chat_model.trim() ? state_to_use.chat_model : 'Automático';
        }
        
        // Atualizar humor
        const moodEmojis = {
            'happy': '😊',
            'neutral': '😐',
            'curious': '🤔',
            'sarcastic': '😏',
            'frustrated': '😤'
        };
        
        const emoji = moodEmojis[state_to_use.mood] || '😐';
        const moodText = state_to_use.mood ? state_to_use.mood.charAt(0).toUpperCase() + state_to_use.mood.slice(1) : 'Neutro';
        this.moodDisplay.textContent = `${emoji} ${moodText}`;
        
        // Atualizar energia
        const energyPercent = state_to_use.energy_level || 70;
        this.energyBar.style.width = energyPercent + '%';
        
        // Cor da barra baseada na energia
        if (energyPercent > 70) {
            this.energyBar.style.background = '#00ff00';
        } else if (energyPercent > 40) {
            this.energyBar.style.background = '#ffff00';
        } else {
            this.energyBar.style.background = '#ff6b6b';
        }
        
        // Atualizar status
        this.statusDisplay.textContent = '🟢 Online';
        
        // Atualizar memória
        this.updateMemoryDisplay(state_to_use);
    }

    updateMemoryDisplay(state) {
        const userNameDisplay = document.getElementById('user-name-display');
        if (userNameDisplay) {
            userNameDisplay.textContent = state.user_name || 'Desconhecido';
        }

        const topicsDisplay = document.getElementById('topics-display');
        if (topicsDisplay) {
            const topics = state.topics_discussed || [];
            topicsDisplay.textContent = topics.length > 0 ? topics.join(', ') : 'Nenhum ainda';
        }

        const interactionCount = document.getElementById('interaction-count');
        if (interactionCount) {
            interactionCount.textContent = Math.floor(this.conversationHistory.length / 2);
        }
    }

    playAudioResponse(audioUrl) {
        /**
         * Toca o áudio da resposta da IA
         * Evita fala simultânea: para qualquer áudio anterior
         */
        // Parar qualquer áudio que estava tocando
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        
        audio.onplay = () => {
            // Iniciar reprodução - prevenir fala espontânea
            this.isPlayingAudio = true;
            this.waveLabel.textContent = '🔊 Falando...';
            window.waveVisualizer?.startAnimation();
            this.waveContainer.classList.add('ai-speaking');
            this.updateSendButton();
        };
        
        audio.onended = () => {
            // Áudio terminou - permitir fala espontânea novamente
            this.isPlayingAudio = false;
            this.currentAudio = null;
            this.waveLabel.textContent = '🎤 Aguardando...';
            window.waveVisualizer?.stopAnimation();
            this.waveContainer.classList.remove('ai-speaking');
            this.updateSendButton();
        };
        
        audio.onerror = () => {
            console.error('Erro ao tocar áudio');
            this.isPlayingAudio = false;
            this.currentAudio = null;
            this.updateSendButton();
        };
        
        audio.play().catch(e => {
            console.error('Erro ao reproduzir áudio:', e);
            this.isPlayingAudio = false;
            this.currentAudio = null;
            this.updateSendButton();
        });
    }

    async loadInitialState() {
        try {
            const response = await axios.get('/api/ai-state');
            this.updateAIState(response.data);
        } catch (error) {
            console.error('Erro ao carregar estado inicial:', error);
        }
    }

    async updateAudioGallery() {
        try {
            const response = await axios.get('/api/audios');
            this.displayAudioGallery(response.data);
        } catch (error) {
            console.error('Erro ao atualizar galeria:', error);
        }
    }

    displayAudioGallery(audios) {
        const audiosList = document.getElementById('audios-list');
        
        if (audios.length === 0) {
            audiosList.innerHTML = '<div class="loading">Nenhum áudio ainda</div>';
            return;
        }
        
        audiosList.innerHTML = audios.map(audio => `
            <div class="audio-item">
                <div class="audio-item-title">🎙️ ${audio.title}</div>
                <audio controls style="width: 100%; margin: 5px 0;">
                    <source src="${audio.url}" type="audio/mpeg">
                </audio>
                <div class="audio-item-time">${audio.date}</div>
            </div>
        `).join('');
    }

    switchTab(tabBtn) {
        // Remover active de todos os botões
        tabBtn.parentElement.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Adicionar active ao clicado
        tabBtn.classList.add('active');
        
        // Esconder todos os tabs
        const tabName = tabBtn.getAttribute('data-tab');
        tabBtn.parentElement.parentElement.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Mostrar o tab selecionado
        tabBtn.parentElement.parentElement.querySelector(`#${tabName}`).classList.add('active');
        
        // Carregar dados se necessário
        if (tabName === 'audios') {
            this.updateAudioGallery();
        }
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('active');
    }

    handleProviderChange() {
        if (!this.providerSelect || !this.modelInput) {
            return;
        }

        const provider = this.providerSelect.value;
        if (provider === 'ollama') {
            this.modelInput.placeholder = 'Ex: llama3.1:latest';
        } else {
            this.modelInput.placeholder = 'Opcional, deixe em branco para padrão';
        }
    }

    scheduleLoadingEscalation() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
        this.loadingTimeout = setTimeout(() => {
            this.showLoadingBanner('Ainda processando... Deseja cancelar?', true);
        }, 3500);
    }

    showLoadingBanner(message, allowCancel = true) {
        if (!this.loadingBanner || !this.loadingText) return;
        this.loadingText.textContent = message;
        this.loadingBanner.classList.add('visible');
        if (this.loadingCancelBtn) {
            this.loadingCancelBtn.style.display = allowCancel ? 'inline-flex' : 'none';
        }
    }

    hideLoadingBanner() {
        if (this.loadingBanner) {
            this.loadingBanner.classList.remove('visible');
        }
        if (this.loadingCancelBtn) {
            this.loadingCancelBtn.style.display = 'none';
        }
    }

    clearLoadingIndicator() {
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
        this.hideLoadingBanner();
    }

    cancelPendingRequest() {
        if (!this.isProcessing) return;
        this.cancelledByUser = true;
        if (this.pendingController) {
            this.pendingController.abort();
        }
        this.showLoadingBanner('Cancelando...', false);
        this.waveLabel.textContent = '⏹️ Cancelando...';
        window.waveVisualizer?.stopAnimation();
        this.updateSendButton();
    }

    stopAudioPlayback(userInitiated = false) {
        if (!this.isPlayingAudio && !this.currentAudio) {
            return;
        }

        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
            } catch (e) {
                // ignore
            }
            this.currentAudio.currentTime = 0;
        }

        const wasPlaying = this.isPlayingAudio;
        this.currentAudio = null;
        this.isPlayingAudio = false;
        this.waveContainer.classList.remove('ai-speaking');
        this.waveLabel.textContent = '🎤 Aguardando...';
        window.waveVisualizer?.stopAnimation();
        this.updateSendButton();

        if (userInitiated && wasPlaying) {
            this.addMessageToChat('ai', '🔇 Fala interrompida.');
        }
    }

    updateSendButton() {
        if (!this.sendBtn) return;
        this.sendBtn.classList.remove('btn-stop', 'btn-cancel');

        if (this.isProcessing) {
            this.sendBtn.textContent = 'Cancelar';
            this.sendBtn.classList.add('btn-cancel');
        } else if (this.isPlayingAudio) {
            this.sendBtn.textContent = 'Parar fala';
            this.sendBtn.classList.add('btn-stop');
        } else {
            this.sendBtn.textContent = 'Enviar';
        }
    }

    saveSettings() {
        const newName = document.getElementById('ai-name-input').value || 'Karen';
        const personality = document.getElementById('personality-select').value || 'helpful';
        const voice = document.getElementById('voice-select').value || 'karen_pt';
        const mood = parseInt(document.getElementById('mood-slider').value) || 50;
        const energy = parseInt(document.getElementById('energy-slider').value) || 70;
        const tendency = parseInt(document.getElementById('tendency-slider').value) || 60;
        const topicsInput = document.getElementById('topics-input').value;
        const topics = topicsInput ? topicsInput.split(',').map(t => t.trim()) : [];
        const provider = this.providerSelect ? this.providerSelect.value : (this.aiState.chat_provider || 'pollinations');
        const model = this.modelInput ? this.modelInput.value.trim() : (this.aiState.chat_model || '');

        // Atualizar estado local IMEDIATAMENTE (antes de enviar)
        this.aiState.name = newName;
        this.aiState.personality_type = personality;
        this.aiState.preferred_voice = voice;
        this.aiState.mood_value = mood;
        this.aiState.energy_level = energy;
        this.aiState.topics_discussed = topics;
        this.aiState.idle_speak_tendency = tendency;
        this.aiState.chat_provider = provider;
        this.aiState.chat_model = model;

        // Atualizar UI imediatamente
        this.updateAIState();

        // Enviar configurações para o servidor
        fetch('/api/ai-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newName,
                personality_type: personality,
                voice: voice,
                mood_value: mood,
                energy_level: energy,
                topics_discussed: topics,
                idle_speak_tendency: tendency,
                chat_provider: provider,
                chat_model: model
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                this.aiState = { ...this.aiState, ...data.ai_state };
                this.updateAIState();
                this.closeSettings();
                console.log('✅ Configurações salvas com sucesso!');
                
                // Mostrar feedback visual
                const settingsModal = document.getElementById('settings-modal');
                if (settingsModal) {
                    settingsModal.style.background = 'rgba(0, 255, 0, 0.1)';
                    setTimeout(() => {
                        settingsModal.style.background = 'rgba(0, 0, 0, 0.7)';
                    }, 300);
                }
            }
        })
        .catch(err => {
            console.error('Erro ao salvar configurações:', err);
            alert('Erro ao salvar configurações. Tente novamente.');
        });
    }

    updateMoodDisplay() {
        const slider = document.getElementById('mood-slider');
        if (!slider) return;
        
        const moods = ['😢', '😔', '😐', '🙂', '😄'];
        const index = Math.floor(parseInt(slider.value) / 20);
        const display = slider.parentElement.querySelector('.slider-display') || 
                       document.createElement('span');
        display.className = 'slider-display';
        display.textContent = moods[index] + ' Humor: ' + slider.value;
        
        if (!slider.parentElement.querySelector('.slider-display')) {
            slider.parentElement.appendChild(display);
        }
    }

    updateEnergyDisplay() {
        const slider = document.getElementById('energy-slider');
        if (!slider) return;
        
        const energies = ['⚪', '🔵', '⚫', '🟢', '🔴'];
        const index = Math.floor(parseInt(slider.value) / 20);
        const display = slider.parentElement.querySelector('.slider-display') || 
                       document.createElement('span');
        display.className = 'slider-display';
        display.textContent = energies[index] + ' Energia: ' + slider.value;
        
        if (!slider.parentElement.querySelector('.slider-display')) {
            slider.parentElement.appendChild(display);
        }
    }

    updateTendencyDisplay() {
        const slider = document.getElementById('tendency-slider');
        if (!slider) return;
        
        const tendencies = ['Quieta', 'Reservada', 'Normal', 'Falante', 'Muito Falante'];
        const index = Math.floor(parseInt(slider.value) / 20);
        const display = slider.parentElement.querySelector('.slider-display') || 
                       document.createElement('span');
        display.className = 'slider-display';
        display.textContent = tendencies[index] + ' - ' + slider.value;
        
        if (!slider.parentElement.querySelector('.slider-display')) {
            slider.parentElement.appendChild(display);
        }
    }

    destroy() {
        clearInterval(this.idleCheckInterval);
        if (this.recognition) {
            this.recognition.stop();
        }
    }
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', function() {
    window.aiChat = new AIChatSystem();
});
