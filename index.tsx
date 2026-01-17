
/**
 * Cisco IOS Insight: Config Analyzer
 * 
 * @author Canti Firestarter <canti@firestartforge.dev>
 * @copyright 2026 Firestarter Forge
 * @license MIT
 * @link https://firestarterforge.dev
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
