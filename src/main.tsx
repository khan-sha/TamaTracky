import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

/**
 * Main entry point for the Tama Tracky application.
 * 
 * This file initializes the React application by:
 * 1. Finding the root DOM element (typically a div with id="root")
 * 2. Creating a React root using React 18's createRoot API
 * 3. Rendering the App component into the root element
 * 
 * The index.css file is imported here to ensure global styles
 * (including Tailwind CSS) are loaded before the app renders.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

