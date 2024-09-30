
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello World from server 1");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});