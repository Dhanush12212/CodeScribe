import { Box, Stack } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import React, { useState, useRef, useEffect } from 'react';
import LanguageSelector from './LanguageSelector';
import { CODE_SNIPPETS } from '../constants';
import Output from './Output';
import { socket } from '../socket/socket';

function CodeEditor({ roomId }) {
  const [language, setLanguage] = useState('javascript');
  const [value, setValue] = useState(CODE_SNIPPETS['javascript']);
  const editorRef = useRef(null);

  useEffect(() => {
    socket.connect();
    socket.emit('joinRoom', roomId);

    socket.on('languageChange', ({ roomId: updatedRoomId, language }) => {
      if (updatedRoomId === roomId) {
        setLanguage(language);
        setValue(CODE_SNIPPETS[language]);
        console.log(`Language updated in room ${roomId}: ${language}`);
      }
    });

    socket.on('updatedCode', ({ roomId: updatedRoomId, code }) => {
      if (updatedRoomId === roomId && code !== value) {
        console.log(`Code updated in room ${roomId}: ${code.length} chars`);
        setValue(code);
      }
    });

    return () => {
      socket.off('languageChange');
      socket.off('updatedCode');
    };
  }, [roomId]);

  const onSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setValue(CODE_SNIPPETS[selectedLanguage]);
    socket.emit('languageChange', { roomId, selectedLanguage });
  };

  const handleOnChange = (newCode) => {
    setValue(newCode);
    socket.emit('updatedCode', { roomId, newCode });
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  }

  return (
    <Box width="100%">
      
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={4}
        align="stretch"
      >
        <Box 
          width={{base:"100%", md:"100%", lg:"50%"}} 
          mt={3}
          mb={20}
          height={{base:"60vh", md:"70vh", lg:"80vh"}} 
        >
          <LanguageSelector language={language} onSelect={onSelect}  />
          <Editor
            options={{ minimap: { enabled: false } }}
            height="100%" 
            theme="vs-dark"
            value={value}
            language={language}
            onMount={onMount}
            onChange={handleOnChange}
          />
        </Box>
        <Box 
          width={{base:"100%", md:"100%", lg:"50%"}} 
          height={{base:"90vh", md:"70vh", lg: "100vh"}} 
        >
          <Output editorRef={editorRef} language={language} />
        </Box>
      </Stack>
    </Box>
  );
}

export default CodeEditor;
