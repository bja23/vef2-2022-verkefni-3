import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  const client = await pool.connect();

  let result;

  try {
    result = await client.query(q, values);
  } catch (err) {
    console.error('Villa í query', err);
    throw err;
  } finally {
    client.release();
  }

  return result;
}

export async function comparePasswords(password, hash) {
  const result = await bcrypt.compare(password, hash);

  return result;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await query(q, [username]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir notendnafni');
    return null;
  }

  return false;
}

// Check if user is Admin
export async function isAdmin(username) {
    const q = 'SELECT isAdmin FROM users WHERE username = $1';
  
    try {
      const result = await query(q, [username]);
  
      if (result.rowCount === 1) {
        return result.rows[0];
      }
    } catch (e) {
      console.error('Gat ekki fundið notanda eftir notendnafni');
      return null;
    }
  
    return false;
  }

  // Check for all users in users table
export async function findAllUsers() {
    const q = 'SELECT username FROM users';
  
    try {
      const result = await query(q);
      return result.rows;
    } catch (e) {
      console.error('Gat ekki fundið notanda eftir notendnafni');
      return null;
    }
  
    return false;
  }



export async function findById(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}


export async function createUser(name,username,password) {
    const q = `INSERT INTO users (name,username,password )
    VALUES($1, $2,$3)`;
    const values = [name, username, password];
    try {
      const result = await query(q, values);
      if(result){
          return true;
      }
    } catch (e) {
      console.error('error inserting into user');
      return false;
    }
  
    return null;
  }

  export async function findAllEvents() {
    const q = 'SELECT name, slug, description, created, updated FROM events';
  
    try {
      const result = await query(q);
        return result.rows;

    } catch (e) {
      console.error('Gat ekki fundið events');
      return false;
    }
  
    return null;
  }