'use client'

// Sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null
  private soundsEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if sounds are enabled in localStorage
      const saved = localStorage.getItem('tronSoundsEnabled')
      this.soundsEnabled = saved !== 'false'
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  enableSounds(enabled: boolean) {
    this.soundsEnabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('tronSoundsEnabled', String(enabled))
    }
  }

  isEnabled(): boolean {
    return this.soundsEnabled
  }

  // Generate a laser zap sound
  playLaserZap() {
    if (!this.soundsEnabled) return

    try {
      const ctx = this.getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Laser zap: quick high frequency sweep
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } catch (error) {
      console.warn('Failed to play laser zap sound:', error)
    }
  }

  // Generate a Tron grid pulse sound
  playGridPulse() {
    if (!this.soundsEnabled) return

    try {
      const ctx = this.getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Grid pulse: low frequency pulse
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(150, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3)

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (error) {
      console.warn('Failed to play grid pulse sound:', error)
    }
  }

  // Generate a Tron beep sound
  playTronBeep() {
    if (!this.soundsEnabled) return

    try {
      const ctx = this.getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Tron beep: short high-pitched beep
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime)

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.05)
    } catch (error) {
      console.warn('Failed to play tron beep sound:', error)
    }
  }

  // Generate a Tron whoosh sound (for drag)
  playWhoosh() {
    if (!this.soundsEnabled) return

    try {
      const ctx = this.getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Whoosh: frequency sweep
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(300, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.15)
    } catch (error) {
      console.warn('Failed to play whoosh sound:', error)
    }
  }

  // Generate a Tron click sound
  playClick() {
    if (!this.soundsEnabled) return

    try {
      const ctx = this.getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Click: very short high frequency
      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime)

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.02)
    } catch (error) {
      console.warn('Failed to play click sound:', error)
    }
  }

  // Generate a Tron error/deny sound
  playError() {
    if (!this.soundsEnabled) return

    try {
      const ctx = this.getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Error: low frequency buzz
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(200, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2)

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.2)
    } catch (error) {
      console.warn('Failed to play error sound:', error)
    }
  }
}

// Singleton instance
let soundManager: SoundManager | null = null

export function getSoundManager(): SoundManager {
  if (!soundManager) {
    soundManager = new SoundManager()
  }
  return soundManager
}

// Convenience functions
export const playLaserZap = () => getSoundManager().playLaserZap()
export const playGridPulse = () => getSoundManager().playGridPulse()
export const playTronBeep = () => getSoundManager().playTronBeep()
export const playWhoosh = () => getSoundManager().playWhoosh()
export const playClick = () => getSoundManager().playClick()
export const playError = () => getSoundManager().playError()
export const enableSounds = (enabled: boolean) => getSoundManager().enableSounds(enabled)
export const isSoundsEnabled = () => getSoundManager().isEnabled()
