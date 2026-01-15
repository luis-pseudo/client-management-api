const AppError = require('../errors/AppError')

function validateIdParam(req, res, next) {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id parameter', 400)
  }

  req.params.id = id
  next()
}

function validatePhonesBody(req, res, next) {
  const { phones } = req.body

  if (!Array.isArray(phones) || phones.length === 0) {
    throw new AppError('Invalid phones array', 400)
  }

  for (const phone of phones) {
    if (typeof phone !== 'string' || phone.trim() === '') {
      throw new AppError('Invalid phone value', 400)
    }
  }

  next()
}

function validateCreateClient(req, res, next) {
  const { name, email, phones, state } = req.body

  // name
  if (typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Invalid name', 400)
  }

  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) {
    throw new AppError('Name must include first and last name', 400)
  }

  // email
  if (typeof email !== 'string' || email.trim() === '') {
    throw new AppError('Invalid email', 400)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400)
  }

  // state (optional)
  if (state !== undefined && typeof state !== 'boolean') {
    throw new AppError('Invalid state value', 400)
  }

  // phones (optional)
  if (phones !== undefined) {
    if (!Array.isArray(phones) || phones.length === 0) {
      throw new AppError('Invalid phones array', 400)
    }

    for (const phone of phones) {
      if (typeof phone !== 'string' || phone.trim() === '') {
        throw new AppError('Invalid phone value', 400)
      }
    }
  }

  req.body.name = name.trim()
  req.body.email = email.trim().toLowerCase()
  req.body.state = state ?? true
  req.body.phones = phones ?? []

  next()
}

function validateUpdateClient(req, res, next) {
  const { name, email, state } = req.body

  if (name === undefined && email === undefined && state === undefined) {
    throw new AppError('No fields to update', 400)
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new AppError('Invalid name', 400)
    }

    const parts = name.trim().split(/\s+/)
    if (parts.length < 2) {
      throw new AppError('Name must include first and last name', 400)
    }

    req.body.name = name.trim()
  }

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim() === '') {
      throw new AppError('Invalid email', 400)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400)
    }

    req.body.email = email.trim().toLowerCase()
  }

  if (state !== undefined && typeof state !== 'boolean') {
    throw new AppError('Invalid state value', 400)
  }

  next()
}

function validatePhoneParam(req, res, next) {
  const { number } = req.params

  if (!number || typeof number !== 'string' || number.trim() === '') {
    throw new AppError('Invalid phone parameter', 400)
  }

  next()
}

function validatePagination(req, res, next) {
  let { limit, page, order, sort } = req.query

  const allowedSortFields = ['register', 'email', 'c_name', 'id_client']

  limit = limit !== undefined ? Number(limit) : 10
  page = page !== undefined ? Number(page) : 1
  order = order ? order.toLowerCase() : 'asc'
  sort = sort ?? 'id_client'

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new AppError('Invalid limit', 400)
  }

  if (!Number.isInteger(page) || page <= 0) {
    throw new AppError('Invalid page', 400)
  }

  if (!['asc', 'desc'].includes(order)) {
    throw new AppError('Invalid order type', 400)
  }

  if (!allowedSortFields.includes(sort)) {
    throw new AppError('Invalid sort field', 400)
  }

  req.pagination = {
    limit,
    page,
    offset: (page - 1) * limit,
    sort,
    order
  }

  next()
}


module.exports = {
  validateIdParam,
  validatePhonesBody,
  validateCreateClient,
  validateUpdateClient,
  validatePhoneParam,
  validatePagination
}