const express = require("express")
const app = express()
const bp = require("body-parser")
const formidable = require("formidable")
const serveIndex = require("serve-index")
const mv = require("mv")
const conn = []
const fs = require("fs")
const { exec } = require('node:child_process');
require('express-ws')(app);
app.use(bp.json({ limit: "900mb" }));
app.use(bp.urlencoded({ limit: "900mb", extended: true }))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
app.get("/pixiv", (req, res) => {
    try{
        let link = req.query.link
        const postID = link.split("/")[5]
        exec(`node pxder/bin/pxder -p ${postID}`, (err, stdout, stderr) => {
            if (err) {
              console.error(err);
              return;
            }
            fs.readdir(__dirname + "/pxder/images/PID", (err, files) => {
                console.log(files)
                files.forEach(file => {
                    if(file.indexOf(postID) != -1){
                        res.send("http://192.168.43.58:8080/pxder/images/PID/" + file)
                    }
                })
            })
        })
    }catch(e){
        console.error(e)
    }
})
app.use("/", express.static(__dirname + "/"))
app.use("/files", serveIndex(__dirname + "/files"))
app.post("/file", (req, res) => {
    try {
        const form = new formidable.IncomingForm({
            maxFileSize: 900 * 1024 * 1024,
            maxFieldsSize: 900 * 1024 * 1024,
        })
        form.parse(req, (err, fields, files) => {
            const file = files.file
            if (err) {
                console.log(err)
                res.send("Error")
            }
            else {
                mv(file.filepath, __dirname + "/files/" + file.originalFilename, { mkdirp: false }, (err) => {
                    if (err) {
                        console.log(err)
                        res.send("Error")
                    }
                })
                res.send(`
                <html>
                <body>
                <h1>File Uploaded</h1>
                <script>
                    setTimeout(()=>{
                        window.location.href = "/"
                    }, 1000)
                </script>
                </body>
                </html>
                `)
            }
        })
    } catch (e) {
        console.log(e)
    }
})
app.ws('/ws', function (ws, req) {
    console.log("New connection")
    ws.send("Hello")
    conn.push(ws)
    ws.on('message', function (msg) {
        console.log("message: " + msg)
    });
});
app.listen(8080, () => {
    console.log("listening on port 8080")
});
(async () => {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('close', function () {
        console.log('\nBYE BYE !!!');
        process.exit(0);
    });
    function askCommand(){
        rl.question('> ', function (cmd) {
            if(cmd == "exit"){
                rl.close();
            }
            else{
                conn.forEach(ws => {
                    ws.send(`cmd@${cmd}`)
                })
                askCommand()
            }
        });
    }
    askCommand()
})()

