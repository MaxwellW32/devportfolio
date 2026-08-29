/* ============================================================================
   THE CLIP LIBRARY

   A clip is a pattern of events measured in beats. Placing one on the timeline
   only records where it starts and how long it runs; the notes themselves are
   generated at schedule time from the definition here, which is why dragging a
   clip is instant and why the same clip can be four bars long without storing
   four bars of anything.
   ========================================================================= */

import {
  midiToFrequency,
  playClap,
  playHat,
  playKick,
  playPluck,
  playSnare,
  playTone,
} from "../_audio/synth"

export type trackId = "drums" | "bass" | "chords" | "lead"

export type clipEvent = {
  /** Offset from the start of the pattern, in beats. */
  beat: number
  play: (time: number, gain: number) => void
}

export type clipDefinition = {
  id: string
  track: trackId
  name: string
  /** Length of one repetition, in beats. */
  beats: number
  events: clipEvent[]
}

export type placedClip = {
  id: string
  definitionId: string
  track: trackId
  start: number
  length: number
}

export const TRACKS: { id: trackId; name: string; hue: number }[] = [
  { id: "drums", name: "Drums", hue: 122 },
  { id: "bass", name: "Bass", hue: 40 },
  { id: "chords", name: "Chords", hue: 220 },
  { id: "lead", name: "Lead", hue: 300 },
]

/* ---- Pitch helpers -------------------------------------------------------
   Everything is in A minor, because a demo that lets you place clips in four
   unrelated keys is a demo that sounds broken however carefully it is coded. */
const A = 57
const MINOR = [0, 2, 3, 5, 7, 8, 10]

const degree = (index: number, octave = 0) => {
  const wrapped = ((index % MINOR.length) + MINOR.length) % MINOR.length
  return A + MINOR[wrapped] + (Math.floor(index / MINOR.length) + octave) * 12
}

const chord = (root: number, shape: number[]) => shape.map(eachStep => degree(root + eachStep))

const pad = (notes: number[], length: number): clipEvent["play"] => (time, gain) => {
  notes.forEach((eachNote, eachIndex) => {
    playTone(time, {
      frequency: midiToFrequency(eachNote),
      duration: length,
      gain: gain * 0.11,
      type: "sawtooth",
      cutoff: 1500,
      attack: 0.09,
      release: 0.5,
      detune: (eachIndex - 1) * 5,
      pan: (eachIndex - 1) * 0.25,
    })
  })
}

const bassNote = (note: number, length = 0.42): clipEvent["play"] => (time, gain) => {
  playTone(time, {
    frequency: midiToFrequency(note - 24),
    duration: length,
    gain: gain * 0.36,
    type: "triangle",
    cutoff: 700,
    attack: 0.006,
    release: 0.12,
  })
}

const lead = (note: number): clipEvent["play"] => (time, gain) =>
  playPluck(time, midiToFrequency(note + 12), gain * 0.18, 0.22)

