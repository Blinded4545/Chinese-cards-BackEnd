const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

let jsonParser = bodyParser.json();

const app = express();

const port = 8000;

app.use(cors());

app.get("/getAll",(req, res)=>{
    
    let db = new sqlite3.Database("./db/database.db", (err)=>{
        if(err) return err;
    });

    db.all("SELECT * FROM Words", (err, rows)=>{
        if(err) return err;

        rows.forEach(row => {
            console.log(row);
        });
        res.send(rows);
    });
});

app.post("/add",jsonParser, (req, res)=>{
    let db = new sqlite3.Database("./db/database.db", (err)=>{
        if(err) return err;
    })
    
    console.log(req.body);
    res.sendStatus(200)

    let word = req.body["word"];
    let meaning1 = req.body["meaning1"];
    let meaning2 = req.body["meaning2"] ? req.body["meaning2"] : null;
    let meaning3 = req.body["meaning3"] ? req.body["meaning3"] : null;
    let meaning4 = req.body["meaning4"] ? req.body["meaning4"] : null;
    let meaning5 = req.body["meaning5"] ? req.body["meaning5"] : null;

    db.run("INSERT INTO Words (word, meaning1, meaning2, meaning3, meaning4, meaning5) VALUES (?,?,?,?,?,?)", [word, meaning1, meaning2, meaning3, meaning4, meaning5],(err)=>{
        if(err){
            return err;
        }
    });
});

app.post("/delete", jsonParser,(req, res)=>{
    let db = new sqlite3.Database("./db/database.db", (err)=>{
        if(err) return err;
    })

    let word = req.body["word"];

    db.run("DELETE FROM Words WHERE word=?", [word], (err)=>{
        if(err){
            console.log(err);
            return err;
        }
        console.log("deleted", word);
        res.sendStatus(200);  
    })
});

app.listen(port, ()=>{
    console.log("Server running on port", port);
});
