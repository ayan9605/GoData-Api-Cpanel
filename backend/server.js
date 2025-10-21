const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const proxyRoutes = require('./routes/proxy');
const adminRoutes = require('./routes/admin');
const { PORT, MONGO_URI } = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend dashboard at root "/"
app.use('/', express.static(path.join(__dirname, '../frontend')));

// Connect MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes
app.use('/proxy', proxyRoutes);
app.use('/admin', adminRoutes);

// For any unknown frontend route, serve index.html (optional SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));