const express = require("express");
const { engine } = require("express-handlebars");
const app = express();
const port = 3000;

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
})

app.get("/33", (req, res) => {
  res.send("this is 33");
})

app.listen(port, () => {
  console.log(`ULR shortener http://localhost:${port}`);
})