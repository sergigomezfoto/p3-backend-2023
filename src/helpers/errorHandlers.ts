// Middleware dels errors
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, type: err.constructor.name, error: cleanPrismaError(err).error, message: err.message });
};


// chequeja segons les normes de krpano pels noms dels tours, escenes i hotspots
const checkName = (name) => {
  const nameRegex = /^[a-z][a-z\d_-]*$/;
  if (nameRegex.test(name) && name.length >= 3) {
    return {
      valid: true
    };
  } else {
    return {
      valid: false,
      message: 'Name must be at least 3 characters long and start with a letter. It can only contain lowercase letters, numbers, underscores, and dashes.',
    };
  }
};


// carregarnos try-catch i la validació del nom dels camps
const queryErrorHandler = (handler) => (req, res, next) => {
  if (req.body.name) {
    const { valid, message } = checkName(req.body.name);
    if (!valid) {
      return res.status(400).json({ ok: false, message });
    }
  }
  Promise.resolve(handler(req, res, next)).catch(next);
}


//errors de prisma:

const cleanPrismaError = (error) => {
  if (error.code === 'P2002') {
    // Error de violació de clau única
    const match = error.message.match(/Unique constraint violation on (\w+)\.(\w+)/);
    if (match) {
      const [, table, field] = match;
      const message = `The value entered for ${field} already exists in the ${table} table. Please choose a unique value.`;
      return { error: message };
    }
  } else if (error.code === 'P2025') {
    // Error de registre no trobat
    const match = error.message.match(/Record to (\w+) not found/);
    if (match) {
      const [, operation] = match;
      const message = `The record required for the "${operation}" operation was not found.`;
      return { error: message };
    }
  } else if (error.code === 'P2027') {
    // Error de violació de restricció de clau externa
    const match = error.message.match(/Foreign key constraint failed on field (\w+)\.(\w+)/);
    if (match) {
      const [, table, field] = match;
      const message = `The operation cannot be performed because the ${field} field in the ${table} table has a foreign key constraint.`;
      return { error: message };
    }
  }

  // Altres errors de Prisma
  return { error: 'An error occurred in the operation.' };
};



export { errorHandler, queryErrorHandler, cleanPrismaError, checkName };
