import { useCallback, useEffect, useRef, useState } from "react";
import { peekAudioState } from "../lib/audio";
import {
  detectSound,
  detectStorage,
  detectVoice,
  INITIAL_STATES,
  readMicrophoneState,
  requestMicrophone,
  type CapabilityStates
} from "../lib/capabilities";

/**
 * Estado en vivo de lo que la aplicación necesita del dispositivo.
 *
 * Se refresca solo ante los avisos del propio sistema (permiso del micrófono,
 * carga de voces) y tras cualquier gesto, que es cuando el audio puede pasar a
 * `running`. No hace sondeo periódico: gastaría batería para nada.
 */
export function useCapabilities() {
  const [states, setStates] = useState<CapabilityStates>(INITIAL_STATES);
  const mountedRef = useRef(true);

  const apply = useCallback((partial: Partial<CapabilityStates>) => {
    if (mountedRef.current) setStates((current) => ({ ...current, ...partial }));
  }, []);

  const refresh = useCallback(async () => {
    apply({ storage: detectStorage(), voice: detectVoice(), sound: detectSound(peekAudioState()) });
    apply({ microphone: await readMicrophoneState() });
  }, [apply]);

  const request = useCallback(async () => {
    const state = await requestMicrophone();
    apply({ microphone: state });
    return state;
  }, [apply]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();

    // Las voces del sistema se cargan de forma diferida.
    const onVoices = () => apply({ voice: detectVoice() });
    window.speechSynthesis?.addEventListener?.("voiceschanged", onVoices);

    // El audio solo arranca tras un gesto; el micrófono puede cambiar desde los
    // ajustes del sistema sin que la aplicación se entere de otro modo.
    const onGesture = () => apply({ sound: detectSound(peekAudioState()) });
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);

    let permissionStatus: PermissionStatus | null = null;
    navigator.permissions?.query({ name: "microphone" as PermissionName })
      .then((status) => {
        permissionStatus = status;
        status.onchange = () => void readMicrophoneState().then((value) => apply({ microphone: value }));
      })
      .catch(() => undefined);

    return () => {
      mountedRef.current = false;
      window.speechSynthesis?.removeEventListener?.("voiceschanged", onVoices);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, [apply, refresh]);

  return { states, refresh, request };
}
