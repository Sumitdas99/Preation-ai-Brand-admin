import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { USE_MSW } from "./lib/env";

async function enableMocking(): Promise<void> {
  if (!USE_MSW) return;
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
