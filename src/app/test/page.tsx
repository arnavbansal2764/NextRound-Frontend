'use client';
import React, { useState } from 'react';
import { InterviewSocketClient } from '../../lib/interviewsocket/interviewsocket';

const TestPage = () => {
  const [serverUrl, setServerUrl] = useState('');
  const [resumePdf, setResumePdf] = useState('');
  const [numberOfQues, setNumberOfQues] = useState(0);
  const [difficulty, setDifficulty] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [client, setClient] = useState<InterviewSocketClient | null>(null);

  const handleConnect = async () => {
    const newClient = new InterviewSocketClient(serverUrl);
    setClient(newClient);
    await newClient.connect(resumePdf, numberOfQues, difficulty);
  };

  const handleGetQuestion = async () => {
    if (client) {
      const { question } = await client.getQuestion();
      setQuestion(question);
    }
  };

  const handleAddQuestionAnswer = async () => {
    if (client) {
      await client.addQuestionAnswer(question, answer);
      setQuestion('');
      setAnswer('');
    }
  };

  const handleAnalyze = async () => {
    if (client) {
      const analysisResult = await client.analyze();
      setAnalysis(analysisResult);
    }
  };

  const handleStopInterview = async () => {
    if (client) {
      await client.stopInterview();
      client.close();
      setClient(null);
    }
  };

  return (
    <div className='container my-32 mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Interview WebSocket Client</h1>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>Server URL:</label>
        <input className='mt-1 p-2 border border-gray-300 rounded-md w-full' type="text" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>Resume PDF URL:</label>
        <input className='mt-1 p-2 border border-gray-300 rounded-md w-full' type="text" value={resumePdf} onChange={(e) => setResumePdf(e.target.value)} />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>Number of Questions:</label>
        <input className='mt-1 p-2 border border-gray-300 rounded-md w-full' type="number" value={numberOfQues} onChange={(e) => setNumberOfQues(Number(e.target.value))} />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>Difficulty:</label>
        <input className='mt-1 p-2 border border-gray-300 rounded-md w-full' type="text" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
      </div>
      <div className='flex space-x-2 mb-4'>
        <button className='bg-blue-500 text-white px-4 py-2 rounded-md' onClick={handleConnect}>Connect</button>
        <button className='bg-green-500 text-white px-4 py-2 rounded-md' onClick={handleGetQuestion}>Get Question</button>
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>Question:</label>
        <input className='mt-1 p-2 border border-gray-300 rounded-md w-full' type="text" value={question} readOnly />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700'>Answer:</label>
        <input className='mt-1 p-2 border border-gray-300 rounded-md w-full' type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </div>
      <div className='flex space-x-2 mb-4'>
        <button className='bg-yellow-500 text-white px-4 py-2 rounded-md' onClick={handleAddQuestionAnswer}>Add Question Answer</button>
        <button className='bg-purple-500 text-white px-4 py-2 rounded-md' onClick={handleAnalyze}>Analyze</button>
        <button className='bg-red-500 text-white px-4 py-2 rounded-md' onClick={handleStopInterview}>Stop Interview</button>
      </div>
      {analysis && (
        <div className='mt-4 p-4 border border-gray-300 rounded-md'>
          <h2 className='text-xl font-bold mb-2'>Analysis Result</h2>
          <pre className='bg-gray-100 p-2 rounded-md'>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestPage;
