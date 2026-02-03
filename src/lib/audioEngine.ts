// Native Web Audio API implementation for zero-dependency high-performance audio

class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers: Record<string, AudioBuffer> = {};
  private isMuted: boolean = false;
  private volume: number = 0.5;

  constructor() {
    // Lazy initialization to handle auto-play policy
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.setVolume(this.volume);
        this.generateSounds();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  // Ensure AudioContext is running (browser auto-play policy)
  public async resume() {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.volume, 
        this.context?.currentTime || 0
      );
    }
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(this.volume); // Re-apply volume based on mute state
  }

  public play(type: 'shoot' | 'hit' | 'miss') {
    if (!this.context || !this.masterGain || !this.buffers[type]) return;

    // Create source
    const source = this.context.createBufferSource();
    source.buffer = this.buffers[type];
    
    // Connect to master
    source.connect(this.masterGain);
    
    // Play immediately
    source.start(0);
  }

  // Procedurally generate sounds to avoid external asset dependencies
  private generateSounds() {
    if (!this.context) return;

    this.buffers['shoot'] = this.createShootSound();
    this.buffers['hit'] = this.createHitSound();
    this.buffers['miss'] = this.createMissSound();
  }

  private createShootSound(): AudioBuffer {
    const duration = 0.1;
    const sampleRate = this.context!.sampleRate;
    const buffer = this.context!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      // White noise with exponential decay
      const noise = Math.random() * 2 - 1;
      const decay = Math.exp(-i / (sampleRate * 0.02));
      data[i] = noise * decay;
    }
    return buffer;
  }

  private createHitSound(): AudioBuffer {
    const duration = 0.3; // Longer "ding"
    const sampleRate = this.context!.sampleRate;
    const buffer = this.context!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    const freq = 880; // High A

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Sine wave with envelope
      const wave = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.exp(-t * 10); // Decay
      data[i] = wave * envelope * 0.5;
    }
    return buffer;
  }

  private createMissSound(): AudioBuffer {
    const duration = 0.15;
    const sampleRate = this.context!.sampleRate;
    const buffer = this.context!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    const freq = 150; // Low thud

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      // Square-ish wave
      const wave = Math.sign(Math.sin(2 * Math.PI * freq * t));
      const envelope = Math.exp(-t * 15);
      data[i] = wave * envelope * 0.5;
    }
    return buffer;
  }
}

export const audioEngine = new AudioEngine();
