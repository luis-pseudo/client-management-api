require('dotenv').config();

const express = require('express');
const server = express();

server.use(express.json());
const clientsRoutes = require('./routes/clients.routes');

server.use('/clients', clientsRoutes);

const errorHandler = require('./middlewares/errorHandler')
server.use(errorHandler)


// health check
server.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'client-management-api'
  });
});

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})