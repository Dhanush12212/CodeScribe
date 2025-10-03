import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './tailwind.css';
import App from './App.jsx';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialCol2orMode: 'dark',
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
      <App /> 
    </ChakraProvider>
  </StrictMode>
);
