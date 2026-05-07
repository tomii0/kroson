/*
  KRONOS AI - MINIMAL BACKEND
  All course-related logic, Razorpay integration, and purchase databases have been DELETED.
  The system now operates on a user-only registry.
*/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const USERS_DB_PATH = path.join(__dirname, 'db.json');

app.get('/api/health', (req, res) => {
    res.json({ status: 'active', system: 'KRONOS_MAINFRAME_V2' });
});

app.listen(PORT, () => console.log(`KRONOS Minimal Server running on port ${PORT}`));
