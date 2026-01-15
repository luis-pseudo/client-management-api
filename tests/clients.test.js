const request = require('supertest')
const app = require('../src/app')
const db = require('../src/db')

afterAll(async () => {
  await db.end()
})

async function createTestClient(values) {
  const res = await request(app).post('/clients').send(values)
  return res.body.id
}

async function deleteTestClient(id) {
  await request(app).delete(`/clients/${id}`)
}


describe('GET /clients', () => {
  it('should return a list of clients', async () => {
    const res = await request(app).get('/clients')

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.pagination).toBeDefined()
  })
})

describe('GET /clients/phones', () => {
  it('should return clients with their phone numbers grouped', async () => {
    const res = await request(app).get('/clients/phones')

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)

    if (res.body.length > 0) {
      const client = res.body[0]

      expect(client).toHaveProperty('id')
      expect(client).toHaveProperty('name')
      expect(client).toHaveProperty('email')
      expect(client).toHaveProperty('phones')

      expect(typeof client.id).toBe('number')
      expect(typeof client.name).toBe('string')
      expect(typeof client.email).toBe('string')
      expect(Array.isArray(client.phones)).toBe(true)
    }
  })
})

describe('POST /clients', () => {

  it('should create a new client and return its id', async () => {
    const newClient = {
      name: 'John Doe',
      email: 'john.doe@test6.com',
      state: true,
      phones: ['555-1111', '555-2222']
    }

    const res = await request(app)
      .post('/clients')
      .send(newClient)

    expect(res.statusCode).toBe(201)

    expect(res.body).toHaveProperty('id')
    expect(typeof res.body.id).toBe('number')

    expect(res.body).toHaveProperty('message')

    await deleteTestClient(res.body.id)
  })

  it('should return 400 when body is missing required fields', async () => {
    const res = await request(app)
      .post('/clients')
      .send({})

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('should return 409 when email already exists', async () => {
    const client = {
      name: 'Jane Doe',
      email: 'duplicate@test.com',
      state: true,
      phones: ['555-3333']
    }

    // First insert → OK
    await request(app)
      .post('/clients')
      .send(client)

    // Second insert → conflict
    const res = await request(app)
      .post('/clients')
      .send(client)

    expect(res.statusCode).toBe(409)
    expect(res.body).toHaveProperty('error')
  })
})

describe('POST /clients/phones', ()=>{
    it('should insert new phones and return "added" as a numeric value', async ()=>{
        const testClient=await createTestClient({name: 'test buddy', email:'newtestemailihopedoesntexistalready@address.me', phones:["612-4312"], state: true})

        const res=await request(app)
            .post(`/clients/${testClient}/phones`)
            .send({phones: ['134-5315', '513-5123']})

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('added')
        expect(res.body).toHaveProperty('message')
        expect(typeof res.body.added).toBe('number')
        expect(typeof res.body.message).toBe('string')
        expect(res.body.added).toBe(2)

        await deleteTestClient(testClient)
    })
    it('should return 400 when sending an empty array', async ()=>{
        const testClient=await createTestClient({name: 'test buddy', email:'newtestemailihopedoesntexistalready@address.me', phones:[], state: true})

        const res=await request(app)
            .post(`/clients/${testClient}/phones`)
            .send({phones:[]})
        
        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')

        deleteTestClient(testClient)
    })
    it('should return 400 when sending wrong fields', async ()=>{
        const testClient=await createTestClient({name: 'test buddy', email:'newtestemailihopedoesntexistalready@address.me', phones:[], state: true})

        const res=await request(app)
            .post(`/clients/${testClient}/phones`)
            .send({wrongfield:"hi"})

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')

        deleteTestClient(testClient)
    })
    it('should return 404 when client not found', async ()=>{
        const res=await request(app)
            .post('/clients/99999/phones')
            .send({phones: ["492-5401"]})

        expect(res.status).toBe(404)
        expect(res.body).toHaveProperty('error')
    })
})

describe('PUT /clients/:id', () =>{
    it('should update sent client fields and return updated: true', async ()=>{
        const testValues={
            name: 'test client',
            email: 'testmail@address.me',
            state: true,
            phones: ['666-2357']
        }
        const newValues={
            name: "new name",
            email: 'newtestemail@address.me',
            state: false
        }

        //first insert new client so the test always works
        const testClient=await createTestClient(testValues)
        
        const res=await request(app)
            .put(`/clients/${testClient}`)
            .send(newValues)

        //delete the testing user so the database doesnt flood with tests
        await deleteTestClient(testClient)
        
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('updated')
        expect(res.body).toHaveProperty('message')
        expect(typeof res.body.updated).toBe('boolean')
        expect(res.body.updated).toBe(true)
    })
    it('should not update any fields if sent values are the current values and return updated: false', async ()=>{
        const testValues={
            name: 'test client',
            email: 'testmail@address.me',
            state: true,
            phones: ['666-2357']
        }
        const newValues={
            name: 'test client',
            email: 'testmail@address.me',
            state: true
        }

        //first insert new client so the test always works
        const testClient= await createTestClient(testValues)
        
        const res=await request(app)
            .put(`/clients/${testClient}`)
            .send(newValues)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('updated')
        expect(res.body).toHaveProperty('message')
        expect(typeof res.body.updated).toBe('boolean')
        expect(res.body.updated).toBe(false)

        //delete the testing user so the database doesnt flood with tests
        await deleteTestClient(testClient)
    })
    it('should return 404 if client does not exist', async () => {
    const res = await request(app)
        .put('/clients/999999')
        .send({ name: 'x x', email: 'x@test.com', state: true })

    expect(res.statusCode).toBe(404)
    })
    it('should return 400 for invalid body', async () => {
    const res = await request(app)
        .put('/clients/1')
        .send({ state: 'yes' })

    expect(res.statusCode).toBe(400)
    })
})