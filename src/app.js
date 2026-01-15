require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

// health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'client-management-api'
  });
});

const clientsRoutes = require('./routes/clients.routes');

app.use('/clients', clientsRoutes);

const errorHandler = require('./middlewares/errorHandler')
app.use(errorHandler)

module.exports = app
