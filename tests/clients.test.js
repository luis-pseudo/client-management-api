const request = require('supertest')
const app = require('../src/app')
const db = require('../src/db')

afterAll(async () => {
  await db.end()
})

describe('GET /clients', () => {
  it('should return a list of clients', async () => {
    const res = await request(app).get('/clients')

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.pagination).toBeDefined()
  })
})

describe('POST /clients', () => {
  it('should return 400 when body is invalid', async () => {
    const res = await request(app)
      .post('/clients')
      .send({})

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})