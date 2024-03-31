const express = require("express");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto')
const { engine } = require("express-handlebars");
const app = express();
const port = 3000;


app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const filePath = path.join(__dirname, 'URL.json');

let urlData = {};

if (fs.existsSync(filePath)) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    urlData = JSON.parse(data);
  } catch (error) {
    console.error("JSOM parse error");
  }
}

function shortenCode(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    const randomByte = crypto.randomBytes(1)[0];
    const index = randomByte % chars.length;
    result += chars[index];
  }
  return result;
}



app.get("/", (req, res) => {
  res.render("index");
})

app.post("/shortUrls", (req, res) => {

  const fullURL = req.body.url;

  if (!urlData) {
    res.render("index");
    return;
  }

  // check same shortURL
  if (urlData[fullURL]) {
    const shortURL = urlData[fullURL];
    res.render("show.hbs", { shortURL });
  } else {

    // creat shorturl
    const shortURL = shortenCode(5)

    // save shorturl
    urlData[fullURL] = shortURL;
    console.log(urlData[fullURL]);
    fs.writeFileSync(filePath, JSON.stringify(urlData), "utf-8");

    res.render("show.hbs", { shortURL });
  }
})

app.get("/shortURL/:shortCode", (req, res) => {
  const shortCode = req.params.shortCode;
  let url;
  for (const code in urlData) {
    if (urlData[code] === shortCode) {
      url = code;
      break;
    }
  }
  if (url) {
    res.redirect(url);
  } else {
    res.status(404).send("can nor find URL");
  }
})

app.get("/show", (req, res) => {
  res.render("show.hbs");
})


app.listen(port, () => {
  console.log(`ULR shortener http://localhost:${port}`);
})