const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const WebSocket = require("ws");
const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // Update to match your frontend's origin
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

let audioPresent=0;

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, "test.mp4"); // Keep the file name constant as test.mp4
      audioPresent=0;
    } else if (file.fieldname === 'audio') {
      cb(null, "audio.mp3"); // Save the audio file as audio.mp3
      audioPresent=1;
    }
  }
});


const upload = multer({ storage: storage });

app.get("/test", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

app.post("/upload", upload.fields([{ name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), (req, res) => {
  if (!req.files || !req.files.video) {
    return res.status(400).json({ message: "No video file found", success: false });
  }
  console.log("Video uploaded successfully");
  if (req.files.audio) {
    console.log("Audio uploaded successfully");
  }
  console.log("Now executing the python script");

  // Run the Python script and send progress updates
  const pythonProcess = exec(`python3 final.py ${audioPresent}`);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Script stdout: ${data}`);
    broadcastProgress(data);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Script stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python script finished with code ${code}`);

    // Path to the generated output file
    const outputFilePath = path.join(__dirname, "final", "output.mp4");

    // Check if the output file exists
    if (fs.existsSync(outputFilePath)) {
      // Return the file in the response
      res.sendFile(outputFilePath, (err) => {
        if (err) {
          console.error(`Error sending file: ${err.message}`);
          if (!res.headersSent) {
            res.status(500).json({ message: "Error sending file", error: err.message });
          }
        } else {
          console.log("File sent successfully.");
        }
      });
    } else {
      if (!res.headersSent) {
        res.status(500).json({ message: "Processed file not found", success: false });
      }
    }
  });
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

function broadcastProgress(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

app.listen(3000, () => {
  console.log("On port 3000");
});