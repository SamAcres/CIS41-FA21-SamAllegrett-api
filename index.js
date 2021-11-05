const express = require("express");

const db = require("./dbConnectExec.js");

const app = express();

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
