import { useParams } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import React from 'react';
import CodeEditor from '../components/CodeEditor'; 

function Home() {
  const { roomId } = useParams();  
  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      <CodeEditor roomId={roomId} /> 
    </Box>
  );
}

export default Home;
