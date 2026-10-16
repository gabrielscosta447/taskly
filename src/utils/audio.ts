/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TASKLY - Feedback Sonoro com Web Audio API Nativa
 * Gera um som sutil e agradável ao concluir tarefas sem carregar arquivos pesados.
 */

export function playTaskDoneSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Criar oscilador suave (onda senoidal harmônica)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    
    // Duas notas rápidas ascendentes (E5 para A5)
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    // Envelope de volume suave
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Silencia qualquer restrição de autoplay ou ambiente sem áudio
  }
}
