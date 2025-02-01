import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import Loading from './components/Loading';

const App = () => {
  const [videofile, setVideoFile] = useState(null);
  const [progress, setProgress] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioFile,setAudioFile]=useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      setProgress(event.data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close(); 
    };
  }, []);


  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading component
    const formData = new FormData();
    formData.append('video', videofile);
    if(audioFile!=null){
      if(audioFile.type!='audio/mp3' && audioFile.type!='audio/mpeg'){
        alert("Please upload audio file in mp3 format or mpeg format");
        setLoading(false);
        return;
      }else{
        formData.append('audio',audioFile);
      }
    }
    try {
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob' // Important for handling binary data
      });

      // Create a URL for the file and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output.mp4'); // or any other extension
      document.body.appendChild(link);
      link.click();
      link.remove();

      setLoading(false); // Hide loading component
      setVideoFile(null);
      setAudioFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setLoading(false); // Hide loading component in case of error
    }
  }

  return (
    <div className="parent">
      {loading && <Loading />}
      <div className="container">
        <div className="intro">
          <h1>PLAY-PULSE</h1>
          <p>This is the website where you can upload your offline gameplay recording and we will provide you a video of highlight clips of your video.</p>
          <p>The video will automatically download in your localstorage.</p>
        </div>

        <div className="upload-container">
        <form onSubmit={submitHandler}>
          <h1>Upload Video</h1>

          <div className="file-group">
            <label>Video File:</label>
            <input type="file" onChange={(e) => setVideoFile(e.target.files[0])} required />
          </div>

          <div className="file-group">
            <label>Audio File:</label>
            <input type="file" onChange={(e) => setAudioFile(e.target.files[0])} />
          </div>

          <button>Upload</button>
        </form>

        </div>
      </div>
    </div>
  )
}

export default App;