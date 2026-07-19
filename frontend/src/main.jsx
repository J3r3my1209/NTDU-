import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App.jsx';
import './Index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            {/* reducedMotion="user" => Framer respeta prefers-reduced-motion del SO */}
            <MotionConfig reducedMotion="user">
                <App />
            </MotionConfig>
        </BrowserRouter>
    </React.StrictMode>
);
