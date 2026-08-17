import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AchievementShelf } from "./components/AchievementShelf";
import { CapabilityChips } from "./components/CapabilityChips";
import { CapabilityPanel } from "./components/CapabilityPanel";
import { OnboardingDialog } from "./components/OnboardingDialog";
import { PwaNotices } from "./components/PwaNotices";
import { useCapabilities } from "./hooks/useCapabilities";
import { lessons, worlds } from "./data/curriculum";
import { songs, NOTE_LABEL, POSITION_LABEL, type Song } from "./data/songs";
import { ensureAudioReady, playClick, playGuitarTone, preloadGuitarStrings, scheduleClick, speakInstruction, startDrone, stopDrone } from "./lib/audio";
import { getAchievements, type Achievement } from "./lib/achievements";
import { MetronomeScheduler, type Subdivision } from "./lib/metronome";
import { createFamilyPin, isValidFamilyPin, verifyFamilyPin } from "./lib/familyPin";
import { useModalA11y } from "./hooks/useModalA11y";
import {
  autoCorrelate,
  BEGINNER_NOTES,
  frequencyForMidi,
  getGuitarStrings,
  nearestChromaticNote,
  nearestGuitarString,
  PITCH_ANALYSIS_INTERVAL_MS,
  type PitchResult
} from "./lib/pitch";
import {
  calculateStreak,
  createLocalId,
  defaultProgress,
  exportProgress,
  loadProgress,
  localDateKey,
  parseProgressImport,
  saveProgress,
  weeklyHistory,
  weeklyMinutes
} from "./lib/storage";
import {
  clearPracticeTimer,
  loadPracticeTimer,
  savePracticeTimer,
  type PracticeTimerState
} from "./lib/practiceTimer";
import type { BeforeInstallPromptEvent } from "./lib/pwa";
import type { Lesson, ProgressState, Screen } from "./types";

const navigation: Array<{ id: Screen; label: string; icon: string }> = [
  { id: "home", label: "Inicio", icon: "🏠" },
  { id: "path", label: "Ruta", icon: "🗺️" },
  { id: "tuner", label: "Afinador", icon: "🎯" },
  { id: "rhythm", label: "Ritmo", icon: "🥁" },
  { id: "songs", label: "Canciones", icon: "🎵" },
  { id: "practice", label: "Práctica", icon: "⏱️" },
  { id: "family", label: "Familia", icon: "👨‍👩‍👧" }
];

/**
 * Escala de Sol mayor en primera posición.
 *
 * La música de guitarra se escribe una octava más alta de lo que suena, así que
 * `position` (la altura del dibujo sobre el pentagrama) corresponde a la nota
 * escrita y `midi` a la que realmente se oye. `where` dice dónde tocarla, que a
 * esta altura del curso es más útil que el nombre científico.
 */
const READING_NOTES = [
  { name: "Sol", where: "3ª al aire", midi: 55, position: 48 },
  { name: "La", where: "3ª · traste 2", midi: 57, position: 60 },
  { name: "Si", where: "2ª al aire", midi: 59, position: 72 },
  { name: "Do", where: "2ª · traste 1", midi: 60, position: 84 },
  { name: "Re", where: "2ª · traste 3", midi: 62, position: 96 },
  { name: "Mi", where: "1ª al aire", midi: 64, position: 108 },
  { name: "Fa♯", where: "1ª · traste 2", midi: 66, position: 120 },
  { name: "Sol", where: "1ª · traste 3", midi: 67, position: 132 }
] as const;

function initialScreen(): Screen {
  const candidate = new URLSearchParams(window.location.search).get("screen");
  return navigation.some((item) => item.id === candidate) ? candidate as Screen : "home";
}

function App() {
  const [screen, setScreen] = useState<Screen>(() => initialScreen());
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const hasNavigatedRef = useRef(false);
  const capabilities = useCapabilities();

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => {
    const root = document.documentElement;
    if (progress.theme === "system") delete root.dataset.theme;
    else root.dataset.theme = progress.theme;
  }, [progress.theme]);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (screen === "home") url.searchParams.delete("screen");
    else url.searchParams.set("screen", screen);
    window.history.replaceState({}, "", url);
    if (hasNavigatedRef.current) mainRef.current?.focus({ preventScroll: true });
    hasNavigatedRef.current = true;
  }, [screen]);

  useEffect(() => {
    const markOnline = () => setOnline(true);
    const markOffline = () => setOnline(false);
    const showUpdate = () => setUpdateAvailable(true);
    const captureInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    window.addEventListener("guitarra:pwa-update", showUpdate);
    window.addEventListener("beforeinstallprompt", captureInstall);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("guitarra:pwa-update", showUpdate);
      window.removeEventListener("beforeinstallprompt", captureInstall);
    };
  }, []);

  const completedCount = progress.completedLessonIds.filter((id) => lessons.some((lesson) => lesson.id === id)).length;
  const totalMinutes = progress.practiceSessions.reduce((sum, session) => sum + session.minutes, 0);
  const thisWeekMinutes = weeklyMinutes(progress.practiceSessions);
  const nextLesson = lessons.find((lesson) => !progress.completedLessonIds.includes(lesson.id)) ?? lessons.at(-1)!;
  const achievements = useMemo(() => getAchievements({
    ...progress,
    completedLessonIds: progress.completedLessonIds.filter((id) => lessons.some((lesson) => lesson.id === id))
  }, lessons.length), [progress]);

  function completeLesson(lessonId: string) {
    setProgress((current) => ({
      ...current,
      completedLessonIds: current.completedLessonIds.includes(lessonId)
        ? current.completedLessonIds
        : [...current.completedLessonIds, lessonId]
    }));
  }

  function savePractice(minutes: number, focus: string, note: string) {
    const today = localDateKey();
    setProgress((current) => {
      const streakChange = calculateStreak(current.lastPracticeDate, today);
      const nextStreak = streakChange === "keep" ? current.streak : streakChange === 1 ? current.streak + 1 : 1;
      return {
        ...current,
        streak: nextStreak,
        lastPracticeDate: today,
        practiceSessions: [
          ...current.practiceSessions,
          { id: createLocalId("practice"), date: new Date().toISOString(), minutes, focus, note }
        ]
      };
    });
  }

  function recordReadingAttempt(correct: boolean) {
    setProgress((current) => ({
      ...current,
      readingAttempts: current.readingAttempts + 1,
      readingCorrect: current.readingCorrect + (correct ? 1 : 0)
    }));
  }

  return (
    <div className={progress.largeText ? "app large-text" : "app"}>
      <PwaNotices
        online={online}
        updateAvailable={updateAvailable}
        installPrompt={installPrompt}
        onInstallFinished={() => setInstallPrompt(null)}
      />
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("home")} aria-label="Ir al inicio">
          <span className="brand-mark">🎸</span>
          <span><strong>Mi Aventura con la Guitarra</strong><small>Aprender paso a paso</small></span>
        </button>
        <CapabilityChips states={capabilities.states} onManage={() => setScreen("family")} />
        <div className="top-stats" aria-label="Resumen de progreso">
          <span title="Racha de práctica">🔥 {progress.streak}</span>
          <span title="Lecciones completadas">⭐ {completedCount}/{lessons.length}</span>
          <span title="Minutos practicados">⏱️ {totalMinutes} min</span>
        </div>
      </header>

      <main id="main-content" ref={mainRef} className="content" tabIndex={-1}>
        {screen === "home" && (
          <HomeScreen
            name={progress.childName}
            completedCount={completedCount}
            nextLesson={nextLesson}
            weeklyMinutesValue={thisWeekMinutes}
            weeklyGoal={progress.weeklyGoalMinutes}
            challenges={progress.pitchChallengesCompleted}
            achievements={achievements}
            onOpenLesson={setActiveLesson}
            onNavigate={setScreen}
          />
        )}
        {screen === "path" && <LearningPath progress={progress} onOpenLesson={setActiveLesson} />}
        {screen === "tuner" && (
          <Tuner
            soundEnabled={progress.soundEnabled}
            microphoneAllowed={progress.microphoneEnabled && capabilities.states.microphone !== "unsupported"}
            calibration={progress.tunerCalibration}
            onCalibrationChange={(value) => setProgress((current) => ({ ...current, tunerCalibration: value }))}
            onChallengeComplete={() => setProgress((current) => ({ ...current, pitchChallengesCompleted: current.pitchChallengesCompleted + 1 }))}
          />
        )}
        {screen === "rhythm" && (
          <Metronome
            soundEnabled={progress.soundEnabled}
            readingCorrect={progress.readingCorrect}
            readingAttempts={progress.readingAttempts}
            onReadingAttempt={recordReadingAttempt}
          />
        )}
        {screen === "songs" && (
          <Songs
            soundEnabled={progress.soundEnabled}
            microphoneAllowed={progress.microphoneEnabled && capabilities.states.microphone !== "unsupported"}
            calibration={progress.tunerCalibration}
            songsCompleted={progress.songsCompleted}
            onSongComplete={() => setProgress((current) => ({ ...current, songsCompleted: current.songsCompleted + 1 }))}
          />
        )}
        {screen === "practice" && <PracticeTimer soundEnabled={progress.soundEnabled} onSave={savePractice} />}
        {screen === "family" && (
          <FamilyScreen
            progress={progress}
            achievements={achievements}
            setProgress={setProgress}
            capabilities={capabilities}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navegación principal">
        {navigation.map((item) => (
          <button key={item.id} className={screen === item.id ? "active" : ""} aria-current={screen === item.id ? "page" : undefined} onClick={() => setScreen(item.id)}>
            <span>{item.icon}</span><small>{item.label}</small>
          </button>
        ))}
      </nav>

      {activeLesson && (
        <LessonDialog
          lesson={activeLesson}
          isCompleted={progress.completedLessonIds.includes(activeLesson.id)}
          soundEnabled={progress.soundEnabled}
          onClose={() => setActiveLesson(null)}
          onComplete={() => completeLesson(activeLesson.id)}
        />
      )}
      {!progress.onboardingCompleted && (
        <OnboardingDialog states={capabilities.states} onRequestMicrophone={capabilities.request} onComplete={(name, weeklyGoalMinutes) => setProgress((current) => ({
          ...current,
          onboardingCompleted: true,
          childName: name,
          weeklyGoalMinutes
        }))} />
      )}
    </div>
  );
}

