const __ = require('lodash');

const throwError = (res) => {
  return (err) => {
    return res.status(500).json({ error: err.stack });
  };
};

const getAll = (file, table) => {
  return (req, res) => {
    return file.download()
      .then(() => file.getDb())
      .then((db) => db.query(`SELECT * FROM ${table}`))
      .then((items) => res.json(items))
      .catch(throwError(res));
  };
};

const getOneBy = (file, table, column) => {
  return (req, res) => {
    return file.download()
      .then(() => file.getDb())
      .then((db) => db.query(`SELECT * FROM ${table} WHERE ${column} = :value`, { value: req.params[column] }))
      .then((items) => {
        return res
          .status(items && items[0] ? 200 : 404)
          .json(items[0]);
      })
      .catch(throwError(res));
  };
};

const insert = (file, table) => {
  return (req, res) => {
    const keys = __.keys(req.body);
    const query = `INSERT INTO ${table} (${__.join(keys, ', ')}) VALUES (:${__.join(keys, ', :')})`;

    return file.download()
      .then(() => file.getDb())
      .then((db) => db.query(query, req.body))
      .then(() => file.upload())
      .then(() => file.getDb())
      .then((db) => new Promise((resolve) => {
        db.lastRowID(table, (rowId) => resolve(rowId));
      }))
      .then((rowId) => res.json({ rowId }))
      .then(() => file.getDb())
      .then((db) => db.close())
      .catch(throwError(res));
  };
};

module.exports = { getAll, getOneBy, insert };