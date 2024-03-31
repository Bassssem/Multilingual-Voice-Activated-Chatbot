import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from "sonner";
import { franc } from 'franc';


function Chatbot() {
  const [conversation, setConversation] = useState([]);
  const [input, setInput] = useState('');
  const [content, setContent] = useState("");
  const [synthesizing, setSynthesizing] = useState(false);

  const SpeechRecognitionAPI = useMemo(() => window.SpeechRecognition || window.webkitSpeechRecognition, []);
  const speechRecognition = useMemo(() => new SpeechRecognitionAPI(), [SpeechRecognitionAPI]);

  useEffect(() => {
    speechRecognition.lang = "en-US";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      setContent(transcription);
      setInput(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error(event);
    };

    return () => {
      speechRecognition.stop();
    };
  }, [speechRecognition]);

  const handleMessageSubmit = async () => {
    const userMessage = { text: input, fromUser: true };
    let response = await axios.get('http://localhost:3001/api/v1/model/' + input);
    const botResponse = { text: response.data.data, fromUser: false };

    setConversation(prevConversation => [...prevConversation, userMessage, botResponse]);
    setInput('');
    toast.success("Note created successfully!");

    speakText(botResponse.text);
  };

 



  const speakText = (text) => {
      if ('speechSynthesis' in window && !synthesizing) {
          setSynthesizing(true);
  
          
          const detectedLanguage = franc(text);
  
          
          const utterance = new SpeechSynthesisUtterance(text);
          switch (detectedLanguage) {
              case 'fra':
                  utterance.lang = 'fr-FR';
                  break;
              case 'ara':
                  utterance.lang = 'ar-EG';
                  break;
              default:
                  utterance.lang = 'en-US';
          }
  
          utterance.onend = () => setSynthesizing(false);
          speechSynthesis.speak(utterance);
      }
  };
  
  

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleStartRecording = () => {
    const isSpeechRecognitionAPIAvailable = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Unfortunately your browser does not support the recording API!");
      return;
    }

    speechRecognition.start();
  };

  const handleStopRecording = () => {
    if (speechRecognition !== null) {
      speechRecognition.stop();
      setInput(content); 
    }
  };

  return (
    <div className='container'>
      <div style={{ height: '600px', overflowY: 'scroll' }}>
        <div className='conversation-container'>
          {conversation.map((message, index) => (
            <div key={index} style={{ padding: '5px', border: `1px solid ${message.fromUser ? 'blue' : 'white'}`, borderRadius: '5px', marginBottom: '5px' }}>
              {message.fromUser ? (
                <div style={{ textAlign: 'right', color: 'white' }}>{message.text}</div>
              ) : (
                <div style={{ textAlign: 'left', color: 'white' }}>{message.text}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className='fixed-bottom'>
        <div className='container'>
          <div className='row'>
            <div className='col'>
              <div className='input-group mb-3'>
                <input
                  type="text"
                  value={input}
                  onChange={handleChange}
                  placeholder="Type your question..."
                  className='form-control'
                />
                <button type="button" className='btn btn-primary' onClick={handleStartRecording}>Record</button>
                <button type="button" className='btn btn-primary' onClick={handleStopRecording}>Stop</button>
                <button type="button" className='btn btn-primary' onClick={handleMessageSubmit}>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
