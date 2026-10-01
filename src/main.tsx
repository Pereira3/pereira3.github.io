import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "@fontsource-variable/bricolage-grotesque";
import App from "src/App";

// HashRouter keeps URLs like /#/university, which GitHub Pages can serve
// without returning a 404 when someone refreshes or opens a shared link.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter useTransitions={false}>
      <App />
    </HashRouter>
  </StrictMode>,
);
