const express = require('express');
const router = express.Router();
const { validateIdParam, validatePhonesBody, validateCreateClient, validateUpdateClient, validatePhoneParam, validatePagination } = require('../middlewares/validators')

const clientsController = require('../controllers/clients.controller');

router.get('/', validatePagination, clientsController.getClients);
router.get('/phones', clientsController.getClientsWithPhones);
router.post('/', validateCreateClient, clientsController.createClient);
router.post('/:id/phones', validateIdParam, validatePhonesBody, clientsController.addPhones)
router.put('/:id', validateIdParam, validateUpdateClient, clientsController.updateClient);
router.delete('/:id/phones/:number', validateIdParam, validatePhoneParam, clientsController.deletePhones);
router.delete('/:id/phones', validateIdParam, clientsController.deleteAllPhones);
router.delete('/:id', validateIdParam, clientsController.deleteClient);

module.exports = router;
