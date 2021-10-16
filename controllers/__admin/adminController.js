const { db } = require("../../database");
const { createToken } = require("../../helpers/jwt");
const crypto = require("crypto");
const BASE_URL = "http://localhost:3000";

module.exports = {
  adminLogin: (req, res) => {
    const { email, password } = req.body;

    const hashPassword = crypto
      .createHmac("sha1", process.env.SECRET_KEY)
      .update(req.body.password)
      .digest("hex");

    const getUserDataQuery = `SELECT * from admin WHERE email='${email}' AND password='${password}'`;
    db.query(getUserDataQuery, (err, result) => {
      if (err) res.status(400).send(err);
      if (result.length === 0) {
        res.status(200).send({ status: "failed", message: "User not found" });
      } else {
        let token = createToken({
          idAdmin: result[0].id_admin,
        });

        res.status(200).send({ status: "success", data: result[0], token });
      }
    });
  },

  keepLogin: (req, res) => {
    let idAdmin = req.user.idAdmin;
    const getAdminDataQuery = `SELECT * from admin WHERE id_admin='${idAdmin}'`;
    db.query(getAdminDataQuery, (err, result) => {
      if (err) res.status(400).send(err);
      if (result.length === 0) {
        res.status(200).send({ status: "failed", message: "User not found" });
      } else {
        res.status(200).send({ status: "success", data: result[0] });
      }
    });
  },

  getlistTransaction: (req, res) => {
    const getTransaction = `SELECT full_name, address, kecamatan, kabupaten, total_price, quantity, product_name
    FROM transaction t 
    INNER JOIN address a
          ON t.id_user=a.id_user
    INNER JOIN user u
          ON t.id_user=u.id_user
    INNER JOIN product pr
          ON t.id_product= pr.id_product;`
          db.query(getTransaction, (err, result) => {
            if (err) res.status(400).send(err);
            if (result.length === 0) {
              res.status(200).send(err);
            } else {
              res.status(200).send(result);
            }
          });
  },

  filterTransaction:  (req, res) => {
    const {full_name} = req.body;
    const filterquerry = ` SELECT full_name, address, kecamatan, kabupaten, total_price, quantity, product_name
    FROM transaction t 
    INNER JOIN address a
          ON t.id_user=a.id_user
    INNER JOIN user u
          ON t.id_user=u.id_user
    INNER JOIN product pr
          ON t.id_product= pr.id_product
    WHERE full_name LIKE '%${full_name}%';`
    // OR address LIKE '%${editData}%' OR kecamatan LIKE '%${editData}%' 
    // OR kabupaten LIKE '%${editData}%'
    // OR total_price LIKE '%${editData}%' OR quantity LIKE '%${editData}%'  OR product_name LIKE '%${editData}%'
    db.query(filterquerry, (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send(err);
      }
      res.status(200).send(result);
    });
  }
};
