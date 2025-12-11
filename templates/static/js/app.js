let intervalId;
let isSpinning = false;

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
let currentRoulettePrompt = '';

// --- FUNÇÕES DA ROLETA ---
function spinRoulette() {
    if (isSpinning) return;
    
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
    
    // Seleciona uma opção aleatória
    setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * promptKeys.length);
        const selectedKey = promptKeys[randomIndex];
        const selectedPrompt = roulettePrompts[selectedKey];
        
        wheel.classList.remove('spinning');
        
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

// --- FUNÇÃO MÁGICA DE PROMPT (Botão "Melhorar") ---
async function enhancePrompt() {
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

// --- FUNÇÕES DE GERAÇÃO DE IMAGEM ---
async function startGeneration() {
    const prompt = document.getElementById('promptInput').value;
    const device = document.getElementById('deviceSelect').value;
    const btn = document.getElementById('generateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const progressContainer = document.getElementById('progressContainer');
    const resultArea = document.getElementById('resultArea');

    if (!prompt) return alert("Digite um prompt!");

    btn.disabled = true;
    cancelBtn.disabled = false;
    cancelBtn.innerHTML = '<i class="fas fa-stop-circle"></i> CANCELAR GERAÇÃO';
    
    resultArea.style.display = 'none';
    progressContainer.style.display = 'block';
    updateProgress(0);

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
            alert("Erro ao gerar imagem.");
            progressContainer.style.display = 'none';
        }
    } catch (error) {
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

// --- LÓGICA DO CHATBOT (LLM) ---
function handleChatKey(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 1. Adiciona mensagem do usuário
    addChatMessage(message, 'user');
    input.value = '';
    input.disabled = true; // Bloqueia input enquanto pensa
    
    // 2. Mostra "digitando..."
    const typingId = showTypingIndicator();
    
    try {
        // 3. Chama a LLM Real
        const res = await fetch('/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ message: message })
        });
        
        const data = await res.json();
        
        removeTypingIndicator(typingId);
        
        // Verifica se há uma ação de prompt sugerida
        let action = null;
        if (data.action) {
            action = { text: "Usar esta Ideia", prompt: data.response };
        }
        
        addChatMessage(data.response, 'bot', action);
        
    } catch (error) {
        console.error(error);
        removeTypingIndicator(typingId);
        addChatMessage("Erro ao conectar com o cérebro da IA.", 'bot');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

function addChatMessage(text, sender, action = null) {
    const history = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    
    const icon = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    let contentHtml = text;
    
    if (action) {
        contentHtml += `<br><button class="chat-action-btn" onclick="useChatPrompt('${action.prompt.replace(/'/g, "\\'")}')"><i class="fas fa-magic"></i> ${action.text}</button>`;
    }
    
    msgDiv.innerHTML = `
        <div class="chat-avatar">${icon}</div>
        <div class="chat-text">${contentHtml}</div>
    `;
    
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
}

function showTypingIndicator() {
    const history = document.getElementById('chatHistory');
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg bot`;
    msgDiv.id = id;
    
    // HTML da animação de bolinhas
    msgDiv.innerHTML = `
        <div class="chat-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-text">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function useChatPrompt(promptText) {
    // Joga o prompt para a aba manual
    document.getElementById('promptInput').value = promptText;
    document.getElementById('manual-tab').click();
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gallery-tab').addEventListener('click', loadGallery);
    
    document.getElementById('roulette-tab').addEventListener('click', () => {
        // Para a roleta se estiver girando
        if (isSpinning) {
            const wheel = document.getElementById('rouletteWheel');
            wheel.classList.remove('spinning');
            isSpinning = false;
        }
    });
});