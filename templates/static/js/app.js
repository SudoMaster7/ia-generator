let intervalId;
let isSpinning = false;

// --- SISTEMA DE SOM ---
const audioFiles = {
    click: new Audio('https://www.soundjay.com/buttons/button-1.mp3'),
    magic: new Audio('https://www.soundjay.com/misc/sounds/magic-chime-01.mp3'),
    spin: new Audio('https://www.soundjay.com/buttons/button-4.mp3'),
    success: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'),
    error: new Audio('https://www.soundjay.com/buttons/button-10.mp3'),
    chat: new Audio('https://www.soundjay.com/buttons/button-3.mp3')
};

let isMuted = false;

function playSound(name) {
    if (isMuted || !audioFiles[name]) return;
    try {
        const sound = audioFiles[name].cloneNode();
        sound.volume = 0.4;
        sound.play().catch(e => console.log("Audio play prevented:", e));
    } catch(e) { console.error(e); }
}

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    if(isMuted) {
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        btn.classList.add('btn-secondary');
        btn.classList.remove('btn-outline-secondary');
    } else {
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-outline-secondary');
        playSound('click');
    }
}

// --- DADOS DA ROLETA ---
const roulettePrompts = {
    // --- Ultra-Realistic People ---
    "Cinematic Portrait": "Close-up portrait of a warrior with mud and war paint, intense gaze, rain dripping down face, dramatic rim lighting, shot on ARRI Alexa, 50mm lens, shallow depth of field, cinematic color grading.",
    "Vintage Film Look": "Candid street photography of a couple in 1970s Paris, shot on Kodak Portra 400, grainy film texture, light leaks, muted tones, nostalgia, vintage fashion, soft natural lighting.",
    "Fashion Editorial": "High-fashion avant-garde model wearing a dress made of optical fiber, studio lighting, stark white background, dynamic pose, sharp focus, Vogue magazine style, 8k resolution.",

    // --- Sci-Fi & Fantasy Subgenres ---
    "Solarpunk Utopia": "Futuristic eco-city integrated with giant trees and waterfalls, buildings made of glass and vines, flying wind turbines, bright blue sky, optimistic atmosphere, Art Nouveau architecture, Studio Ghibli vibes.",
    "Dark Fantasy Souls": "Gloomy gothic castle ruins on a cliff, massive fog, a knight with a glowing greatsword facing a giant eldritch horror, desaturated colors, evocative atmosphere, style of Dark Souls/Elden Ring.",
    "Biopunk Lab": "Laboratory growing organic computers, glowing green liquids in tubes, biological cables fusing with metal, wet textures, claustrophobic lighting, H.R. Giger inspiration, high detail.",
    "Space Opera": "Epic space battle above a gas giant planet, laser beams, exploding starships, nebula background, cinematic composition, lens flare, wide angle shot, Star Wars concept art style.",

    // --- Specific Art Styles ---
    "Ukiyo-e Style": "The Great Wave off Kanagawa remix with a cybernetic cyberpunk city in the background, traditional Japanese woodblock print texture, flat colors, thick outlines, merging old and new.",
    "Double Exposure": "Artistic double exposure silhouette of a woman's profile combined with a snowy pine forest and starry night sky, surreal, monochrome with a splash of teal, vector art inspiration.",
    "Low Poly 3D": "Cute isometric floating island with a lighthouse and a small boat, low poly 3D art style, pastel colors, soft ambient occlusion, blender render, clean and minimal.",
    "Glitch Art": "Portrait of a statue of David but digitally corrupted, pixel sorting effects, RGB split, VHS static noise, vaporwave aesthetic, pink and cyan neon palette, modern digital art.",

    // --- Textures & Objects ---
    "Tech Knolling": "Deconstructed mechanical watch parts arranged neatly on a cutting mat (knolling), top-down view, studio lighting, high texture detail, metallic reflections, industrial design, satisfying symmetry.",
    "Food Photography": "Delicious gourmet burger with melting cheese and steam rising, macro shot, water droplets on fresh lettuce, professional food photography, bokeh background, warm appetizing lighting.",
    "Crystal World": "Landscape made entirely of translucent crystals and amethyst, light refracting through prisms, rainbows, cavernous environment, ray tracing, mesmerizing and ethereal."
};

