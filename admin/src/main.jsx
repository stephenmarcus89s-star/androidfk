import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a24',
            border: '1px solid #2a2a38',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
