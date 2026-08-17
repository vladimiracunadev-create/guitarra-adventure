import type { BeforeInstallPromptEvent } from "../lib/pwa";
import { requestPwaUpdate } from "../lib/pwa";

export function PwaNotices({ online, updateAvailable, installPrompt, onInstallFinished }: {
  online: boolean;
  updateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstallFinished: () => void;
}) {
  return (
    <div className="app-notices" aria-live="polite">
      {!online && <div className="notice offline-notice"><span>📴 Estás sin conexión. Las lecciones y herramientas guardadas siguen disponibles.</span></div>}
      {updateAvailable && <div className="notice update-notice"><span>✨ Hay una versión nueva lista.</span><button onClick={requestPwaUpdate}>Actualizar ahora</button></div>}
      {installPrompt && <div className="notice install-notice"><span>📲 Puedes instalar esta aplicación en el dispositivo.</span><button onClick={async () => {
        await installPrompt.prompt();
        await installPrompt.userChoice;
        onInstallFinished();
      }}>Instalar</button></div>}
    </div>
  );
}
