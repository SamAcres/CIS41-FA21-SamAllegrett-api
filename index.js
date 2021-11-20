const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js");
const rockwellConfig = require("./config.js");
const auth = require("./middleware/authenticate");

const app = express();
app.use(express.json());

//azurewebsites.net, colostate.edu
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(5000, () => {
  console.log(`app is running on port ${PORT}`);
});

app.get("/hi", (req, res) => {
  res.send("hello world");
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// app.post()
// app.put()

app.post("/contacts/logout", auth, (req, res) => {
  let query = `UPDATE Contact
  SET token = NULL
  WHERE ContactPK = ${req.contact.ContactPK}`;

  db.executeQuery(query)
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      console.log("error in POST /contacts/logout", err);
      res.status(500).send();
    });
});

app.patch("/reviews/:pk", auth, async (req, res) => {});

// app.delete("/reviews/:pk")

app.post("/Blog", async (req, res) => {
  try {
    let Blog = req.body.Blog;
    let Summary = req.body.Summary;
    let Ratings = req.body.Ratings;

    if (!Blog || !Summary || !Ratings || !Number.isInteger(Ratings)) {
      return res.status(400).send("bad request");
    }

    Summary = Summary.replace("'", "''");

    // console.log("summary", summary);
    // console.log("here is the contact", req.contact);

    let insertQuery = `INSERT INTO Blog(Summary, Ratings, Blog, AuthorFK)
    OUTPUT inserted.BlogPK, inserted.Summary, inserted.Ratings, inserted.AuthorFK
    VALUES('${Summary}', '${Ratings}', '${Blog}',${AuthorFK})`;

    let insertedReview = await db.executeQuery(insertQuery);
    console.log("inserted review", insertedReview);
    // res.send("Here is the response");

    res.status(201).send(insertedReview[0]);
  } catch (err) {
    console.log("error in POST /Blog", err);
    res.status(500).send();
  }
});

app.get("/author/me", auth, (req, res) => {
  res.send(req.Author);
});
//Question 4 complete
app.post("/author/login", async (req, res) => {
  // console.log("/contacts/login called", req.body);

  //1. data validation
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Bad request");
  }

  //2. check that user exists in DB

  let query = `SELECT *
  FROM author
  WHERE email = '${email}'`;

  let result;
  try {
    result = await db.executeQuery(query);
  } catch (myError) {
    console.log("error in /author/login", myError);
    return res.status(500).send();
  }

  // console.log("result", result);

  if (!result[0]) {
    return res.status(401).send("Invalid user credentials");
  }

  //3. check password
  let user = result[0];

  if (!bcrypt.compareSync(password, user.password)) {
    console.log("invalid password");
    return res.status(401).send("Invalid user credentials");
  }

  //4. generate token

  let token = jwt.sign({ pk: user.AuthorPK }, rockwellConfig.JWT, {
    expiresIn: "60 minutes",
  });
  // console.log("token", token);

  //5. save token in DB and send response

  let setTokenQuery = `UPDATE Author
  SET token = '${token}'
  WHERE AuthorPK = ${user.AuthorPK}`;

  try {
    await db.executeQuery(setTokenQuery);

    res.status(200).send({
      token: token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        AuthorPK: user.AuthorPK,
      },
    });
  } catch (myError) {
    console.log("error in setting user token", myError);
    res.status(500).send();
  }
});
//3.
app.post("/author", async (req, res) => {
  // res.send("/contacts called");

  // console.log("request body", req.body);

  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).send("Bad request");
  }

  firstName = firstName.replace("'", "''");
  lastName = lastName.replace("'", "''");

  let emailCheckQuery = `SELECT email
FROM author
WHERE email = '${email}'`;

  let existingUser = await db.executeQuery(emailCheckQuery);

  // console.log("existing user", existingUser);

  if (existingUser[0]) {
    return res.status(409).send("Duplicate email");
  }

  let hashedPassword = bcrypt.hashSync(password);

  let insertQuery = `INSERT INTO author(firstName,lastName,email,password)
VALUES('${firstName}','${lastName}','${email}','${hashedPassword}')`;

  db.executeQuery(insertQuery)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      console.log("error in POST /author", err);
      res.status(500).send();
    });
});
// 1.
app.get("/Blog", (req, res) => {
  //get data from the database
  db.executeQuery(
    `SELECT*
    FROM Blog`
  )
    .then((theResults) => {
      res.status(200).send(theResults);
    })
    .catch((myError) => {
      console.log(myError);
      res.status(500).send();
    });
});
// 2.
app.get("/Cuisine/:pk", (req, res) => {
  let pk = req.params.pk;
  //   console.log(pk);
  let myQuery = `SELECT *
  FROM Cuisine
  LEFT JOIN Region
  ON Region.RegionPK = Cuisine.RegionFK
  WHERE CuisinePK = ${pk};`;

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
      console.log("Error in /movies/:pk", err);
      res.status(500).send();
    });
});