function HomeScreen({
  name, completedCount, nextLesson, weeklyMinutesValue, weeklyGoal, challenges, achievements, onOpenLesson, onNavigate
}: {
  name: string;
  completedCount: number;
  nextLesson: Lesson;
  weeklyMinutesValue: number;
  weeklyGoal: number;
  challenges: number;
  achievements: Achievement[];
  onOpenLesson: (lesson: Lesson) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const percentage = Math.round((completedCount / lessons.length) * 100);
  const goalPercentage = Math.min(100, Math.round((weeklyMinutesValue / weeklyGoal) * 100));
  return (
    <section className="screen-grid">
      <article className="hero-card">
        <div>
          <span className="eyebrow">AVENTURA DEL DÍA</span>
          <h1>¡Hola, {name}! 👋</h1>
          <p>Hoy solo necesitas unos minutos, curiosidad y una postura relajada.</p>
          <button className="primary-button" onClick={() => onOpenLesson(nextLesson)}>Continuar: {nextLesson.title}</button>
        </div>
        <div className="progress-orbit" role="progressbar" aria-label="Progreso del curso" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}><strong>{percentage}%</strong><span>del viaje</span></div>
      </article>

      <div className="quick-grid">
        <button className="quick-card purple" onClick={() => onNavigate("tuner")}><span className="quick-icon">🎯</span><strong>Escuchar una nota</strong><small>{challenges} desafíos logrados</small></button>
        <button className="quick-card coral" onClick={() => onNavigate("rhythm")}><span className="quick-icon">🥁</span><strong>Entrenar el pulso</strong><small>Metrónomo y patrones</small></button>
        <button className="quick-card teal" onClick={() => onNavigate("practice")}><span className="quick-icon">⏱️</span><strong>Sesión guiada</strong><small>5, 10, 15 o 20 minutos</small></button>
      </div>

      <div className="home-info-grid">
        <article className="card goal-card">
          <div><span className="eyebrow">META SEMANAL</span><h2>{weeklyMinutesValue} de {weeklyGoal} minutos</h2></div>
          <div className="goal-track" role="progressbar" aria-label="Meta semanal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={goalPercentage}><span style={{ width: `${goalPercentage}%` }} /></div>
          <p>{goalPercentage >= 100 ? "¡Meta cumplida! El descanso también forma parte del aprendizaje." : "Cada práctica breve y tranquila suma."}</p>
        </article>
        <article className="card tip-card"><div className="tip-icon">💡</div><div><h2>Consejo para hoy</h2><p>El sonido mejora cuando el cuerpo está relajado. Descansa antes de que aparezca dolor o cansancio.</p></div></article>
        <article className="card achievement-card"><div><span className="eyebrow">MIS INSIGNIAS</span><h2>{achievements.filter((item) => item.earned).length} logradas</h2></div><AchievementShelf achievements={achievements} compact /></article>
      </div>
    </section>
  );
}

