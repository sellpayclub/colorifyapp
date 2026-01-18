import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

type Theme = "light" | "dark";

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
};

const savedTheme = localStorage.getItem("theme") as Theme | null;
const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
const initialTheme: Theme = savedTheme ?? (prefersDark ? "dark" : "light");

applyTheme(initialTheme);

if (!savedTheme) {
  localStorage.setItem("theme", initialTheme);
}

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  registerSW({
    immediate: true,
    onRegistered(registration) {
      console.info("PWA service worker registrado");
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    },
    onRegisterError(error) {
      console.error("Falha ao registrar o service worker", error);
    },
  });
}