/* ---- The clips ----------------------------------------------------------- */
export const CLIPS: clipDefinition[] = [
  {
    id: "four",
    track: "drums",
    name: "Four on the floor",
    beats: 4,
    events: [
      { beat: 0, play: (t, g) => playKick(t, g) },
      { beat: 1, play: (t, g) => playKick(t, g * 0.9) },
      { beat: 2, play: (t, g) => playKick(t, g) },
      { beat: 3, play: (t, g) => playKick(t, g * 0.9) },
      { beat: 1, play: (t, g) => playClap(t, g * 0.4) },
      { beat: 3, play: (t, g) => playClap(t, g * 0.4) },
      ...[0.5, 1.5, 2.5, 3.5].map(eachBeat => ({
        beat: eachBeat,
        play: (t: number, g: number) => playHat(t, g * 0.22, true),
      })),
    ],
  },
  {
    id: "break",
    track: "drums",
    name: "Break",
    beats: 4,
    events: [
      { beat: 0, play: (t, g) => playKick(t, g) },
      { beat: 0.75, play: (t, g) => playKick(t, g * 0.7) },
      { beat: 2.5, play: (t, g) => playKick(t, g * 0.85) },
      { beat: 1, play: (t, g) => playSnare(t, g * 0.5) },
      { beat: 3, play: (t, g) => playSnare(t, g * 0.5) },
      { beat: 3.75, play: (t, g) => playSnare(t, g * 0.25) },
      ...[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(eachBeat => ({
        beat: eachBeat,
        play: (t: number, g: number) => playHat(t, eachBeat % 1 === 0 ? g * 0.2 : g * 0.1),
      })),
    ],
  },
  {
    id: "halftime",
    track: "drums",
    name: "Half time",
    beats: 4,
    events: [
      { beat: 0, play: (t, g) => playKick(t, g) },
      { beat: 2, play: (t, g) => playSnare(t, g * 0.55) },
      { beat: 2.5, play: (t, g) => playHat(t, g * 0.14) },
      { beat: 3.5, play: (t, g) => playHat(t, g * 0.14) },
    ],
  },
  {
    id: "rootpulse",
    track: "bass",
    name: "Root pulse",
    beats: 4,
    events: [0, 1, 2, 3].map(eachBeat => ({
      beat: eachBeat,
      play: bassNote(degree(0)),
    })),
  },
  {
    id: "walk",
    track: "bass",
    name: "Walking",
    beats: 4,
    events: [
      { beat: 0, play: bassNote(degree(0)) },
      { beat: 1, play: bassNote(degree(2)) },
      { beat: 2, play: bassNote(degree(4)) },
      { beat: 3, play: bassNote(degree(3)) },
    ],
  },
  {
    id: "offbeat",
    track: "bass",
    name: "Offbeat",
    beats: 2,
    events: [
      { beat: 0.5, play: bassNote(degree(0), 0.24) },
      { beat: 1.5, play: bassNote(degree(4), 0.24) },
    ],
  },
  {
    id: "padam",
    track: "chords",
    name: "Pad — Am",
    beats: 4,
    events: [{ beat: 0, play: pad(chord(0, [0, 2, 4]), 3.6) }],
  },
  {
    id: "padf",
    track: "chords",
    name: "Pad — F",
    beats: 4,
    events: [{ beat: 0, play: pad(chord(5, [0, 2, 4]), 3.6) }],
  },
  {
    id: "stabs",
    track: "chords",
    name: "Stabs",
    beats: 2,
    events: [
      { beat: 0.5, play: pad(chord(0, [0, 2, 4]), 0.22) },
      { beat: 1.25, play: pad(chord(4, [0, 2, 4]), 0.22) },
    ],
  },
  {
    id: "arpup",
    track: "lead",
    name: "Arp up",
    beats: 2,
    events: [0, 2, 4, 6].map((eachDegree, eachIndex) => ({
      beat: eachIndex * 0.5,
      play: lead(degree(eachDegree)),
    })),
  },
  {
    id: "arpdown",
    track: "lead",
    name: "Arp down",
    beats: 2,
    events: [6, 4, 2, 0].map((eachDegree, eachIndex) => ({
      beat: eachIndex * 0.5,
      play: lead(degree(eachDegree)),
    })),
  },
  {
    id: "hook",
    track: "lead",
    name: "Hook",
    beats: 4,
    events: [
      { beat: 0, play: lead(degree(4)) },
      { beat: 0.75, play: lead(degree(6)) },
      { beat: 1.5, play: lead(degree(7)) },
      { beat: 2.25, play: lead(degree(6)) },
      { beat: 3, play: lead(degree(4)) },
      { beat: 3.5, play: lead(degree(2)) },
    ],
  },
]

export const clipById = (id: string) => CLIPS.find(eachClip => eachClip.id === id) ?? null

export const clipsForTrack = (track: trackId) =>
  CLIPS.filter(eachClip => eachClip.track === track)

/** Something worth pressing play on the moment the page loads. */
export function startingArrangement(): placedClip[] {
  return [
    { id: "a", definitionId: "padam", track: "chords", start: 0, length: 8 },
    { id: "b", definitionId: "rootpulse", track: "bass", start: 0, length: 8 },
    { id: "c", definitionId: "halftime", track: "drums", start: 4, length: 4 },
    { id: "d", definitionId: "four", track: "drums", start: 8, length: 8 },
    { id: "e", definitionId: "walk", track: "bass", start: 8, length: 8 },
    { id: "f", definitionId: "padf", track: "chords", start: 8, length: 4 },
    { id: "g", definitionId: "padam", track: "chords", start: 12, length: 4 },
    { id: "h", definitionId: "arpup", track: "lead", start: 8, length: 4 },
    { id: "i", definitionId: "hook", track: "lead", start: 12, length: 4 },
  ]
}
