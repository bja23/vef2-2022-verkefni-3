import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();




const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

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

  export async function findAllRegistrationToEvent(event) {
    const q = 'SELECT * FROM registration WHERE event = $1';
    const values = [event];
    try {
      const result = await query(q, values);
      return result.rows;
    } catch (e) {
      console.error('error getting registration for events');
      return false;
    }
  }



  export async function register(event,comment,userId) {
    const q = `INSERT INTO registration ("name",comment,"event",created )
    VALUES($1, $2,$3,$4)`;
    const values = [userId, comment, event, new Date()];
    try {
      const result = await query(q, values);
      if(result){
          return true;
      }
    } catch (e) {
      console.error('error register user into event');
      return false;
    }
  
    return null;
  }

  export async function deleteRegister(event,userId) {
    const q = 'DELETE FROM registration WHERE event = $1 AND name = $2';
    const values = [event, userId];
    try {
      const result = await query(q, values);
      if(result){
          return true;
      }
    } catch (e) {
      console.error('error deleting registration');
      return false;
    }
  
    return null;
  }

  export async function findingRegisterion(event,userId) {
    const q = 'SELECT FROM registration WHERE event = $1 AND name = $2';
    const values = [event, userId];
    try {
      const result = await query(q, values);
      if(result){
          if(result.rowCount > 0){
              return true;
          }
          return false;
      }
    } catch (e) {
      console.error('error finding registration');
      return false;
    }
  
    return null;
  }

  export async function deleteRegisterFromEvent(event) {
    const q = 'DELETE FROM registration WHERE event = $1';
    const values = [event];
    try {
      const result = await query(q, values);
      if(result){
          return true;
      }
    } catch (e) {
      console.error('error deleting registration where event = ');
      return false;
    }
  
    return null;
  }

  export async function deleteEvent(event) {
    const q = 'DELETE FROM events WHERE id = $1';
    const values = [event];
    try {
      const result = await query(q, values);
      if(result){
          return true;
      }
    } catch (e) {
      console.error('error deleting registration where event = ');
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
  }

  export async function findEvent(id) {
    const q = `SELECT "creator", name, slug, description, created, updated 
                FROM events WHERE id = $1`;
    const values = [id];
  
    try {
      const result = await query(q, values);
        return result.rows;

    } catch (e) {
      console.error('Gat ekki fundið events');
      return false;
    }
  }

  export function getSlug(name){
    const slug2 = [];

    // eslint-disable-next-line no-plusplus
   for (let i = 0; i < name.length; i++) {
     const ch = name[i].toLowerCase();
     const char = ch
       .replace(' ', '-')
       .replace('ð', 'd')
       .replace('þ', 'th')
       .replace('ö', 'o')
       .replace('á', 'a')
       .replace('é', 'e')
       .replace('í', 'i')
       .replace('ó', 'o')
       .replace('ú', 'u')
       .replace('ý', 'y')
       .replace('æ', 'ae');
     slug2.push(char);
   }
 
   const slug = slug2.join('');
   return slug;
  }

  export async function createEvent(name, description, id) {
    const slug = getSlug(name);

    const q = `INSERT INTO events ("creator", name, slug, description, created, updated)
        VALUES($1, $2, $3, $4, $5, $6)`;
    const values = [id, name,slug, description,new Date(),new Date()];
    try {
      await query(q, values);
      return true;

    } catch (e) {
      console.error('Gat ekki búið til event');
      return false;
    }
  }

  export async function updateEvent(description, id) {

    const q = 'UPDATE events SET description = $1, updated = $2 WHERE id = $3';
    const values = [description, new Date(), id];

    try {
      await query(q, values);
      return true;

    } catch (e) {
      console.error('Gat ekki uppfært viðburð');
      return false;
    }
  }

  