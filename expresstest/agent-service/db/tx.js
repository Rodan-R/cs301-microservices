import pool from "./pool.js";

async function createAgent({ firstName, lastName, email, adminID }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertQuery = `
      INSERT INTO agents (first_name, last_name, email, role, admin_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;

    const values = [firstName, lastName, email, "agent", adminID];
    const result = await client.query(insertQuery, values);

    const agentId = result.rows[0].id;
    
    await client.query("COMMIT");
    return agentId;
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
      throw e;
  } finally {
    client.release();
  }
}

// NOT FOR PROD
async function getAgentByID({ agentID }) {
  const client = await pool.connect();
  try {
    const selectByIDQuery = `
      SELECT id, first_name, last_name, email, role
      FROM agents
      WHERE id = $1;
    `;

    const result = await client.query(selectByIDQuery, [agentID]);
    
    return result.rows[0] || null;
  } catch (e) {
    console.error('Error reading agent: ', e)
      throw e;
  } finally {
    client.release();
  }
}

// NOT FOR PROD
async function getAllAgent({ agentID }) {
  const client = await pool.connect();
  try {
    const selectByIDQuery = `
      SELECT id, first_name, last_name, email, role
      FROM agents
    `;

    const result = await client.query(selectByIDQuery, [agentID]);
    
    return result.rows[0] || null;
  } catch (e) {
    console.error('Error reading agent: ', e)
      throw e;
  } finally {
    client.release();
  }
}

async function getAgentByIDByAdminID({ adminID, agentID }) {
  const client = await pool.connect();
  try {
    const selectByIDQuery = `
      SELECT id, first_name, last_name, email, role
      FROM agents
      WHERE id = $1 AND admin_id = $2;
    `;

    const result = await client.query(selectByIDQuery, [agentID, adminID]);
    
    return result.rows[0] || null;
  } catch (e) {
    console.error('Error reading agent: ', e)
      throw e;
  } finally {
    client.release();
  }
}

// 1 page 20 clients
async function getAllAgentByAdminID({ adminID, limit, offset }) {
  const client = await pool.connect();
  try {
    const selectByIDQuery = `
      SELECT id, first_name, last_name, email, role
      WHERE admin_id = $1
      ORDER BY created_at DESC, agent_id DESC
      LIMIT $2 OFFSET $3;
    `;

    const result = await client.query(selectByIDQuery, [adminID, limit, offset]);

    return result.rows[0] || null;
  } catch (e) {
    console.error('Error reading agent: ', e)
      throw e;
  } finally {
    client.release();
  }
}

async function isElligible(adminID, agentID) {
  try {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM agents WHERE id = $1 AND admin_id = $2
      ) AS eligible;
    `;

    const result = await pool.query(query, [agentID, adminID]);
    return result.rows[0].eligible;
  } catch (e) {
    console.error('Error reading agent: ', e)
      throw e;
  }
}

async function updateAgentByAdminID({ adminID, agentID, data }) {
  if (!(await isElligible(adminID, agentID))) throw new Error ('Not Elllgible');

  const client = await pool.connect();
  try {
    const fields = [];
    const values = [];
    let i = 1;
    // const agentID = data.agentID ?? (() => { throw new Error('Missing agentID'); })();

    const push = (sqlFragment, value) => {
      fields.push(`${sqlFragment} $${++i}`);
      values.push(value);
    };

    if (data.firstName !== undefined) push('first_name =', data.firstName);
    if (data.lastName  !== undefined) push('last_name =',  data.lastName);
    if (data.email     !== undefined) push('email =',      data.email);
    if (data.role      !== undefined) push('role =',       data.role);

    if (fields.length === 0) return null; 

    const params = [agentID, adminID, ...values];

    await client.query('BEGIN');
    const sql = `
      UPDATE agents.agent_list
      SET ${fields.join(', ')},
          updated_at = now()
      WHERE agent_id = $1
        AND admin_id = $2
      RETURNING agent_id, first_name, last_name, email, role, created_at, updated_at;
    `;

    const { rows } = await pool.query(sql, params);
    await client.query("COMMIT");
    return rows[0] || null;
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
      throw e;
  } finally {
    client.release();
  }
}

async function hardDeleteByAdminID({adminID, agentID}) {
  if (!(await isElligible(adminID, agentID))) throw new Error ('Not Elllgible');

  const client = await pool.connect();
  try {
    const sql = `
      DELETE FROM agents.agent_list
      WHERE agent_id = $1
      AND admin_id = $2
      RETURNING agent_id
    `;

    const result = await pool.query(sql, [agentID, adminID]);

    if (result.rowCount === 0) {
      // Either don't exist, OR adminID don't own it
      throw new Error('Delete failed: not found or not authorized');
    }
  return result.rows[0].agent_id;
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
      throw e;
  } finally {
    client.release();
  }
}

async function softDeleteAgent(pool, adminID, agentID) {
  if (!(await isElligible(adminID, agentID))) throw new Error ('Not Elllgible');

  const client = await pool.connect();
  try {
    const sql = `
      UPDATE agents.agent_list
      SET deleted_at = now(), updated_at = now()
      WHERE agent_id = $1
        AND admin_id = $2
        AND deleted_at IS NULL
      RETURNING agent_id, deleted_at
    `;
    const result = await pool.query(sql, [agentID, adminID]);

    if (result.rowCount === 0) {
      throw new Error('Soft delete failed, not found ');
    }
    return result.rows[0];
  } catch (e) {
    try { await client.query("ROLLBACK"); } catch {}
      throw e;
  } finally {
    client.release();
  }
}

// CommonJS: module.exports = {}
// ESM: export {}
export { createAgent,
        getAgentByID, getAllAgent, 
        getAgentByIDByAdminID, getAllAgentByAdminID, 
        updateAgentByAdminID, 
        softDeleteAgent, 
        hardDeleteByAdminID
      };
