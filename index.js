const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST endpoint to handle image conversion
app.post('/convert', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputFilePath = path.join(__dirname, req.file.path);
  const outputFileName = path.basename(req.file.filename, path.extname(req.file.filename)) + '.svg';
  const outputFilePath = path.join(__dirname, 'output', outputFileName);

  // Executing VTracer
  const vtracerPath = 'vtracer';
  const args = [
    '-i', inputFilePath,
    '-o', outputFilePath
  ];

  execFile(vtracerPath, args, (error, stdout, stderr) => {
    // Delete the input file after processing
    fs.unlink(inputFilePath, (err) => {
      if (err) console.error('Error deleting input file:', err);
    });

    if (error) {
      console.error('VTracer error:', stderr);
      return res.status(500).json({ error: 'Conversion failed', details: stderr });
    }

    // Read the output SVG file
    fs.readFile(outputFilePath, 'utf8', (err, data) => {
      // Delete the output file after reading
      fs.unlink(outputFilePath, (err) => {
        if (err) console.error('Error deleting output file:', err);
      });

      if (err) {
        console.error('Error reading output file:', err);
        return res.status(500).json({ error: 'Failed to read output file' });
      }

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(data);
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});