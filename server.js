const express = require('express');
const cors = require('cors');
const path = require('path');
const { processData } = require('./lib/processData');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// User credentials - update with your information
const USER_ID = 'Guru_Krishnaa_K';
const EMAIL_ID = 'gk2666@srmist.edu.in';
const ROLL_NUMBER = 'RA2311050010014';

app.post('/bfhl', (req, res) => {
  const { data } = req.body;

  // Validate that data is provided as an array
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: '"data" must be an array of strings.' });
  }

  // Process the incoming data
  const { hierarchies, invalidEntries, duplicateEdges, summary } = processData(data);

  // Return the results with user information
  return res.status(200).json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: ROLL_NUMBER,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});