// Simple synthesized sounds encoded as Data URIs to allow immediate testing without external files.
// In a real production app, these would be paths to .wav/.mp3 files in the public folder.

// Short "Pop" / Click
export const SHOOT_SOUND = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // Placeholder, I'll need better ones or just use paths.

// Actually, generating valid small wav base64 strings is tricky manually. 
// I will setup the code to point to standard paths '/sounds/shoot.mp3' etc. 
// AND I will provide a helper to generate synthetic sounds using Web Audio API as a fallback 
// if the files are missing, OR I can just use a library like 'synthesizer' but that adds dependencies.

// Let's stick to the user's request: "Sound Categories: shoot.wav, hit.wav, miss.wav"
// I will assume these files will exist in `public/sounds/`.
// I will create a script to generate simple placeholder wav files in that directory.

export const DEFAULT_SOUNDS = {
  shoot: '/sounds/shoot.wav',
  hit: '/sounds/hit.wav',
  miss: '/sounds/miss.wav',
};
