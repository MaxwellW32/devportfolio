/* ============================================================================
   A SMALL SYNTHESISER, SHARED BY THE FOUR AUDIO TOYS

   Everything you hear on those pages is made here, from oscillators and noise.
   There is not a single audio file — partly because it is more interesting,
   mostly because a drum machine that has to download 40 samples before it can
   make a sound is not a toy, it is a loading screen.

   Two things in here are the difference between "it works" and "it is in time":

   1. ONE AudioContext, created on a gesture.
      Browsers refuse to start audio without one, and creating a second context
      per component is how you end up with two clocks that disagree.

   2. Scheduling against `context.currentTime`, never against setInterval.
      A timer fires when the main thread gets round to it. The audio clock is a
      real clock. So the scheduler looks a fraction of a second into the future
      and books notes at exact times; the timer only has to be roughly on time
      for the notes to be exactly on time.
   ========================================================================= */

type audioRig = {
  context: AudioContext
  master: GainNode
}

let rig: audioRig | null = null
let noiseBuffer: AudioBuffer | null = null

/** The one context, created lazily so nothing happens before a click. */
export function getAudio(): audioRig {
  if (rig !== null) return rig

  const context = new AudioContext()

  const master = context.createGain()
  master.gain.value = 0.75

  // Several voices at once will clip without something holding the peaks down
  const limiter = context.createDynamicsCompressor()
  limiter.threshold.value = -8
  limiter.knee.value = 6
  limiter.ratio.value = 12
  limiter.attack.value = 0.003
  limiter.release.value = 0.18

  master.connect(limiter)
  limiter.connect(context.destination)

  rig = { context, master }
  return rig
}

/** Call from a click or a key press before making any sound. */
export async function unlockAudio() {
  const { context } = getAudio()
  if (context.state !== "running") await context.resume()
  return context
}

export function setMasterVolume(value: number) {
  const { context, master } = getAudio()
  master.gain.setTargetAtTime(value, context.currentTime, 0.02)
}

/* ---- Noise ---------------------------------------------------------------
   One second of white noise, generated once and reused for every hat, snare
   and crash on the page. */
function getNoise(context: AudioContext) {
  if (noiseBuffer !== null) return noiseBuffer

  const length = context.sampleRate
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1
  }

  noiseBuffer = buffer
  return buffer
}

/* ---- Pitch --------------------------------------------------------------- */
export const midiToFrequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export const SCALES: Record<string, number[]> = {
  "Minor pentatonic": [0, 3, 5, 7, 10],
  "Major pentatonic": [0, 2, 4, 7, 9],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  "Harmonic minor": [0, 2, 3, 5, 7, 8, 11],
  "Whole tone": [0, 2, 4, 6, 8, 10],
}

export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

/** Degree may run past the end of the scale — it wraps into higher octaves. */
export function scaleNote(scale: number[], root: number, degree: number) {
  const octave = Math.floor(degree / scale.length)
  const step = ((degree % scale.length) + scale.length) % scale.length
  return root + scale[step] + octave * 12
}

