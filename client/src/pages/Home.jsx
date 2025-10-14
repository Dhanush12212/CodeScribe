import { useParams } from 'react-router-dom';
import React from 'react';
import CodeEditor from '../components/CodeEditor';

function Home() {
  const { roomId } = useParams();

  return (
    <div className="h-screen bg-[#0f0a19] text-gray-500 px-3 py-2 overflow-hidden">
      <CodeEditor roomId={roomId} />
    </div>
  );
}

export default Home;