const promptKeys = Object.keys(roulettePrompts);

function spinRoulette() {
    if (isSpinning) return;
    
    playSound('spin'); // Som de roleta
    isSpinning = true;
    const wheel = document.getElementById('rouletteWheel');
    const spinBtn = document.getElementById('spinBtn');
    const acceptBtn = document.getElementById('acceptBtn');
    const label = document.getElementById('rouletteLabel');
    
    spinBtn.disabled = true;
    acceptBtn.style.display = 'none';
    
    // Animação de girar
    wheel.classList.add('spinning');
    label.textContent = 'Girando... 🎡';
    
    // Efeito sonoro de "tic-tac" da roleta
    const tickInterval = setInterval(() => {
        const sound = audioFiles['click'].cloneNode();
        sound.volume = 0.2;
        sound.play().catch(() => {});
    }, 150);
    
    // Seleciona uma opção aleatória
    setTimeout(() => {
        clearInterval(tickInterval); // Para o som
        
        const randomIndex = Math.floor(Math.random() * promptKeys.length);
        const selectedKey = promptKeys[randomIndex];
        const selectedPrompt = roulettePrompts[selectedKey];
        
        wheel.classList.remove('spinning');
        playSound('magic'); // Som de sucesso da roleta
        
        // Exibe resultado
        label.innerHTML = `<span style="color: #a6e3a1; font-size: 1.5rem;">✨ ${selectedKey} ✨</span>`;
        
        const displayDiv = document.getElementById('promptDisplay');
        document.getElementById('promptText').textContent = selectedPrompt;
        displayDiv.style.display = 'block';
        
        // Salva o prompt
        currentRoulettePrompt = selectedPrompt;
        
        spinBtn.disabled = false;
        acceptBtn.style.display = 'inline-block';
        isSpinning = false;
    }, 4000);
}

let currentRoulettePrompt = '';

function acceptRoulette() {
    document.getElementById('promptInput').value = currentRoulettePrompt;
    
    // Vai para a aba manual
    const manualTab = document.getElementById('manual-tab');
    manualTab.click();
    
    // Feedback visual
    const btn = document.getElementById('acceptBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ✓ Prompt Copiado!';
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 2000);
}

// --- DADOS DO CHATBOT ---
const promptBuilder = {
    0: {
        question: "Que tipo de imagem você quer criar?",
        choices: ["Pessoa", "Animal", "Paisagem", "Objeto", "Fantasia", "Arte Digital"]
    },
    1: {
        "Pessoa": {
            question: "Qual é o estilo?",
            choices: ["Realista", "Ilustrado", "Anime", "Cartoon", "Pintura a óleo"]
        },
        "Animal": {
            question: "Qual animal?",
            choices: ["Cachorro", "Gato", "Pássaro", "Dinossauro", "Fantástico"]
        },
        "Paisagem": {
            question: "Que tipo de paisagem?",
            choices: ["Natureza", "Urbana", "Futurista", "Deserto", "Montanhas"]
        },
        "Objeto": {
            question: "Qual tipo de objeto?",
            choices: ["Tecnologia", "Arma", "Joia", "Veículo", "Casa"]
        },
        "Fantasia": {
            question: "Que tipo de fantasia?",
            choices: ["Medieval", "Ficção Científica", "Mágico", "Pós-Apocalíptico"]
        },
        "Arte Digital": {
            question: "Qual estilo de arte?",
            choices: ["3D", "2D", "Pixel Art", "Neon", "Abstrato"]
        }
    },
    2: {
        question: "Qual é o ambiente/setting?",
        choices: ["Dentro de casa", "Externo", "Espaço", "Água", "Subterrâneo"]
    },
    3: {
        question: "Qual é o clima/atmosfera?",
        choices: ["Diurno", "Noturno", "Nublado", "Tempestade", "Neblina"]
    },
    4: {
        question: "Detalhes finais? (cor, qualidade, etc)",
        choices: ["4K Ultra HD", "Cinematic", "Altamente detalhado", "Estilo conceitual", "Prosseguir"]
    }
};