export function noteName(midi: number) {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`
}

/* ============================================================================
   VOICES
   Each one books its whole envelope at absolute times and then forgets about
   it. Nothing needs cleaning up: an OscillatorNode that has stopped is
   collected on its own.
   ========================================================================= */

export type toneOptions = {
  frequency: number
  duration?: number
  type?: OscillatorType
  gain?: number
  attack?: number
  release?: number
  /** Low-pass cutoff in Hz; the filter sweeps down over the note. */
  cutoff?: number
  detune?: number
  pan?: number
}

export function playTone(when: number, options: toneOptions) {
  const { context, master } = getAudio()

  const {
    frequency,
    duration = 0.35,
    type = "sawtooth",
    gain = 0.25,
    attack = 0.008,
    release = 0.14,
    cutoff = 2400,
    detune = 0,
    pan = 0,
  } = options

  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.value = frequency
  oscillator.detune.value = detune

  const filter = context.createBiquadFilter()
  filter.type = "lowpass"
  filter.Q.value = 6
  filter.frequency.setValueAtTime(cutoff, when)
  filter.frequency.exponentialRampToValueAtTime(Math.max(180, cutoff * 0.25), when + duration)

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, when)
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), when + attack)
  envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration + release)

  const panner = context.createStereoPanner()
  panner.pan.value = pan

  oscillator.connect(filter)
  filter.connect(envelope)
  envelope.connect(panner)
  panner.connect(master)

  oscillator.start(when)
  oscillator.stop(when + duration + release + 0.02)
}

/** A short plucked note — two detuned saws through a fast filter sweep. */
export function playPluck(when: number, frequency: number, gain = 0.22, duration = 0.3) {
  playTone(when, { frequency, duration, gain, type: "sawtooth", cutoff: 3200, attack: 0.004, release: 0.22 })
  playTone(when, { frequency, duration, gain: gain * 0.5, type: "square", detune: 7, cutoff: 1800, attack: 0.006, release: 0.2 })
}

/** A soft sine bell, good for collisions. */
export function playBell(when: number, frequency: number, gain = 0.2, duration = 0.9) {
  const { context, master } = getAudio()

  const oscillator = context.createOscillator()
  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(frequency, when)

  const partial = context.createOscillator()
  partial.type = "sine"
  partial.frequency.setValueAtTime(frequency * 2.76, when)

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, when)
  envelope.gain.exponentialRampToValueAtTime(gain, when + 0.005)
  envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration)

  const partialGain = context.createGain()
  partialGain.gain.setValueAtTime(0.0001, when)
  partialGain.gain.exponentialRampToValueAtTime(gain * 0.25, when + 0.004)
  partialGain.gain.exponentialRampToValueAtTime(0.0001, when + duration * 0.5)

  oscillator.connect(envelope)
  partial.connect(partialGain)
  envelope.connect(master)
  partialGain.connect(master)

  oscillator.start(when)
  partial.start(when)
  oscillator.stop(when + duration + 0.05)
  partial.stop(when + duration * 0.5 + 0.05)
}

export function playKick(when: number, gain = 0.9, tune = 150) {
  const { context, master } = getAudio()

  const oscillator = context.createOscillator()
  oscillator.type = "sine"
  // The drop from 150Hz to 45Hz in 90ms is the entire sound of a kick drum
  oscillator.frequency.setValueAtTime(tune, when)
  oscillator.frequency.exponentialRampToValueAtTime(45, when + 0.09)

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, when)
  envelope.gain.exponentialRampToValueAtTime(gain, when + 0.005)
  envelope.gain.exponentialRampToValueAtTime(0.0001, when + 0.34)

  oscillator.connect(envelope)
  envelope.connect(master)
  oscillator.start(when)
  oscillator.stop(when + 0.4)
}

export function playSnare(when: number, gain = 0.5) {
  const { context, master } = getAudio()

  const noise = context.createBufferSource()
  noise.buffer = getNoise(context)

  const noiseFilter = context.createBiquadFilter()
  noiseFilter.type = "highpass"
  noiseFilter.frequency.value = 1400

  const noiseEnvelope = context.createGain()
  noiseEnvelope.gain.setValueAtTime(0.0001, when)
  noiseEnvelope.gain.exponentialRampToValueAtTime(gain, when + 0.004)
  noiseEnvelope.gain.exponentialRampToValueAtTime(0.0001, when + 0.17)

  // The body under the noise is what stops it sounding like a hiss
  const body = context.createOscillator()
  body.type = "triangle"
  body.frequency.setValueAtTime(190, when)
  body.frequency.exponentialRampToValueAtTime(120, when + 0.1)

  const bodyEnvelope = context.createGain()
  bodyEnvelope.gain.setValueAtTime(0.0001, when)
  bodyEnvelope.gain.exponentialRampToValueAtTime(gain * 0.55, when + 0.004)
  bodyEnvelope.gain.exponentialRampToValueAtTime(0.0001, when + 0.11)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseEnvelope)
  noiseEnvelope.connect(master)
  body.connect(bodyEnvelope)
  bodyEnvelope.connect(master)

  noise.start(when)
  noise.stop(when + 0.22)
  body.start(when)
  body.stop(when + 0.15)
}

export function playHat(when: number, gain = 0.28, open = false) {
  const { context, master } = getAudio()
  const length = open ? 0.32 : 0.055

  const noise = context.createBufferSource()
  noise.buffer = getNoise(context)
  noise.playbackRate.value = 1.6

  const filter = context.createBiquadFilter()
  filter.type = "highpass"
  filter.frequency.value = 7800

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, when)
  envelope.gain.exponentialRampToValueAtTime(gain, when + 0.002)
  envelope.gain.exponentialRampToValueAtTime(0.0001, when + length)

  noise.connect(filter)
  filter.connect(envelope)
  envelope.connect(master)

  noise.start(when)
  noise.stop(when + length + 0.05)
}

export function playClap(when: number, gain = 0.42) {
  // Four bursts a few milliseconds apart — that stutter is what makes a clap
  // sound like hands rather than a short noise burst.
  for (const eachOffset of [0, 0.011, 0.023, 0.038]) {
    const { context, master } = getAudio()

    const noise = context.createBufferSource()
    noise.buffer = getNoise(context)

    const filter = context.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.value = 1650
    filter.Q.value = 1.2

    const envelope = context.createGain()
    const start = when + eachOffset
    envelope.gain.setValueAtTime(0.0001, start)
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.002)
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + (eachOffset === 0.038 ? 0.2 : 0.035))

    noise.connect(filter)
    filter.connect(envelope)
    envelope.connect(master)

    noise.start(start)
    noise.stop(start + 0.25)
  }
}

/* ============================================================================
   THE STEP SCHEDULER

   The lookahead pattern. A timer wakes up every 25ms and books every step that
   falls inside the next 120ms, at an exact `context.currentTime` offset. The
   timer is allowed to be late — it has 120ms of slack — and the notes still
   land on the sample.

   Doing it the obvious way instead, `setInterval(playStep, 60000 / bpm / 4)`,
   drifts audibly within about four bars, and stalls completely when the tab
   is throttled.
   ========================================================================= */

const LOOKAHEAD_SECONDS = 0.12
const TICK_MILLISECONDS = 25

export type stepScheduler = {
  start: () => void
  stop: () => void
  /** The step index currently sounding, for drawing the playhead. */
  readAheadStep: () => number
  /** Absolute audio time of the current step, for animating against. */
  readAheadTime: () => number
  dispose: () => void
}

export function createStepScheduler(options: {
  /** Called for each step, with the exact time it should sound. */
  onStep: (step: number, time: number) => void
  getTempo: () => number
  /** 0 = straight, 0.5 = heavy shuffle. Applied to odd sixteenths. */
  getSwing?: () => number
  stepsPerBar?: number
  startAtStep?: number
}): stepScheduler {
  const {
    onStep,
    getTempo,
    getSwing = () => 0,
    stepsPerBar = 16,
    startAtStep = 0,
  } = options

  let timer = 0
  let nextStep = startAtStep
  let nextTime = 0
  let soundingStep = startAtStep
  let soundingTime = 0

  const stepSeconds = () => 60 / getTempo() / 4

  const tick = () => {
    const { context } = getAudio()

    while (nextTime < context.currentTime + LOOKAHEAD_SECONDS) {
      // Swing delays every other sixteenth; the pair still takes the same time
      const swung = nextStep % 2 === 1 ? stepSeconds() * getSwing() * 0.6 : 0

      onStep(nextStep, nextTime + swung)
      soundingStep = nextStep
      soundingTime = nextTime + swung

      nextTime += stepSeconds()
      nextStep = (nextStep + 1) % stepsPerBar
    }
  }

  return {
    start() {
      if (timer !== 0) return
      const { context } = getAudio()
      nextTime = context.currentTime + 0.06
      tick()
      timer = window.setInterval(tick, TICK_MILLISECONDS)
    },
    stop() {
      if (timer === 0) return
      window.clearInterval(timer)
      timer = 0
      nextStep = 0
      soundingStep = 0
    },
    readAheadStep: () => soundingStep,
    readAheadTime: () => soundingTime,
    dispose() {
      if (timer !== 0) window.clearInterval(timer)
      timer = 0
    },
  }
}

/* ============================================================================
   THE TRANSPORT

   The same idea for arbitrary positions rather than a fixed grid: it reports
   where the playhead is, derived from the audio clock, and hands out the
   window of song-time it needs filled next.
   ========================================================================= */
export type transport = {
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
  position: () => number
  playing: () => boolean
  dispose: () => void
}

export function createTransport(options: {
  /** Book everything falling between `from` and `to` (song seconds). */
  onWindow: (from: number, to: number, audioTimeAt: (songSeconds: number) => number) => void
  /** Loops back to zero on reaching this, if given. */
  getLength: () => number
  loop?: () => boolean
}): transport {
  const { onWindow, getLength, loop = () => true } = options

  let timer = 0
  let running = false
  let originAudioTime = 0
  let originSongTime = 0
  let scheduledTo = 0

  const now = () => getAudio().context.currentTime

  const position = () => {
    if (!running) return originSongTime
    const raw = originSongTime + (now() - originAudioTime)
    const length = getLength()
    if (length <= 0) return raw
    return loop() ? raw % length : Math.min(raw, length)
  }

  const tick = () => {
    const length = getLength()
    const windowEnd = position() + LOOKAHEAD_SECONDS * 3

    const audioTimeAt = (songSeconds: number) =>
      originAudioTime + (songSeconds - originSongTime)

    if (length > 0 && loop() && windowEnd > length) {
      // The window straddles the loop point: fill to the end, then re-anchor
      onWindow(scheduledTo, length, audioTimeAt)

      originAudioTime += length - originSongTime
      originSongTime = 0
      scheduledTo = 0
      onWindow(0, windowEnd - length, songSeconds => originAudioTime + songSeconds)
      scheduledTo = windowEnd - length
      return
    }

    if (windowEnd > scheduledTo) {
      onWindow(scheduledTo, windowEnd, audioTimeAt)
      scheduledTo = windowEnd
    }
  }

  return {
    play() {
      if (running) return
      running = true
      originAudioTime = now() + 0.05
      scheduledTo = originSongTime
      tick()
      timer = window.setInterval(tick, TICK_MILLISECONDS)
    },
    pause() {
      if (!running) return
      originSongTime = position()
      running = false
      window.clearInterval(timer)
      timer = 0
    },
    seek(seconds: number) {
      originSongTime = Math.max(0, seconds)
      scheduledTo = originSongTime
      if (running) originAudioTime = now()
    },
    position,
    playing: () => running,
    dispose() {
      if (timer !== 0) window.clearInterval(timer)
      timer = 0
      running = false
    },
  }
}
