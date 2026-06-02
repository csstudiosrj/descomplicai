// Provider global e importação de estilos
// Dependências diretas: React, next/app, MemorialProvider, globals.css

import '../styles/globals.css';
import { MemorialProvider } from '../context/MemorialContext';

export default function App({ Component, pageProps }) {
  return (
    <MemorialProvider>
      <Component {...pageProps} />
    </MemorialProvider>
  );
}