
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const carpoolRoutes = require('./routes/carpoolRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/carpools', carpoolRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Carpool API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