// --- FUNÇÕES DO CHATBOT ---
function initChatbot() {
    chatStep = 0;
    chatChoices = {};
    showChatQuestion();
}

function showChatQuestion() {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';

    if (chatStep === 1) {
        const category = chatChoices[0];
        const options = promptBuilder[1][category];
        displayChoices(options.choices, chatStep);
    } else if (chatStep === 0 || (chatStep > 1 && promptBuilder[chatStep])) {
        const options = promptBuilder[chatStep];
        displayChoices(options.choices, chatStep);
    } else {
        finalizeChatPrompt();
    }
}

function displayChoices(choices, step) {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '';

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-choice';
        btn.textContent = choice;
        btn.onclick = () => selectChoice(choice, step);
        container.appendChild(btn);
    });
}

function selectChoice(choice, step) {
    chatChoices[step] = choice;

    const chatContainer = document.getElementById('chatContainer');
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message chat-user';
    userMsg.innerHTML = `<strong>Você:</strong> ${choice}`;
    chatContainer.appendChild(userMsg);

    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message chat-bot';
    botMsg.innerHTML = `<strong>🤖 AI Assistant:</strong> Ótimo! ${choice} é uma ótima escolha.`;
    chatContainer.appendChild(botMsg);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    chatStep++;
    setTimeout(showChatQuestion, 500);
}

function sendCustomChoice() {
    const input = document.getElementById('customInput');
    const choice = input.value.trim();

    if (!choice) return;

    chatChoices[chatStep] = choice;

    const chatContainer = document.getElementById('chatContainer');
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message chat-user';
    userMsg.innerHTML = `<strong>Você:</strong> ${choice}`;
    chatContainer.appendChild(userMsg);

    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message chat-bot';
    botMsg.innerHTML = `<strong>🤖 AI Assistant:</strong> Perfeito! Vou incorporar "${choice}" ao seu prompt.`;
    chatContainer.appendChild(botMsg);

    chatContainer.scrollTop = chatContainer.scrollHeight;
    input.value = '';

    chatStep++;
    setTimeout(showChatQuestion, 500);
}

function finalizeChatPrompt() {
    const container = document.getElementById('choicesContainer');
    container.innerHTML = '<button class="btn btn-primary w-100" onclick="buildFinalPrompt()"><i class="fas fa-check"></i> Criar Prompt Final</button>';
}

function buildFinalPrompt() {
    const parts = Object.values(chatChoices);
    const finalPrompt = parts.join(", ") + ", highly detailed, 8k, sharp focus, cinematic lighting";
    
    document.getElementById('promptInput').value = finalPrompt;

    const manualTab = document.getElementById('manual-tab');
    manualTab.click();

    const chatContainer = document.getElementById('chatContainer');
    const finishMsg = document.createElement('div');
    finishMsg.className = 'chat-message chat-bot';
    finishMsg.innerHTML = `<strong>🤖 AI Assistant:</strong> Prompt criado! Agora clique em "GERAR IMAGEM" para criar sua obra-prima.`;
    chatContainer.appendChild(finishMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// --- INICIALIZAÇÃO DO CHATBOT NA ABA ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('chatbot-tab').addEventListener('click', () => {
        setTimeout(initChatbot, 100);
    });
});

