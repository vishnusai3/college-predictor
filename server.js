const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const healthRoutes = require('./routes/healthRoutes');
const predictRoutes = require('./routes/predictRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('TS EAMCET College Predictor API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