function LearningPath({ progress, onOpenLesson }: { progress: ProgressState; onOpenLesson: (lesson: Lesson) => void }) {
  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">CURSO INICIAL AMPLIADO</span><h1>Ruta de 24 lecciones</h1><p>Seis mundos progresivos. Una profesora debe revisar postura, ajuste del instrumento y afinación de los dedos.</p></div></div>
      <div className="world-list">
        {worlds.map((world) => {
          const worldLessons = lessons.filter((lesson) => lesson.world === world.id);
          const completedInWorld = worldLessons.filter((lesson) => progress.completedLessonIds.includes(lesson.id)).length;
          return (
            <article className="world-card" key={world.id}>
              <header><span className="world-icon">{world.icon}</span><div><small>Mundo {world.id} · {completedInWorld}/{worldLessons.length}</small><h2>{world.title}</h2><p>{world.subtitle}</p></div></header>
              <div className="lesson-list">
                {worldLessons.map((lesson) => {
                  const completed = progress.completedLessonIds.includes(lesson.id);
                  const previous = lessons.find((candidate) => candidate.order === lesson.order - 1);
                  const unlocked = lesson.order === 1 || !previous || progress.completedLessonIds.includes(previous.id);
                  return (
                    <button key={lesson.id} className={`lesson-row ${completed ? "completed" : ""}`} onClick={() => unlocked && onOpenLesson(lesson)} disabled={!unlocked}>
                      <span className="lesson-number">{completed ? "✓" : unlocked ? lesson.icon : "🔒"}</span>
                      <span className="lesson-copy"><strong>{lesson.title}</strong><small>{lesson.subtitle}</small><span className="skill-tags">{lesson.skills.map((skill) => <em key={skill}>{skill}</em>)}</span></span>
                      <span className="lesson-time">{lesson.durationMinutes} min</span>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LessonDialog({ lesson, isCompleted, soundEnabled, onClose, onComplete }: {
  lesson: Lesson; isCompleted: boolean; soundEnabled: boolean; onClose: () => void; onComplete: () => void;
}) {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [answer, setAnswer] = useState<number | null>(null);
  const [speechMessage, setSpeechMessage] = useState("");
  const dialogRef = useModalA11y<HTMLElement>(onClose);
  const correct = answer === lesson.quiz.answer;
  const ready = checkedSteps.length === lesson.steps.length && correct;

  useEffect(() => () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);

  function readStep(text: string) {
    if (!soundEnabled) return;
    setSpeechMessage(speakInstruction(text) ? "Leyendo la instrucción…" : "La lectura en voz alta no está disponible en este dispositivo.");
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <article ref={dialogRef} className="lesson-dialog" role="dialog" aria-modal="true" aria-labelledby="lesson-title" aria-describedby="lesson-objective" tabIndex={-1} onMouseDown={(event: { stopPropagation(): void }) => event.stopPropagation()}>
        <header className="dialog-header"><div><span className="lesson-hero-icon">{lesson.icon}</span><span className="eyebrow">LECCIÓN {lesson.order}</span><h1 id="lesson-title">{lesson.title}</h1><p id="lesson-objective">{lesson.objective}</p></div><button className="icon-button" onClick={onClose} aria-label="Cerrar lección">✕</button></header>
        {lesson.visualGuide && <figure className="visual-guide"><img src={lesson.visualGuide} alt={`Guía visual: ${lesson.title}`} /><figcaption>Observa la guía y compárala con una demostración de tu profesora.</figcaption></figure>}
        {lesson.adultNote && <aside className="adult-note"><strong>Para una persona adulta:</strong> {lesson.adultNote}</aside>}
        <div className="step-list">
          {lesson.steps.map((step, index) => {
            const checked = checkedSteps.includes(index);
            return (
              <div className={`step-card ${checked ? "done" : ""}`} key={step.title}>
                <button className="step-check" aria-label={checked ? "Marcar paso como pendiente" : "Marcar paso como realizado"} onClick={() => setCheckedSteps((current) => checked ? current.filter((value) => value !== index) : [...current, index])}><span className="check-circle">{checked ? "✓" : index + 1}</span></button>
                <div><strong>{step.title}</strong><p>{step.instruction}</p>{step.safety && <small className="safety">🛡️ {step.safety}</small>}<div className="step-tools">{soundEnabled && <button onClick={() => readStep(`${step.title}. ${step.instruction}`)}>🔊 Escuchar</button>}{step.referenceFrequency && <button onClick={() => void playGuitarTone(step.referenceFrequency!)}>♪ Nota de ejemplo</button>}</div></div>
                <small>{step.durationMinutes} min</small>
              </div>
            );
          })}
        </div>
        {speechMessage && <p className="assistive-message" role="status">{speechMessage}</p>}
        <section className="quiz-card"><span className="eyebrow">DESAFÍO FINAL</span><h2>{lesson.quiz.question}</h2><div className="quiz-options">{lesson.quiz.options.map((option, index) => <button key={option} className={answer === index ? "selected" : ""} onClick={() => setAnswer(index)}>{option}</button>)}</div>{answer !== null && <p role="status" className={correct ? "feedback success" : "feedback error"}>{correct ? "¡Muy bien! " : "Casi. "}{lesson.quiz.explanation}</p>}</section>
        <footer className="dialog-actions"><span>{isCompleted ? `🏅 Insignia: ${lesson.reward}` : `${checkedSteps.length}/${lesson.steps.length} pasos completados`}</span><button className="primary-button" disabled={!ready && !isCompleted} onClick={async () => { if (!isCompleted) onComplete(); if (soundEnabled) await playClick(true); onClose(); }}>{isCompleted ? "Cerrar" : "Completar lección"}</button></footer>
      </article>
    </div>
  );
}

function Tuner({ soundEnabled, microphoneAllowed, calibration, onCalibrationChange, onChallengeComplete }: {
  soundEnabled: boolean; microphoneAllowed: boolean; calibration: number; onCalibrationChange: (value: number) => void; onChallengeComplete: () => void;
}) {
  const [listening, setListening] = useState(false);
  const [mode, setMode] = useState<"chromatic" | "strings">("chromatic");
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [message, setMessage] = useState("Toca una nota larga y tranquila.");
  const [history, setHistory] = useState<number[]>([]);
  // Primera cuerda al aire: la nota más fácil de producir sin pisar nada.
  const [targetMidi, setTargetMidi] = useState<number>(64);
  const [challengeActive, setChallengeActive] = useState(false);
  const [stableFrames, setStableFrames] = useState(0);
  const [challengeMessage, setChallengeMessage] = useState("Elige una nota y trata de sostenerla afinada.");
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const challengeCompletedRef = useRef(false);
  const frameCounterRef = useRef(0);
  const modeRef = useRef(mode);
  const challengeActiveRef = useRef(challengeActive);
  const targetMidiRef = useRef(targetMidi);
  const calibrationRef = useRef(calibration);

  const [drone, setDrone] = useState(false);
  useEffect(() => { preloadGuitarStrings(); }, []);
  useEffect(() => () => stopDrone(), []);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { challengeActiveRef.current = challengeActive; }, [challengeActive]);
  useEffect(() => { targetMidiRef.current = targetMidi; }, [targetMidi]);
  useEffect(() => { calibrationRef.current = calibration; }, [calibration]);

  async function stopListening() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    await audioContextRef.current?.close();
    frameRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    setListening(false);
  }

  useEffect(() => () => { void stopListening(); }, []);

  function resetChallenge() {
    challengeCompletedRef.current = false;
    setStableFrames(0);
    setChallengeMessage("Escucha la referencia y luego toca la misma nota.");
  }

  async function startListening() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const context = new AudioContext();
      if (context.state === "suspended") await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.12;
      source.connect(analyser);
      streamRef.current = stream;
      audioContextRef.current = context;
      setListening(true);
      setMessage("Escuchando… evita hablar mientras sostienes la nota.");
      const buffer = new Float32Array(analyser.fftSize);
      let lastAnalysis = Number.NEGATIVE_INFINITY;
      const detect = (timestamp: number) => {
        frameRef.current = requestAnimationFrame(detect);
        if (timestamp - lastAnalysis < PITCH_ANALYSIS_INTERVAL_MS) return;
        lastAnalysis = timestamp;
        analyser.getFloatTimeDomainData(buffer);
        const frequency = autoCorrelate(buffer, context.sampleRate);
        if (frequency) {
          const result = modeRef.current === "strings" ? nearestGuitarString(frequency, calibrationRef.current) : nearestChromaticNote(frequency, calibrationRef.current);
          setPitch(result);
          frameCounterRef.current += 1;
          if (frameCounterRef.current % 2 === 0) setHistory((current) => [...current.slice(-39), Math.max(-50, Math.min(50, result.cents))]);
          if (challengeActiveRef.current && !challengeCompletedRef.current) {
            if (result.midi === targetMidiRef.current && Math.abs(result.cents) <= 15) {
              setStableFrames((current) => {
                const next = Math.min(30, current + 1);
                if (next >= 30 && !challengeCompletedRef.current) {
                  challengeCompletedRef.current = true;
                  setChallengeMessage("¡Logrado! Reconociste y sostuviste la nota. 🎉");
                  onChallengeComplete();
                  if (soundEnabled) void playClick(true);
                }
                return next;
              });
            } else {
              setStableFrames((current) => Math.max(0, current - 2));
              setChallengeMessage(result.midi === targetMidiRef.current ? "Es la nota correcta; ajústala un poco hacia el centro." : `Escucho ${result.noteName}. Busca la nota objetivo.`);
            }
          }
        }
      };
      frameRef.current = requestAnimationFrame(detect);
    } catch {
      setMessage("No se pudo abrir el micrófono. Revisa el permiso de la aplicación o del navegador.");
    }
  }

  const cents = Math.max(-50, Math.min(50, pitch?.cents ?? 0));
  const status = !pitch ? "Esperando sonido" : Math.abs(pitch.cents) <= 5 ? "¡Centrada!" : pitch.cents < 0 ? "Un poco baja" : "Un poco alta";
  const target = BEGINNER_NOTES.find((note) => note.midi === targetMidi) ?? BEGINNER_NOTES[8];
  const guitarStrings = getGuitarStrings(calibration);

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">ESCUCHAR Y AJUSTAR</span><h1>Afinador cromático</h1><p>Reconoce cuerdas al aire y notas pisadas. El audio se analiza en memoria y nunca se graba.</p></div></div>
      <div className="tool-grid">
        <article className="card tuner-card">
          <div className="segmented-control"><button className={mode === "chromatic" ? "selected" : ""} onClick={() => { setMode("chromatic"); setPitch(null); }}>Todas las notas</button><button className={mode === "strings" ? "selected" : ""} onClick={() => { setMode("strings"); setPitch(null); }}>Solo cuerdas</button></div>
          <div className={`tuner-status ${pitch && Math.abs(pitch.cents) <= 5 ? "in-tune" : ""}`}><small>{status}</small><strong>{pitch?.noteName ?? "—"}</strong><span>{pitch ? `${pitch.scientific} · ${pitch.frequency.toFixed(1)} Hz · ${pitch.cents > 0 ? "+" : ""}${pitch.cents.toFixed(0)} cents` : message}</span></div>
          <div className="tuner-scale" aria-label="Desviación de afinación"><div className="scale-line" /><div className="scale-center" /><div className="needle" style={{ transform: `translateX(${cents * 3}px)` }} /><span className="flat">♭ baja</span><span className="sharp">alta ♯</span></div>
          <div className="pitch-history" aria-label="Historial reciente de estabilidad">{history.length === 0 ? <small>El historial aparecerá al tocar.</small> : history.map((value, index) => <i key={`${index}-${value}`} style={{ height: `${Math.max(4, 42 - Math.abs(value) * 0.7)}px` }} title={`${value.toFixed(0)} cents`} />)}</div>
          <button className={listening ? "secondary-button danger" : "primary-button"} disabled={!microphoneAllowed} onClick={() => listening ? void stopListening() : void startListening()}>{listening ? "Detener micrófono" : "Activar micrófono"}</button>
          {!microphoneAllowed && <small className="capability-hint">🎤 El micrófono está desactivado. Actívalo en el panel Familia → Requisitos y permisos.</small>}
        </article>

        <div className="tool-side-stack">
          <article className="card">
            <h2>Notas de referencia</h2><p>La calibración habitual es 440 Hz. No la cambies sin indicación docente.</p>
            <label className="calibration-control"><span>La4 = <strong>{calibration} Hz</strong></span><input aria-label="Calibración de la nota La" type="range" min="432" max="446" step="1" value={calibration} onChange={(event: { target: HTMLInputElement }) => { onCalibrationChange(Number(event.target.value)); if (drone) { stopDrone(); setDrone(false); } }} /></label>
            <div className="string-buttons">{guitarStrings.map((string) => <button key={string.scientific} onClick={() => soundEnabled && void playGuitarTone(string.frequency)} title={`${string.name}, cuerda ${string.number}`}><strong>{string.note}</strong><span>{string.number}ª · {string.scientific}</span><small>{string.frequency.toFixed(2)} Hz</small></button>)}</div>
            <aside className="safety-box">🛡️ Ajustes grandes de clavijas deben realizarlos una persona adulta o profesora.</aside>
          </article>

          <article className="card challenge-card">
            <span className="eyebrow">DESAFÍO DE OÍDO</span><h2>Toca la nota objetivo</h2>
            <select value={targetMidi} onChange={(event: { target: HTMLSelectElement }) => { setTargetMidi(Number(event.target.value)); resetChallenge(); stopDrone(); setDrone(false); }}>{BEGINNER_NOTES.map((note) => <option key={note.scientific} value={note.midi}>{note.name} · {note.scientific}</option>)}</select>
            <button className="reference-button" onClick={() => soundEnabled && void playGuitarTone(frequencyForMidi(target.midi, calibration))}>♪ Escuchar {target.name}</button>
            <button className={drone ? "reference-button selected-toggle" : "reference-button"} aria-pressed={drone} onClick={async () => { if (drone) { stopDrone(); setDrone(false); } else if (soundEnabled) setDrone(await startDrone(frequencyForMidi(target.midi, calibration))); }}>{drone ? "⏹ Detener nota sostenida" : "🎵 Sostener la nota (referencia)"}</button>
            <div className="challenge-progress" role="progressbar" aria-label="Estabilidad de la nota objetivo" aria-valuemin={0} aria-valuemax={30} aria-valuenow={stableFrames}><span style={{ width: `${(stableFrames / 30) * 100}%` }} /></div>
            <p>{challengeMessage}</p>
            <button className="secondary-button" onClick={() => { const next = !challengeActive; setChallengeActive(next); challengeActiveRef.current = next; resetChallenge(); if (next && !listening) setChallengeMessage("Activa el micrófono y luego toca la nota objetivo."); }}>{challengeActive ? "Detener desafío" : "Comenzar desafío"}</button>
          </article>
        </div>
      </div>
    </section>
  );
}

function Metronome({ soundEnabled, readingCorrect, readingAttempts, onReadingAttempt }: { soundEnabled: boolean; readingCorrect: number; readingAttempts: number; onReadingAttempt: (correct: boolean) => void }) {
  const [bpm, setBpm] = useState(72);
  const [beats, setBeats] = useState(4);
  const [subdivision, setSubdivision] = useState<Subdivision>(1);
  const [running, setRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [visualOnly, setVisualOnly] = useState(false);
  const tapsRef = useRef<number[]>([]);
  const schedulerRef = useRef<MetronomeScheduler | null>(null);

  const settings = useMemo(() => ({ bpm, beats, subdivision }), [bpm, beats, subdivision]);
  const settingsRef = useRef(settings);
  const audible = soundEnabled && !visualOnly;
  const audibleRef = useRef(audible);

  // El tempo cambia en caliente: el planificador ya está corriendo y solo hay
  // que avisarle, sin reiniciar el pulso.
  useEffect(() => {
    settingsRef.current = settings;
    schedulerRef.current?.update(settings);
  }, [settings]);
  useEffect(() => { audibleRef.current = audible; }, [audible]);

  useEffect(() => {
    if (!running) { setCurrentBeat(0); return; }
    let cancelled = false;
    let frame: number | null = null;
    let scheduler: MetronomeScheduler | null = null;

    void (async () => {
      const context = await ensureAudioReady();
      if (cancelled) return;
      scheduler = new MetronomeScheduler(
        {
          now: () => context.currentTime,
          scheduleTick: (tick) => { if (audibleRef.current) scheduleClick(context, tick.time, tick.accent); }
        },
        settingsRef.current
      );
      schedulerRef.current = scheduler;
      scheduler.start();

      // La animación va por su cuenta: consume los clics ya sonados en lugar de
      // marcar el pulso, para que un frame perdido no descoloque el audio.
      const follow = () => {
        const due = scheduler?.drainDue() ?? [];
        if (due.length > 0) setCurrentBeat(due[due.length - 1].beat);
        frame = requestAnimationFrame(follow);
      };
      frame = requestAnimationFrame(follow);
    })();

    return () => {
      cancelled = true;
      if (frame !== null) cancelAnimationFrame(frame);
      scheduler?.stop();
      schedulerRef.current = null;
    };
  }, [running]);

  function tapTempo() {
    const now = performance.now();
    const recent = tapsRef.current.filter((time) => now - time < 2200);
    recent.push(now);
    tapsRef.current = recent.slice(-6);
    if (tapsRef.current.length >= 2) {
      const gaps: number[] = [];
      for (let index = 1; index < tapsRef.current.length; index += 1) gaps.push(tapsRef.current[index] - tapsRef.current[index - 1]);
      const average = gaps.reduce((sum, value) => sum + value, 0) / gaps.length;
      setBpm(Math.min(160, Math.max(40, Math.round(60_000 / average))));
    }
  }

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">ENTRENAMIENTO</span><h1>Metrónomo y pulso</h1><p>Empieza lento. Aumenta solo cuando puedas tocar relajada y mantener un sonido claro.</p></div></div>
      <article className="card metronome-card">
        <div className={running ? "pulse-disc active" : "pulse-disc"} key={`${currentBeat}-${running}`}><span>{currentBeat || "♪"}</span></div>
        <div className="bpm-readout"><strong>{bpm}</strong><span>BPM</span></div>
        <input aria-label="Velocidad del metrónomo" type="range" min="40" max="160" step="1" value={bpm} onChange={(event: { target: HTMLInputElement }) => setBpm(Number(event.target.value))} />
        <div className="tempo-presets">{[50, 60, 72, 80, 96, 120].map((value) => <button key={value} className={bpm === value ? "selected" : ""} onClick={() => setBpm(value)}>{value}</button>)}</div>
        <div className="meter-control"><span>Pulsos</span>{[2, 3, 4].map((value) => <button key={value} className={beats === value ? "selected" : ""} onClick={() => setBeats(value)}>{value}</button>)}</div>
        <div className="meter-control"><span>División</span><button className={subdivision === 1 ? "selected" : ""} onClick={() => setSubdivision(1)}>Negras</button><button className={subdivision === 2 ? "selected" : ""} onClick={() => setSubdivision(2)}>Corcheas</button></div>
        <div className="metro-actions">
          <button className="secondary-button" onClick={tapTempo}>👆 Marcar tempo</button>
          <button className={visualOnly ? "secondary-button selected-toggle" : "secondary-button"} aria-pressed={visualOnly} onClick={() => setVisualOnly((value) => !value)}>{visualOnly ? "🔇 Solo visual" : "🔊 Con sonido"}</button>
        </div>
        <button className={running ? "secondary-button" : "primary-button"} onClick={() => setRunning((value) => !value)}>{running ? "Pausar" : "Comenzar"}</button>
      </article>
      <MusicReadingGame soundEnabled={soundEnabled} score={readingCorrect} attempts={readingAttempts} onAttempt={onReadingAttempt} />
    </section>
  );
}

function MusicReadingGame({ soundEnabled, score, attempts, onAttempt }: {
  soundEnabled: boolean;
  score: number;
  attempts: number;
  onAttempt: (correct: boolean) => void;
}) {
  const [noteIndex, setNoteIndex] = useState(0);
  const [feedback, setFeedback] = useState("Observa si la nota está en una línea o en un espacio.");
  const [locked, setLocked] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const note = READING_NOTES[noteIndex];

  useEffect(() => () => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
  }, []);

  function choose(index: number) {
    if (locked) return;
    const correct = index === noteIndex;
    onAttempt(correct);
    if (correct) {
      setFeedback(`¡Correcto! Es ${note.name}. Escucha y busca la siguiente.`);
      setLocked(true);
      if (soundEnabled) void playGuitarTone(frequencyForMidi(note.midi), 0.9);
      timeoutRef.current = window.setTimeout(() => {
        setNoteIndex((current) => (current + 3) % READING_NOTES.length);
        setLocked(false);
      }, 550);
    } else {
      setFeedback("Aún no. Cuenta líneas y espacios desde abajo y vuelve a intentar.");
    }
  }

  return (
    <article className="card note-game-card">
      <div className="note-game-heading"><div><span className="eyebrow">LECTURA INTERACTIVA</span><h2>¿Qué nota ves?</h2></div><strong aria-label={`${score} respuestas correctas de ${attempts} intentos`}>{score}/{attempts}</strong></div>
      <div className="staff-board" role="img" aria-label={`Pentagrama con una nota para reconocer. Resultado actual: ${score} correctas de ${attempts} intentos.`}>
        {[0, 1, 2, 3, 4].map((line) => <i key={line} style={{ bottom: `${24 + line * 24}px` }} />)}
        <span className="staff-clef" aria-hidden="true">𝄞</span>
        <span className="staff-note" aria-hidden="true" style={{ bottom: `${note.position}px` }}><b /><em /></span>
      </div>
      <div className="note-options">{READING_NOTES.map((option, index) => <button key={option.where} disabled={locked} onClick={() => choose(index)}>{option.name}<small>{option.where}</small></button>)}</div>
      <p className="assistive-message" role="status">{feedback}</p>
    </article>
  );
}

function PracticeTimer({ soundEnabled, onSave }: { soundEnabled: boolean; onSave: (minutes: number, focus: string, note: string) => void }) {
  const [timer, setTimer] = useState<PracticeTimerState>(() => loadPracticeTimer());
  const [note, setNote] = useState("");
  const completionSoundRef = useRef(timer.finished);

  useEffect(() => savePracticeTimer(timer), [timer]);
  useEffect(() => {
    if (!timer.running || !timer.endAt) return;
    const update = () => setTimer((current) => {
      if (!current.running || !current.endAt) return current;
      const remaining = Math.max(0, Math.ceil((current.endAt - Date.now()) / 1000));
      if (remaining === current.secondsLeft) return current;
      return remaining === 0
        ? { ...current, secondsLeft: 0, running: false, finished: true, endAt: undefined }
        : { ...current, secondsLeft: remaining };
    });
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [timer.running, timer.endAt]);

  useEffect(() => {
    if (timer.finished && !completionSoundRef.current && soundEnabled) void playClick(true);
    completionSoundRef.current = timer.finished;
  }, [timer.finished, soundEnabled]);

  const baseTitleRef = useRef(document.title);
  useEffect(() => {
    if (timer.running) {
      const minutes = Math.floor(timer.secondsLeft / 60).toString().padStart(2, "0");
      const seconds = (timer.secondsLeft % 60).toString().padStart(2, "0");
      document.title = `${minutes}:${seconds} · Práctica de guitarra`;
    } else {
      document.title = baseTitleRef.current;
    }
    return () => { document.title = baseTitleRef.current; };
  }, [timer.running, timer.secondsLeft]);

  function selectDuration(minutes: number) {
    setTimer({ version: 1, selectedMinutes: minutes, secondsLeft: minutes * 60, running: false, finished: false, focus: timer.focus });
    setNote("");
  }

  function toggleTimer() {
    setTimer((current) => {
      if (current.running) {
        const secondsLeft = current.endAt ? Math.max(0, Math.ceil((current.endAt - Date.now()) / 1000)) : current.secondsLeft;
        return { ...current, running: false, secondsLeft, endAt: undefined };
      }
      if (current.secondsLeft <= 0) return current;
      return { ...current, running: true, finished: false, endAt: Date.now() + current.secondsLeft * 1000 };
    });
  }

  function resetTimer() {
    clearPracticeTimer();
    setTimer({ version: 1, selectedMinutes: timer.selectedMinutes, secondsLeft: timer.selectedMinutes * 60, running: false, finished: false, focus: timer.focus });
    setNote("");
  }

  const elapsed = timer.selectedMinutes * 60 - timer.secondsLeft;
  const displayMinutes = Math.floor(timer.secondsLeft / 60).toString().padStart(2, "0");
  const displaySeconds = (timer.secondsLeft % 60).toString().padStart(2, "0");

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">HÁBITO SALUDABLE</span><h1>Sesión de práctica</h1><p>El temporizador continúa correctamente si la pantalla se bloquea o cambias de sección.</p></div></div>
      <article className="card practice-card">
        <div className="duration-buttons">{[5, 10, 15, 20].map((minutes) => <button key={minutes} className={timer.selectedMinutes === minutes ? "selected" : ""} disabled={timer.running} onClick={() => selectDuration(minutes)}>{minutes} min</button>)}</div>
        <label className="focus-select"><span>Objetivo de hoy</span><select disabled={timer.running} value={timer.focus} onChange={(event: { target: HTMLSelectElement }) => setTimer((current) => ({ ...current, focus: event.target.value }))}><option>Postura y relajación</option><option>Sonido y pulsación</option><option>Notas y digitación</option><option>Ritmo</option><option>Canción</option><option>Práctica general</option></select></label>
        <div className="timer-display" role="timer" aria-label={`${displayMinutes} minutos y ${displaySeconds} segundos restantes`}>{displayMinutes}:{displaySeconds}</div>
        <div className="practice-plan"><span>10% preparar</span><span>30% sonido</span><span>50% objetivo</span><span>10% celebrar</span></div>
        <div className="timer-actions">
          <button className={timer.running ? "secondary-button" : "primary-button"} disabled={timer.finished} onClick={toggleTimer}>{timer.running ? "Pausar" : elapsed > 0 ? "Continuar" : "Comenzar práctica"}</button>
          {elapsed > 0 && !timer.finished && <button className="secondary-button" onClick={resetTimer}>Reiniciar</button>}
        </div>
        {timer.finished && <div className="finish-panel"><h2>¡Sesión completada! 🎉</h2><label>¿Qué salió mejor hoy?<textarea value={note} onChange={(event: { target: HTMLTextAreaElement }) => setNote(event.target.value)} maxLength={240} placeholder="Ejemplo: las notas sonaron más limpias…" /></label><div className="timer-actions"><button className="primary-button" onClick={() => { onSave(timer.selectedMinutes, timer.focus, note.trim()); resetTimer(); }}>Guardar en mi progreso</button><button className="secondary-button" onClick={resetTimer}>Descartar</button></div></div>}
      </article>
    </section>
  );
}

function Songs({ soundEnabled, microphoneAllowed, calibration, songsCompleted, onSongComplete }: {
  soundEnabled: boolean; microphoneAllowed: boolean; calibration: number; songsCompleted: number; onSongComplete: () => void;
}) {
  const [song, setSong] = useState<Song>(songs[0]);
  const [mode, setMode] = useState<"idle" | "listening" | "playalong">("idle");
  const [index, setIndex] = useState(-1);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("Escucha la canción con guitarra real y luego tócala tú.");
  const abortRef = useRef(false);
  const calibrationRef = useRef(calibration);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => { calibrationRef.current = calibration; }, [calibration]);

  function stopEverything() {
    abortRef.current = true;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
  }

  useEffect(() => () => stopEverything(), []);
  useEffect(() => { stopEverything(); setMode("idle"); setIndex(-1); setDone(false); }, [song.id]);

  const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  async function listen() {
    stopEverything(); abortRef.current = false; setDone(false); setMode("listening");
    setMessage("Escucha y sigue las notas iluminadas…");
    const beat = 60_000 / song.tempo;
    for (let i = 0; i < song.notes.length; i += 1) {
      if (abortRef.current) { setMode("idle"); setIndex(-1); return; }
      setIndex(i);
      const note = song.notes[i];
      const duration = note.beats * beat;
      if (soundEnabled) void playGuitarTone(frequencyForMidi(note.midi, calibrationRef.current), Math.min(1.8, (duration / 1000) * 0.95));
      await sleep(duration);
    }
    if (!abortRef.current) { setIndex(-1); setMode("idle"); setMessage("¡Bien escuchado! Ahora intenta tocarla tú. 🎸"); }
  }

  async function playAlong() {
    stopEverything(); abortRef.current = false; setDone(false);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-mic");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const context = new AudioContext();
      if (context.state === "suspended") await context.resume();
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096; analyser.smoothingTimeConstant = 0.1;
      context.createMediaStreamSource(stream).connect(analyser);
      streamRef.current = stream; audioCtxRef.current = context;
      setMode("playalong"); setIndex(0);
      setMessage(`Toca ${NOTE_LABEL[song.notes[0].midi]} (${POSITION_LABEL[song.notes[0].midi]}) para empezar.`);
      const buffer = new Float32Array(analyser.fftSize);
      let current = 0; let stable = 0;
      let lastAnalysis = Number.NEGATIVE_INFINITY;
      const detect = (timestamp: number) => {
        if (abortRef.current) return;
        frameRef.current = requestAnimationFrame(detect);
        if (timestamp - lastAnalysis < PITCH_ANALYSIS_INTERVAL_MS) return;
        lastAnalysis = timestamp;
        analyser.getFloatTimeDomainData(buffer);
        const frequency = autoCorrelate(buffer, context.sampleRate);
        if (frequency) {
          const result = nearestChromaticNote(frequency, calibrationRef.current);
          if (result.midi === song.notes[current].midi && Math.abs(result.cents) <= 38) {
            stable += 1;
            // Tres análisis seguidos ≈ 135 ms de nota sostenida, el equivalente
            // a los seis frames que se exigían antes de limitar la tasa.
            if (stable >= 3) {
              current += 1; stable = 0;
              if (current >= song.notes.length) {
                setIndex(-1); setDone(true); setMode("idle");
                setMessage("¡Tocaste la canción completa! 🌟");
                if (soundEnabled) void playClick(true);
                onSongComplete();
                stopEverything();
                return;
              }
              setIndex(current);
              setMessage(`¡Muy bien! Ahora toca ${NOTE_LABEL[song.notes[current].midi]} (${POSITION_LABEL[song.notes[current].midi]}).`);
            }
          } else {
            stable = Math.max(0, stable - 1);
          }
        }
      };
      frameRef.current = requestAnimationFrame(detect);
    } catch {
      setMode("idle");
      setMessage("No se pudo abrir el micrófono. Revisa el permiso de la aplicación o del navegador.");
    }
  }

  function stop() { stopEverything(); setMode("idle"); setIndex(-1); }

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">TOCAR DE VERDAD</span><h1>Canciones</h1><p>Escucha una canción tocada con guitarra real y luego tócala tú. Todas usan cuerdas al aire y primera posición en Sol mayor.</p></div></div>
      <div className="song-picker">
        {songs.map((item) => (
          <button key={item.id} className={item.id === song.id ? "selected" : ""} aria-pressed={item.id === song.id} onClick={() => setSong(item)}>
            <span className="song-emoji">{item.emoji}</span><strong>{item.title}</strong><small>{item.subtitle}</small>
          </button>
        ))}
      </div>
      <article className="card song-card">
        <div className="song-notes" role="list" aria-label={`Notas de ${song.title}`}>
          {song.notes.map((note, position) => (
            <span key={position} role="listitem" className={`song-note ${position === index ? "active" : ""}`}>
              <b>{NOTE_LABEL[note.midi]}</b>{note.lyric && <em>{note.lyric}</em>}
            </span>
          ))}
        </div>
        <p className="assistive-message" role="status">{done ? "¡Canción completada! 🌟" : message}</p>
        <div className="song-actions">
          {mode === "idle" ? (
            <>
              <button className="primary-button" disabled={!soundEnabled} onClick={() => void listen()}>▶ Escuchar</button>
              <button className="secondary-button" disabled={!microphoneAllowed} onClick={() => void playAlong()}>🎸 Tocar conmigo</button>
            </>
          ) : (
            <button className="secondary-button danger" onClick={stop}>⏹ Detener</button>
          )}
        </div>
        {!microphoneAllowed && <p className="capability-hint">🎤 «Tocar conmigo» necesita el micrófono. Actívalo en el panel Familia → Requisitos y permisos.</p>}
        {mode === "playalong" && <p className="song-hint">🎤 Toca la nota iluminada. El micrófono se usa en tiempo real y nunca se graba.</p>}
      </article>
      <p className="assistive-message song-count">🎵 {songsCompleted} {songsCompleted === 1 ? "canción completada" : "canciones completadas"}</p>
    </section>
  );
}

