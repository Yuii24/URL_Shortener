const express = require("express");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto')
const { engine } = require("express-handlebars");
const app = express();
const port = 3000;
const URL = require("./URL.json");
// const filePath = path.join(__dirname, 'public', 'json', 'URL.json');

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const filePath = path.join(__dirname, 'URL.json');
console.log(filePath);

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
  res.render("index2");
})

// 01

// app.post("/shortUrls", (req, res) => {
//   const url = req.body.url; // 获取表单提交的URL
//   const shortUrls = generateRandomAlphaNum(5); // 生成短链接

//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading JSON file:', err);
//       return res.status(500).send('An error occurred');
//     }

//     let urls;
//     try {
//       urls = JSON.parse(data || '{}'); // 尝试解析文件内容，确保为空对象而不是数组
//     } catch (parseErr) {
//       console.error('Error parsing JSON:', parseErr);
//       return res.status(500).send('An error occurred while parsing JSON');
//     }

//     urls[url] = shortUrls; // 将新的URL和短链接添加到对象中

//     fs.writeFile(filePath, JSON.stringify(urls, null, 2), (err) => {
//       if (err) {
//         console.error('Error writing JSON file:', err);
//         return res.status(500).send('An error occurred while writing JSON');
//       }
//       console.log(`Received URL: ${url}, Short URL: ${shortUrls}`);
//       res.send('URL added successfully'); // 确认URL添加成功
//     });
//   });
// });

// 02 

app.post("/shortUrls", (req, res) => {

  const fullURL = req.body.url;

  if (!urlData) {
    res.render("index2");
    console.log("if(!urlData)")
    return;
  }


  // check same shortURL
  if (urlData[fullURL]) {
    const shortURL = urlData[fullURL];
    res.render("show.hbs", { shortURL });
    console.log("res.render(index2, { shortURL });")
  } else {

    // creat shorturl
    const shortURL = shortenCode(5)
    console.log(shortURL);

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
      console.log(code);
      console.log(urlData[code]);
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