const clientsRepository = require('../repositories/clients.repository');
const AppError = require('../errors/AppError')

async function getClientsWithPhones(req, res, next) {
  try {
    const rows = await clientsRepository.getClientsWithPhones();

    const clientsMap = {};

    for (const row of rows) {
      if (!clientsMap[row.id_client]) {
        clientsMap[row.id_client] = {
          id: row.id_client,
          name: row.c_name,
          email: row.email,
          phones: []
        };
      }

      if (row.phone_number) {
        clientsMap[row.id_client].phones.push(row.phone_number);
      }
    }

    const result = Object.values(clientsMap);

    res.json(result);
  } catch (error) {
    next(error)
  }
}

async function getClients(req, res, next) {
  try {
    const { state, id, before, after } = req.query;
    
    const filters = {
      state: state !== undefined ? state === 'true' : undefined,
      id: id ? Number(id) : undefined,
      before,
      after,
      pagination:req.pagination??undefined
    };

    const response = await clientsRepository.getClients(filters);
    console.log(response)
    const pages = Math.ceil(response.total / req.pagination.limit)

    res.json({
      data: response.rows,
      pagination: {
        page: req.pagination.page,
        limit: req.pagination.limit,
        total: response.total,
        pages: pages
      }
    });
  } catch (error) {
    next(error)
  }
}

async function createClient(req, res, next) {
  try {
    const result = await clientsRepository.createClient(req.body)

    return res.status(201).json({
      id: result.id,
      message: 'Client created successfully'
    })
  } catch (error) {
    next(error)
  }
}


async function updateClient(req, res, next) {
  try {
    const { id } = req.params
    const { name, email, state } = req.body

    const firstname = name?.split(' ')[0]
    const lastname = name?.split(' ')[1]

    const result = await clientsRepository.updateClient({
      id,
      firstname,
      lastname,
      email,
      state
    })

    return res.status(200).json({
      updated: result.updated,
      message: result.updated
        ? 'Client updated successfully'
        : 'No changes detected'
    })
  } catch (error) {
    next(error)
  }
}


async function addPhones(req, res, next) {
  try {
    const id = req.params.id
    const { phones } = req.body

    const result = await clientsRepository.addPhones({ id, phones })

    return res.status(201).json({
      added: result.added,
      message: 'Numbers added successfully'
    })
  } catch (error) {
    next(error)
  }
}


async function deletePhones(req, res, next) {
  try {
    const {id, number}=req.params

    if(!number || typeof number!=='string' || number.trim()==='') throw new AppError('Bad request', 400)

    const result= await clientsRepository.deletePhones({id, number})
    return res.status(200).json({
      deleted: result.deleted,
      number: result.number,
      message: "Number deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}

async function deleteAllPhones(req, res, next) {
  try {
    const clientId = req.params.id

    const result = await clientsRepository.deleteAllPhones(clientId)

    return res.status(200).json({
      deleted: result.deleted,
      numbers: result.numbers ?? [],
      message:
        result.deleted === 0
          ? 'Client has no phone numbers'
          : 'All phone numbers deleted successfully'
    })

  } catch (error) {
    next(error)
  }
}

async function deleteClient(req, res, next) {
  try {
    const id=req.params.id

    const result=await clientsRepository.deleteClient({id})

    return res.status(200).json({
      deleted: result.deleted,
      client: result.client,
      message: "Client and linked phone numbers deleted successfully"
    })
  } catch (error) {
    next(error)
  }
}


module.exports = {
  getClients,
  getClientsWithPhones,
  createClient,
  updateClient,
  addPhones,
  deletePhones,
  deleteAllPhones,
  deleteClient,
};
