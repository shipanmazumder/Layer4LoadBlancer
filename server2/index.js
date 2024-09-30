const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3002;

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello World from server 2");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});