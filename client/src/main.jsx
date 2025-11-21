import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './tailwind.css';
import App from './App.jsx';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './components/Contexts/AuthContext.jsx'; // ✅ IMPORT HERE

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: () => ({
      body: {
        bg: 'transparent',
      },
    }),
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme} resetCSS={false}>
      <AuthProvider> {/* ✅ WRAP THE ENTIRE APP */}
        <App />
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>
);
