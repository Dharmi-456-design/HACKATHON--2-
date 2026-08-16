const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/issues', require('./routes/commentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api', require('./routes/natureRoutes'));

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

start();
