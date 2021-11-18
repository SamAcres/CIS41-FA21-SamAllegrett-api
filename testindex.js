const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("./dbConnectExec.js");

const app = express();
app.use(express.json());

app.listen(5000, () => {
  console.log(`app is running on port 5000`);
});

app.get("/hi", (req, res) => {
  res.send("hello world");
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// app.post()
// app.put()

app.post("/author", async (req, res) => {
  // res.send("/author call");

  // console.log("request body", req.body);

  let fName = req.body.fName;
  let lName = req.body.lName;
  let Email = req.body.Email;
  let Password = req.body.Password;

  if (!fName || !lName || !Email || !Password) {
    return res.status(400).send("bad request");
  }

  let emailCheckQuery = `SELECT email
  FROM Author
  WHERE email = ${Email}`;

  let existingUser = await db.executeQuery(emailCheckQuery);

  // console.log("existing user", existingUser);

  if (existingUser[0]) {
    return res.status(409).send("Duplicate email");
  }

  let hashedPassword = bcrypt.hashSync(Password);

  let insertQuery = `INSERT INTO Author(fName, lName, Email, Password)
  VALUES ('${fName}','${lName}','${Email}', '${hashedPassword}')`;

  db.executeQuery(insertQuery)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      console.log("error in POST /contact", err);
      res.status(500).send();
    });
});

app.get("/Cuisine", (req, res) => {
  //get data from the database
  db.executeQuery(
    `SELECT *
  FROM Cuisine
  LEFT JOIN Region
  ON REgion.RegionPK = Cuisine.RegionFK`
  )
    .then((theResult) => {
      res.status(200).send(theResult);
    })
    .catch((myError) => {
      console.log(myError);
      res.status(500).send();
    });
});

app.get("/Cuisine/:pk", (req, res) => {
  let pk = req.params.pk;
  //   console.log(pk);
  let myQuery = `SELECT *
  FROM Cuisine
  LEFT JOIN Region
  ON REgion.RegionPK = Cuisine.RegionFK
  WHERE CuisinePK = ${pk}`;

  db.executeQuery(myQuery)
    .then((result) => {
      // console.log("result", result);
      if (result[0]) {
        res.send(result[0]);
      } else {
        res.status(404).send(`bad request`);
      }
    })
    .catch((err) => {
      console.log("error in /Cuisine/:pk", err);
      res.status(500).send();
    });
});
