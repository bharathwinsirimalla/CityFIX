import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import { store } from "./store";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { applyLeafletIconFix } from "./lib/leafletFix";
import { getMissingEnvVars } from "./lib/config";

const rootElement = document.getElementById("root");
const missingEnv = getMissingEnvVars();

if (missingEnv.length > 0) {
  rootElement.innerHTML = `
    <div style="font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1.5rem; color: #0f172a;">
      <h1 style="font-size: 1.5rem; margin-bottom: 0.75rem;">CityFix configuration required</h1>
      <p style="color: #475569; line-height: 1.6;">
        Missing environment variables: <strong>${missingEnv.join(", ")}</strong>
      </p>
      <p style="color: #475569; line-height: 1.6;">
        Set them in Render Static Site settings, then redeploy with a cleared build cache.
      </p>
    </div>
  `;
} else {
  applyLeafletIconFix();

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}
