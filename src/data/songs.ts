// Canciones de dominio público, en Sol mayor y dentro del rango con grabaciones
// reales de guitarra (G3, A3, B3, C4, D4, E4, F#4, G4). Pensadas para primeras
// semanas: primera posición sobre las cuerdas 3.ª, 2.ª y 1.ª.

export interface SongNote {
  midi: number;
  beats: number;
  lyric?: string;
}

export interface Song {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  tempo: number;
  notes: SongNote[];
}

// Nombres cortos para mostrar (español).
export const NOTE_LABEL: Record<number, string> = {
  40: "Mi", 45: "La", 50: "Re", 55: "Sol", 57: "La",
  59: "Si", 60: "Do", 62: "Re", 64: "Mi", 66: "Fa♯", 67: "Sol"
};

/** Dónde se toca cada nota en la primera posición: cuerda y traste. */
export const POSITION_LABEL: Record<number, string> = {
  40: "6ª al aire",
  45: "5ª al aire",
  50: "4ª al aire",
  55: "3ª al aire",
  57: "3ª · traste 2",
  59: "2ª al aire",
  60: "2ª · traste 1",
  62: "2ª · traste 3",
  64: "1ª al aire",
  66: "1ª · traste 2",
  67: "1ª · traste 3"
};

export const songs: Song[] = [
  {
    id: "estrellita",
    title: "Estrellita",
    subtitle: "Brilla, brilla",
    emoji: "⭐",
    tempo: 92,
    notes: [
      { midi: 55, beats: 1, lyric: "Es" }, { midi: 55, beats: 1, lyric: "tre" },
      { midi: 62, beats: 1, lyric: "lli" }, { midi: 62, beats: 1, lyric: "ta" },
      { midi: 64, beats: 1, lyric: "¿dón" }, { midi: 64, beats: 1, lyric: "de" }, { midi: 62, beats: 2, lyric: "es?" },
      { midi: 60, beats: 1, lyric: "Me" }, { midi: 60, beats: 1, lyric: "pre" },
      { midi: 59, beats: 1, lyric: "gun" }, { midi: 59, beats: 1, lyric: "to" },
      { midi: 57, beats: 1, lyric: "qué" }, { midi: 57, beats: 1, lyric: "se" }, { midi: 55, beats: 2, lyric: "rás" }
    ]
  },
  {
    id: "himno-alegria",
    title: "Himno a la alegría",
    subtitle: "Beethoven",
    emoji: "🎉",
    tempo: 96,
    notes: [
      { midi: 59, beats: 1 }, { midi: 59, beats: 1 }, { midi: 60, beats: 1 }, { midi: 62, beats: 1 },
      { midi: 62, beats: 1 }, { midi: 60, beats: 1 }, { midi: 59, beats: 1 }, { midi: 57, beats: 1 },
      { midi: 55, beats: 1 }, { midi: 55, beats: 1 }, { midi: 57, beats: 1 }, { midi: 59, beats: 1 },
      { midi: 59, beats: 1.5 }, { midi: 57, beats: 0.5 }, { midi: 57, beats: 2 }
    ]
  },
  {
    id: "corderito",
    title: "Mi corderito",
    subtitle: "Mary tenía un corderito",
    emoji: "🐑",
    tempo: 100,
    notes: [
      { midi: 59, beats: 1 }, { midi: 57, beats: 1 }, { midi: 55, beats: 1 }, { midi: 57, beats: 1 },
      { midi: 59, beats: 1 }, { midi: 59, beats: 1 }, { midi: 59, beats: 2 },
      { midi: 57, beats: 1 }, { midi: 57, beats: 1 }, { midi: 57, beats: 2 },
      { midi: 59, beats: 1 }, { midi: 62, beats: 1 }, { midi: 62, beats: 2 },
      { midi: 59, beats: 1 }, { midi: 57, beats: 1 }, { midi: 55, beats: 1 }, { midi: 57, beats: 1 },
      { midi: 59, beats: 1 }, { midi: 59, beats: 1 }, { midi: 59, beats: 1 }, { midi: 59, beats: 1 },
      { midi: 57, beats: 1 }, { midi: 57, beats: 1 }, { midi: 59, beats: 1 }, { midi: 57, beats: 1 }, { midi: 55, beats: 2 }
    ]
  }
];