function WeeklyChart({ sessions, goal }: { sessions: ProgressState["practiceSessions"]; goal: number }) {
  const data = useMemo(() => weeklyHistory(sessions, 8), [sessions]);
  const maxValue = Math.max(goal, 10, ...data.map((week) => week.minutes));
  const width = 300;
  const height = 130;
  const pad = 20;
  const slot = (width - pad * 2) / data.length;
  const barWidth = slot * 0.58;
  const goalY = height - pad - (goal / maxValue) * (height - pad * 2);
  const total = data.reduce((sum, week) => sum + week.minutes, 0);
  return (
    <div className="weekly-chart">
      {total === 0 ? (
        <p className="chart-empty">El gráfico se llenará a medida que guardes prácticas. 🎸</p>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Minutos practicados por semana en las últimas ${data.length} semanas, con una meta de ${goal} minutos.`}>
          <line x1={pad} x2={width - pad} y1={goalY} y2={goalY} className="chart-goal-line" strokeDasharray="4 5" />
          {data.map((week, index) => {
            const barHeight = Math.max(0, (week.minutes / maxValue) * (height - pad * 2));
            const x = pad + index * slot + (slot - barWidth) / 2;
            return <rect key={week.start} x={x} y={height - pad - barHeight} width={barWidth} height={barHeight} rx={4} className={week.minutes >= goal ? "chart-bar reached" : "chart-bar"} />;
          })}
        </svg>
      )}
      <div className="chart-caption"><span>Últimas 8 semanas</span><span>Meta: {goal} min</span></div>
    </div>
  );
}

function FamilyScreen({ progress, achievements, setProgress, capabilities }: {
  progress: ProgressState;
  achievements: Achievement[];
  setProgress: Dispatch<SetStateAction<ProgressState>>;
  capabilities: ReturnType<typeof useCapabilities>;
}) {
  const [importMessage, setImportMessage] = useState("");
  const [unlocked, setUnlocked] = useState(() => !progress.familyPin);
  const [unlockPin, setUnlockPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [checkingPin, setCheckingPin] = useState(false);
  const recentSessions = useMemo(() => [...progress.practiceSessions].reverse().slice(0, 8), [progress.practiceSessions]);
  const totalMinutes = progress.practiceSessions.reduce((sum, item) => sum + item.minutes, 0);
  const thisWeekMinutes = weeklyMinutes(progress.practiceSessions);
  const validLessons = progress.completedLessonIds.filter((id) => lessons.some((lesson) => lesson.id === id)).length;
  const readingAccuracy = progress.readingAttempts === 0 ? 0 : Math.round((progress.readingCorrect / progress.readingAttempts) * 100);

  async function unlockFamilyPanel() {
    if (!progress.familyPin) { setUnlocked(true); return; }
    setCheckingPin(true);
    try {
      const valid = await verifyFamilyPin(unlockPin, progress.familyPin);
      if (valid) {
        setUnlocked(true);
        setUnlockPin("");
        setPinMessage("");
      } else {
        setPinMessage("PIN incorrecto. Intenta nuevamente.");
      }
    } catch {
      setPinMessage("No fue posible comprobar el PIN en este dispositivo.");
    } finally {
      setCheckingPin(false);
    }
  }

  async function setFamilyPin() {
    if (!isValidFamilyPin(newPin)) { setPinMessage("El PIN debe tener exactamente cuatro números."); return; }
    if (newPin !== confirmPin) { setPinMessage("Los dos PIN no coinciden."); return; }
    setCheckingPin(true);
    try {
      const credential = await createFamilyPin(newPin);
      setProgress((current) => ({ ...current, familyPin: credential }));
      setNewPin("");
      setConfirmPin("");
      setPinMessage("PIN familiar activado. Protege contra cambios accidentales, no sustituye la seguridad del dispositivo.");
    } catch (error) {
      setPinMessage(error instanceof Error ? error.message : "No fue posible crear el PIN.");
    } finally {
      setCheckingPin(false);
    }
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) { setImportMessage("El archivo es demasiado grande."); return; }
    try {
      const imported = parseProgressImport(await file.text());
      setProgress(imported);
      setUnlocked(!imported.familyPin);
      setImportMessage(`Progreso importado: ${imported.completedLessonIds.length} lecciones y ${imported.practiceSessions.length} prácticas.`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "No se pudo importar el archivo.");
    }
  }

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">ACOMPAÑAMIENTO</span><h1>Panel familiar</h1><p>Acompañar significa observar bienestar, celebrar constancia y pedir ayuda docente cuando sea necesario.</p></div></div>

      {progress.familyPin && !unlocked ? (
        <article className="card family-lock-card">
          <span className="lock-icon" aria-hidden="true">🔐</span>
          <h2>Configuración protegida</h2>
          <p>Ingresa el PIN de cuatro números para modificar metas, respaldos y ajustes.</p>
          <form onSubmit={(event: { preventDefault(): void }) => { event.preventDefault(); void unlockFamilyPanel(); }}>
            <label>PIN familiar<input autoFocus type="password" inputMode="numeric" autoComplete="off" pattern="[0-9]{4}" maxLength={4} value={unlockPin} onChange={(event: { target: HTMLInputElement }) => setUnlockPin(event.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
            <button className="primary-button" type="submit" disabled={checkingPin || unlockPin.length !== 4}>{checkingPin ? "Comprobando…" : "Desbloquear"}</button>
          </form>
          {pinMessage && <p className="assistive-message" role="status">{pinMessage}</p>}
        </article>
      ) : (
        <div className="family-grid">
          <CapabilityPanel
            states={capabilities.states}
            microphoneEnabled={progress.microphoneEnabled}
            onToggleMicrophone={(value) => setProgress((current) => ({ ...current, microphoneEnabled: value }))}
            onRequest={capabilities.request}
            onRefresh={capabilities.refresh}
          />
          <article className="card settings-card">
            <div className="settings-heading"><h2>Perfil local</h2>{progress.familyPin && <button className="text-button" onClick={() => setUnlocked(false)}>🔒 Bloquear ahora</button>}</div>
            <label>Nombre o apodo<input type="text" value={progress.childName} maxLength={24} onChange={(event: { target: HTMLInputElement }) => setProgress((current) => ({ ...current, childName: event.target.value || "Guitarrista" }))} /></label>
            <label>Meta semanal de minutos<input type="number" min="10" max="420" step="5" value={progress.weeklyGoalMinutes} onChange={(event: { target: HTMLInputElement }) => setProgress((current) => ({ ...current, weeklyGoalMinutes: Math.min(420, Math.max(10, Number(event.target.value) || 10)) }))} /></label>
            <label className="toggle-row"><span><strong>Texto más grande</strong><small>Mejora la lectura en pantallas pequeñas</small></span><input type="checkbox" checked={progress.largeText} onChange={(event: { target: HTMLInputElement }) => setProgress((current) => ({ ...current, largeText: event.target.checked }))} /></label>
            <label><span>Apariencia</span><div className="theme-picker" role="group" aria-label="Tema de color">{([["system", "🖥️ Sistema"], ["light", "☀️ Claro"], ["dark", "🌙 Oscuro"]] as const).map(([value, label]) => <button key={value} type="button" className={progress.theme === value ? "selected" : ""} aria-pressed={progress.theme === value} onClick={() => setProgress((current) => ({ ...current, theme: value }))}>{label}</button>)}</div></label>
            <label className="toggle-row"><span><strong>Sonidos y lectura</strong><small>Notas, metrónomo y voz del dispositivo</small></span><input type="checkbox" checked={progress.soundEnabled} onChange={(event: { target: HTMLInputElement }) => setProgress((current) => ({ ...current, soundEnabled: event.target.checked }))} /></label>
            <div className="backup-actions"><button className="secondary-button" onClick={() => void exportProgress(progress)}>Exportar respaldo</button><label className="file-button">Importar respaldo<input className="visually-hidden" type="file" accept="application/json,.json" onChange={(event: { target: HTMLInputElement }) => void importFile(event.target.files?.[0])} /></label></div>
            {importMessage && <p className="assistive-message" role="status">{importMessage}</p>}

            <div className="pin-settings">
              <h3>{progress.familyPin ? "PIN familiar activo" : "Proteger cambios con PIN"}</h3>
              <p>El PIN evita cambios accidentales. No es un sistema de seguridad contra una persona con acceso completo al dispositivo.</p>
              {progress.familyPin ? (
                <button className="secondary-button danger" onClick={() => { setProgress((current) => ({ ...current, familyPin: undefined })); setPinMessage("PIN familiar eliminado."); }}>Eliminar PIN</button>
              ) : (
                <div className="pin-fields">
                  <label>Nuevo PIN<input type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{4}" maxLength={4} value={newPin} onChange={(event: { target: HTMLInputElement }) => setNewPin(event.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
                  <label>Repetir PIN<input type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{4}" maxLength={4} value={confirmPin} onChange={(event: { target: HTMLInputElement }) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))} /></label>
                  <button className="secondary-button" disabled={checkingPin} onClick={() => void setFamilyPin()}>{checkingPin ? "Protegiendo…" : "Activar PIN"}</button>
                </div>
              )}
              {pinMessage && <p className="assistive-message" role="status">{pinMessage}</p>}
            </div>
          </article>

          <article className="card summary-card">
            <h2>Resumen</h2><div className="summary-numbers"><div><strong>{validLessons}</strong><span>lecciones</span></div><div><strong>{totalMinutes}</strong><span>minutos</span></div><div><strong>{progress.streak}</strong><span>días de racha</span></div><div><strong>{thisWeekMinutes}</strong><span>esta semana</span></div><div><strong>{progress.pitchChallengesCompleted}</strong><span>notas logradas</span></div><div><strong>{readingAccuracy}%</strong><span>lectura musical</span></div></div>
            <h3>Minutos por semana</h3>
            <WeeklyChart sessions={progress.practiceSessions} goal={progress.weeklyGoalMinutes} />
            <h3>Últimas prácticas</h3>{recentSessions.length === 0 ? <p>Aún no hay sesiones guardadas.</p> : <div className="session-list">{recentSessions.map((session) => <div key={session.id}><span>{new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short" }).format(new Date(session.date))}</span><strong>{session.minutes} min</strong><em>{session.focus}</em><small>{session.note || "Práctica completada"}</small></div>)}</div>}
          </article>
        </div>
      )}

      <article className="card badges-card"><span className="eyebrow">PROGRESO POSITIVO</span><h2>Insignias de aprendizaje</h2><AchievementShelf achievements={achievements} /></article>
      <article className="card safety-family-card"><h2>Cuándo pedir ayuda profesional</h2><div><span>🧍‍♀️ Dolor, tensión o instrumento que se cae</span><span>🎸 Cuerda rota, clavija que se suelta o zumbido constante</span><span>👂 Dificultad persistente para encontrar las notas</span><span>📏 Dudas sobre el tamaño de la guitarra o la altura de las cuerdas</span></div></article>
      {unlocked && <article className="card privacy-card"><h2>Privacidad por diseño 🔒</h2><p>No hay publicidad, cuenta, analítica ni servidor. El nombre y el progreso permanecen en el dispositivo. El micrófono se utiliza en tiempo real y nunca se graba.</p><p className="audio-credit">🎸 Las notas de referencia usan grabaciones reales de guitarra del soundfont <strong>FluidR3_GM</strong> de Frank Wen (<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">CC BY 3.0</a>).</p><details><summary>Reiniciar todos los datos locales</summary><p>Primero exporta un respaldo. Esta acción elimina lecciones, prácticas y ajustes del dispositivo.</p><button className="secondary-button danger" onClick={() => { if (window.confirm("¿Eliminar todo el progreso local? Esta acción no se puede deshacer.")) { clearPracticeTimer(); setProgress({ ...defaultProgress }); } }}>Reiniciar progreso</button></details></article>}
    </section>
  );
}

export default App;
