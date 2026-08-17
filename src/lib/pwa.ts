export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let pendingRegistration: ServiceWorkerRegistration | null = null;

function notifyUpdate(registration: ServiceWorkerRegistration): void {
  pendingRegistration = registration;
  window.dispatchEvent(new CustomEvent("guitarra:pwa-update"));
}

export function requestPwaUpdate(): void {
  pendingRegistration?.waiting?.postMessage({ type: "SKIP_WAITING" });
}

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator) || !import.meta.env.PROD || "__TAURI_INTERNALS__" in window) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      if (registration.waiting) notifyUpdate(registration);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) notifyUpdate(registration);
        });
      });
    }).catch(() => undefined);
  });
}
