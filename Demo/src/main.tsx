import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/archivo";

import "@tokens/tokens.css";
import "@tokens/subthemes.css";
import "@identity/identity.css";
import "@identity/layout.css";
import "@foundation/base.css";
import "@foundation/metamorphic.css";
import "@families/atlas-tokens.css";
import "@families/atelier-tokens.css";
import "@families/aliases.css";
import "@families/skins.css";
import "@families/accent-tints.css";
import "@families/identity-chrome.css";
import "@families/typefaces.css";
import "@components/card.css";
import "@components/charge.css";
import "@components/appearance-switcher.css";
import "./app.css";
import "./pages/courses.css";
import "./pages/surfaces.css";
import "./pages/lab.css";

import { App } from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("#root missing");

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>
);