// --- FUNÇÃO MÁGICA DE PROMPT ---
async function enhancePrompt() {
    playSound('magic'); // Som mágico
    const input = document.getElementById('promptInput');
    const btn = document.getElementById('magicBtn');
    const originalText = input.value;

    if (!originalText) return alert("Digite uma ideia base primeiro para a IA melhorar!");

    const originalBtnContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    btn.disabled = true;

    try {
        const response = await fetch('/magic-prompt', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ idea: originalText })
        });
        const data = await response.json();
        input.value = data.prompt;
    } catch (error) {
        console.error(error);
        alert("Erro ao criar prompt mágico.");
    } finally {
        btn.innerHTML = originalBtnContent;
        btn.disabled = false;
    }
}

// --- FUNÇÕES DE GERAÇÃO ---
async function startGeneration() {
    const prompt = document.getElementById('promptInput').value;
    const device = document.getElementById('deviceSelect').value;
    const btn = document.getElementById('generateBtn');
    const cancelBtn = document.getElementById('cancelBtn'); // Pega o botão cancelar
    const progressContainer = document.getElementById('progressContainer');
    const resultArea = document.getElementById('resultArea');

    if (!prompt) return alert("Digite um prompt!");

    // Reset UI
    btn.disabled = true;
    
    // Reseta botão de cancelar
    cancelBtn.disabled = false;
    cancelBtn.innerHTML = '<i class="fas fa-stop-circle"></i> CANCELAR GERAÇÃO';
    
    resultArea.style.display = 'none';
    progressContainer.style.display = 'block';
    updateProgress(0);

    // --- PERGUNTA SE QUER JOGAR ---
    const askModal = new bootstrap.Modal(document.getElementById('askGameModal'));
    askModal.show();

    intervalId = setInterval(checkProgress, 1000);

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt: prompt, device: device })
        });
        
        const data = await response.json();
        clearInterval(intervalId);
        
        if (data.status === "cancelled") {
            // Se foi cancelado
            progressContainer.style.display = 'none';
            alert("Geração cancelada!");
        } else if (data.image) {
            playSound('success'); // Som de sucesso
            // Se deu sucesso
            updateProgress(100);
            document.getElementById('resultImg').src = `data:image/png;base64,${data.image}`;
            document.getElementById('statTime').innerText = data.duration + " segundos";
            document.getElementById('statDevice').innerText = data.device;
            document.getElementById('statSteps').innerText = data.steps;
            
            setTimeout(() => {
                progressContainer.style.display = 'none';
                resultArea.style.display = 'block';
            }, 500);
        } else {
            playSound('error'); // Som de erro
            alert("Erro ao gerar imagem.");
            progressContainer.style.display = 'none';
        }
    } catch (error) {
        playSound('error'); // Som de erro
        console.error(error);
        alert("Erro de conexão.");
        progressContainer.style.display = 'none';
    } finally {
        btn.disabled = false;
        clearInterval(intervalId);
    }
}

async function cancelGeneration() {
    const btn = document.getElementById('cancelBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parando...';

    try {
        await fetch('/cancel', { method: 'POST' });
        // O loop de verificação de progresso (checkProgress) vai continuar rodando
        // até que a requisição principal (/generate) retorne "cancelled"
    } catch (error) {
        console.error("Erro ao cancelar:", error);
    }
}

async function checkProgress() {
    try {
        const res = await fetch('/progress');
        const data = await res.json();
        updateProgress(data.progress);
    } catch (e) {
        console.log("Erro ao checar progresso", e);
    }
}

function updateProgress(val) {
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    bar.style.width = val + '%';
    text.innerText = val + '%';
}

// --- GALERIA ---
async function loadGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '<div class="text-center w-100 mt-5"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';

    try {
        const response = await fetch('/gallery');
        const images = await response.json();

        grid.innerHTML = '';

        if (images.length === 0) {
            grid.innerHTML = '<div class="text-center w-100 mt-5 text-muted">Nenhuma imagem gerada ainda.</div>';
            return;
        }

        images.forEach(img => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.onclick = () => openImageModal(img.filename, img.prompt);
            
            item.innerHTML = `
                <img src="/images/${img.filename}" loading="lazy" alt="${img.prompt}">
                <div class="gallery-overlay">${img.prompt}</div>
            `;
            grid.appendChild(item);
        });

    } catch (error) {
        console.error("Erro ao carregar galeria:", error);
        grid.innerHTML = '<div class="text-center w-100 mt-5 text-danger">Erro ao carregar galeria.</div>';
    }
}

