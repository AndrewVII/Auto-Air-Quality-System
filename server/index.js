require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

const express = require('express');
const cors = require('cors');
// get MongoDB driver connection
const mongoose = require('mongoose');
const connectDB = require('./db/conn');

const PORT = process.env.PORT || 8000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(require('./routes/record'));

// Global error handling
app.use((err, _req, res) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
