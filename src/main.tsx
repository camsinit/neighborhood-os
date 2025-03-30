
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Simply render the App component - all providers now live inside App.tsx
createRoot(document.getElementById("root")!).render(<App />);