// Variável para guardar o prompt atual do modal
let currentModalPrompt = "";

function openImageModal(filename, prompt) {
    const modalImg = document.getElementById('modalImage');
    const modalPrompt = document.getElementById('modalPrompt');
    
    modalImg.src = `/images/${filename}`;
    modalPrompt.textContent = prompt;
    currentModalPrompt = prompt;

    const myModal = new bootstrap.Modal(document.getElementById('imageModal'));
    myModal.show();
}

function reusePrompt() {
    // Fecha o modal
    const modalEl = document.getElementById('imageModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Preenche o input e vai para a aba manual
    document.getElementById('promptInput').value = currentModalPrompt;
    document.getElementById('manual-tab').click();
}

// Carrega a galeria quando a aba é clicada
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gallery-tab').addEventListener('click', () => {
        loadGallery();
    });
    
    // --- FUNÇÕES EXISTENTES ---
    document.getElementById('roulette-tab').addEventListener('click', () => {
        // Para a roleta se estiver girando
        if (isSpinning) {
            const wheel = document.getElementById('rouletteWheel');
            wheel.classList.remove('spinning');
            isSpinning = false;
        }
    });

    // --- TAB MANAGEMENT (Esconder botão Gerar no Chat) ---
    const generateBtnContainer = document.getElementById('generateBtnContainer');
    
    document.getElementById('chat-tab').addEventListener('shown.bs.tab', () => {
        if(generateBtnContainer) generateBtnContainer.style.display = 'none';
    });
    
    ['manual-tab', 'roulette-tab', 'gallery-tab'].forEach(id => {
        const tab = document.getElementById(id);
        if(tab) {
            tab.addEventListener('shown.bs.tab', () => {
                if(generateBtnContainer) generateBtnContainer.style.display = 'block';
            });
        }
    });
});

// --- CHAT LOGIC ---
let chatHistory = [];

function handleChatKey(event) {
    if (event.key === 'Enter') {
        sendChat();
    }
}

async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    const container = document.getElementById('chatContainer');
    const btn = document.getElementById('sendChatBtn');
    
    if (!message) return;
    
    // 1. Adiciona mensagem do usuário
    appendMessage('user', message);
    input.value = '';
    input.disabled = true;
    btn.disabled = true;
    
    // Adiciona ao histórico
    chatHistory.push({ role: 'user', content: message });
    
    // 2. Mostra indicador de digitação
    const loadingId = appendLoading();
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                history: chatHistory
            })
        });
        
        const data = await response.json();
        
        // Remove loading
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.remove();
        
        // 3. Adiciona resposta da IA
        appendMessage('ai', data.response);
        playSound('chat'); // Som de mensagem recebida
        
        // Adiciona ao histórico
        chatHistory.push({ role: 'assistant', content: data.response });
        
    } catch (error) {
        const loadingEl = document.getElementById(loadingId);
        if(loadingEl) loadingEl.remove();
        appendMessage('ai', 'Erro ao conectar com o servidor. Tente novamente.');
        console.error(error);
    } finally {
        input.disabled = false;
        btn.disabled = false;
        input.focus();
    }
}

function appendMessage(role, text) {
    const container = document.getElementById('chatContainer');
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    
    // Converte quebras de linha em <br>
    div.innerHTML = text.replace(/\n/g, '<br>');
    
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function appendLoading() {
    const container = document.getElementById('chatContainer');
    const div = document.createElement('div');
    const id = 'loading-' + Date.now();
    div.id = id;
    div.className = 'chat-message ai';
    div.innerHTML = '<i class="fas fa-ellipsis-h fa-fade"></i>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
}

// --- DINO GAME LOGIC ---
// Moved to game.js