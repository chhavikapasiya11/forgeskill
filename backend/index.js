require('dotenv').config();
const authRoutes = require('./src/api/routes/auth');
const suggestion= require('./src/api/routes/suggestion')
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
connectToMongo();
console.log("mongodb connected");
const port = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Routes
if (authRoutes && typeof authRoutes === 'function') {
    app.use('/api/auth', authRoutes);
} else {
  
    console.error("Error: authRoutes is not a valid middleware function.");
}
if(suggestion && typeof suggestion==='function'){
  app.use('/api/suggestion',suggestion);
}else{
  console.error("suggestion is not function")
}
// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} 🚀`);
});
