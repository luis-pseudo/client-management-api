const db = require("../db");
const AppError = require('../errors/AppError')

async function getClientsWithPhones() {
  const query = `
    SELECT
      c.id_client,
      c.c_name,
      c.c_lastname,
      c.email,
      p.phone_number
    FROM clients c
    LEFT JOIN phones p ON p.id_client = c.id_client
    ORDER BY c.id_client;
  `;

  const result = await db.query(query);
  return result.rows;
}

async function getClients(filters) {
  let query = `
    SELECT id_client, c_name, c_lastname, email, register, c_state
    FROM clients
    WHERE 1 = 1
  `;

  let countQuery=`SELECT count(*) AS total FROM clients WHERE 1=1`

  const values = [];
  let index = 1;

  if (filters.state !== undefined) {
    query += ` AND c_state = $${index}`;
    countQuery += ` AND c_state = $${index++}`;
    values.push(filters.state);
  }

  if(filters.id){
    query+=` AND id_client=$${index}`
    countQuery += ` AND id_client = $${index++}`;
    values.push(filters.id)
  }

  if (filters.before) {
    query += ` AND register < $${index}`;
    countQuery += ` AND register < $${index++}`;
    values.push(filters.before);
  }

  if (filters.after) {
    query += ` AND register > $${index}`;
    countQuery += ` AND register > $${index++}`;
    values.push(filters.after);
  }

  if(filters.pagination!==undefined){
    // sort & order are validated in validatePagination middleware
    query+=` ORDER BY ${filters.pagination.sort} ${filters.pagination.order} LIMIT ${filters.pagination.limit} OFFSET ${filters.pagination.offset}`
  }
  
  console.log(countQuery)
  console.log(query)

  const countResponse=await db.query(countQuery, values);
  const { rows } = await db.query(query, values);
  const total = Number(countResponse.rows[0].total)

  return {rows, total};
}

async function createClient(data) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      "INSERT INTO clients (c_name, c_lastname, email, register, c_state) VALUES ($1, $2, $3, CURRENT_DATE, $4) RETURNING id_client;",
      [data.name.split(" ")[0], data.name.split(" ")[1], data.email, data.state]
    );

    const clientId = result.rows[0].id_client;

    for (const element of data.phones) {
      await client.query(
        "INSERT INTO phones (id_client, phone_number) VALUES ($1, $2);",
        [clientId, element]
      );
    }

    await client.query("COMMIT;");
    return {id: clientId}
  } 
  catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') throw new AppError('Duplicated email', 409)
    throw error;
  }
  finally{
    client.release();
  }
}

async function updateClient(data) {
  const client = await db.connect();

  try {
    const existing = await client.query(
      'SELECT * FROM clients WHERE id_client = $1',
      [data.id]
    );

    if (existing.rowCount === 0) {
      throw new AppError('Client not found', 404)
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (data.firstname && data.firstname !== existing.rows[0].c_name) {
      fields.push(`c_name = $${index++}`);
      values.push(data.firstname);
    }

    if (data.lastname && data.lastname !== existing.rows[0].c_lastname) {
      fields.push(`c_lastname = $${index++}`);
      values.push(data.lastname);
    }

    if (data.email && data.email !== existing.rows[0].email) {
      fields.push(`email = $${index++}`);
      values.push(data.email);
    }

    if (typeof data.state === 'boolean' && data.state !== existing.rows[0].c_state) {
      fields.push(`c_state = $${index++}`);
      values.push(data.state);
    }

    if (fields.length === 0) {
      return { updated: false };
    }

    values.push(data.id);

    const query = `
      UPDATE clients
      SET ${fields.join(', ')}
      WHERE id_client = $${index}
    `;

    await client.query('BEGIN');
    await client.query(query, values);
    await client.query('COMMIT');

    return { updated: true };

  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
  }
}

async function addPhones(data){
  const client= await db.connect()
  try {
    if((await client.query("SELECT 1 FROM clients WHERE id_client=$1", [data.id])).rowCount===0) {
      throw new AppError('Client not found', 404)
    }

    const clientPhones=await client.query("SELECT phone_number FROM phones WHERE id_client=$1", [data.id])
    const existingPhones = clientPhones.rows.map(
      row => row.phone_number
    );

    for (const phone of data.phones) {
      if (existingPhones.includes(phone)) {
        throw new AppError('Phone already exists', 409)
      }
    }

    await client.query("BEGIN;")
    for (const element of data.phones) {
      await client.query("INSERT INTO phones(id_client, phone_number) VALUES ($1, $2)", [data.id, element])
    }
    await client.query("COMMIT;")
  
    return { added: data.phones.length };
  } catch (error) {
    try {await client.query("ROLLBACK")} catch(_){}
    throw error
  }
  finally{
    client.release()
  }
}

async function deletePhones(data){
  try {
    if((await db.query("SELECT 1 FROM clients WHERE id_client=$1", [data.id])).rowCount===0) {
      throw new AppError('Client not found', 404)
    }
    const result=await db.query("DELETE FROM phones WHERE id_client=$1 AND phone_number=$2 RETURNING phone_number", [data.id, data.number])
    if(result.rowCount===0) {
      throw new AppError('Number not found', 404)
    }
    return {deleted: true, number: result.rows[0].phone_number}
  } catch (error) {
    throw error
  }
}

async function deleteAllPhones(clientId) {
  try {
    const clientExists = await db.query(
      'SELECT 1 FROM clients WHERE id_client = $1',
      [clientId]
    )

    if (clientExists.rowCount === 0) {
      throw new AppError('Client not found', 404)
    }

    const result = await db.query(
      'DELETE FROM phones WHERE id_client = $1 RETURNING phone_number',
      [clientId]
    )

    if (result.rowCount === 0) {
      return { deleted: 0 }
    }

    return {
      deleted: result.rowCount,
      numbers: result.rows.map(r => r.phone_number)
    }

  } catch (error) {
    throw error
  }
}

async function deleteClient(data) {
  const client=await db.connect()
  try {
    await client.query("BEGIN;")
    if((await client.query("SELECT 1 FROM clients WHERE id_client=$1", [data.id])).rowCount===0){
      throw new AppError('Client not found', 404)
    }

    const r1=await client.query("DELETE FROM phones WHERE id_client=$1 RETURNING phone_number", [data.id])
    const r2=await client.query("DELETE FROM clients WHERE id_client=$1 RETURNING *", [data.id])
    await client.query("COMMIT;")

    return {
      deleted: true,
      client:{
        id: r2.rows[0].id_client,
        firstName: r2.rows[0].c_name,
        lastName: r2.rows[0].c_lastname,
        email: r2.rows[0].email,
        registerDate: r2.rows[0].register,
        lastState: r2.rows[0].c_state,
        phoneNumbers: r1.rows.map(row => row.phone_number)
      }
    }

  } catch (error) {
    try {await client.query("ROLLBACK")} catch(_){}
    console.log(error)
    throw error
  }
  finally{
    client.release()
  }
}

module.exports = {
  getClientsWithPhones,
  getClients,
  createClient,
  updateClient,
  addPhones,
  deletePhones,
  deleteAllPhones,
  deleteClient
};
