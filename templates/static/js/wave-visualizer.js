/**
 * Visualizador de Ondas - Similar ao Radar
 * Mostra quando a IA está falando com animação de frequência
 */

class WaveVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.analyser = null;
        this.animationId = null;
        
        // Configurar canvas responsivo
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.setupAudioContext();
        this.drawIdle();
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setupAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
        } catch (e) {
            console.warn('AudioContext não disponível:', e);
        }
    }

    drawIdle() {
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar grid de radar
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;

        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.lineWidth = 1;

        // Círculos concêntricos
        for (let i = 1; i <= 4; i++) {
            const radius = (maxRadius / 4) * i;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Linhas radiais
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x = centerX + Math.cos(angle) * maxRadius;
            const y = centerY + Math.sin(angle) * maxRadius;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }

        // Ponto central
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    startAnimation() {
        this.isPlaying = true;
        this.animate();
    }

    stopAnimation() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.drawIdle();
    }

    animate() {
        if (!this.isPlaying) return;

        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 20;

        // Ondas de frequência
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
        this.ctx.lineWidth = 2;

        const time = Date.now() / 1000;
        const frequency = 3;
        const amplitude = 15;

        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const startX = centerX + Math.cos(angle) * 20;
            const startY = centerY + Math.sin(angle) * 20;
            const endX = centerX + Math.cos(angle) * (maxRadius + amplitude * Math.sin(time * frequency + i));
            const endY = centerY + Math.sin(angle) * (maxRadius + amplitude * Math.sin(time * frequency + i));

            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }

        // Ondas circulares
        this.ctx.strokeStyle = `rgba(102, 126, 234, ${0.3 + Math.sin(time * 2) * 0.2})`;
        this.ctx.lineWidth = 2;

        for (let i = 1; i <= 3; i++) {
            const pulse = Math.sin(time * 2 - i * 0.3) * 10;
            const radius = (maxRadius / 3) * i + pulse;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Ponto central pulsante
        const pulseSize = 5 + Math.sin(time * 3) * 2;
        this.ctx.fillStyle = `rgba(102, 126, 234, ${0.5 + Math.sin(time * 2) * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Efeito de brilho
        this.ctx.fillStyle = `rgba(102, 126, 234, ${0.2 + Math.sin(time * 1.5) * 0.1})`;
        for (let i = 1; i <= 3; i++) {
            const glowRadius = maxRadius * 0.3 * i;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    // Animar com áudio real (se houver fonte de áudio)
    linkAudioSource(audioContext) {
        if (!this.analyser) {
            this.analyser = audioContext.createAnalyser();
        }
        // Conectar fonte de áudio se disponível
    }
}

// Inicializar quando o documento carregar
document.addEventListener('DOMContentLoaded', function() {
    window.waveVisualizer = new WaveVisualizer('wave-canvas');
});
