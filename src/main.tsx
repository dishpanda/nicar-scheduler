import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import WorkshopScheduler from "./components/WorkshopScheduler.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WorkshopScheduler />
  </StrictMode>,
);
