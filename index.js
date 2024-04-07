const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser")
const secretK = "Secret"

const saltRounds=10;

let jsonParser = bodyParser.json();

const app = express();

const port = 8000;

app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));
app.use(cookieParser());

app.post("/getAll", jsonParser,(req, res)=>{
    const token = req.body["token"]
    let currUsr;
    try {
        const claims = jwt.verify(token, secretK);
        if(!claims){
            res.sendStatus(401);
        }
        currUsr = claims["usr"]
    } catch (error) {
        console.log("Err");
    }


    let db = new sqlite3.Database("./db/database.db", (err)=>{
        if(err) return err;
    });

    db.all("SELECT * FROM Words WHERE Username = (?)", [currUsr], (err, rows)=>{
        if(err) return err;
        //console.log(rows)
        res.send(rows);
    });

    db.close()
});

//ADD A WORD
app.post("/add", jsonParser, (req, res)=>{
    const token = req.body["token"]
    let currUsr;
    try {
        const claims = jwt.verify(token, secretK);
        if(!claims){
            res.sendStatus(401);
        }
        currUsr = claims["usr"]
    } catch (error) {
        console.log("Err");
    }

    let db = new sqlite3.Database("./db/database.db", (err)=>{
        if(err) return err;
    })
        

    let word = req.body["word"];
    let meaning1 = req.body["meaning1"];
    let meaning2 = req.body["meaning2"] ? req.body["meaning2"] : null;
    let meaning3 = req.body["meaning3"] ? req.body["meaning3"] : null;
    let meaning4 = req.body["meaning4"] ? req.body["meaning4"] : null;
    let meaning5 = req.body["meaning5"] ? req.body["meaning5"] : null;

    db.run("INSERT INTO Words (word, meaning1, Username, meaning2, meaning3, meaning4, meaning5) VALUES (?,?,?,?,?,?,?)", [word, meaning1, currUsr, meaning2, meaning3, meaning4, meaning5],(err)=>{
        if(err){
            console.log(err);
            return res.send("Word alredy exists")
        }
        
        console.log("added");
        res.sendStatus(200)
    });

    db.close()
});

//DELETE A WORD
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

    db.close()
});


//REGISTER ON APP
app.post("/reg", jsonParser, async (req,res)=>{
    console.log(req.body);
    let usr = req.body["usr"]
    let pwd = req.body["pwd"];
    let pwdHash;

    bcrypt
    .hash(pwd, saltRounds)
    .then(hash => {
        pwdHash = hash 
        console.log('Hash ', pwdHash)

        let db = new sqlite3.Database("./db/database.db", (err)=>{
            if(err) return err;
        })
    
        db.run("INSERT INTO Users (Username, Password) VALUES (?,?)", [usr, hash], (err)=>{
            if(err){
                console.log(err);
            }

            res.send("works")
        })

        db.close()
    })
    .catch(err => console.error(err.message))


});

app.post("/login", jsonParser, (req,res)=>{
    let usr = req.body["usr"];
    let pwd = req.body["pwd"];

    
    let db = new sqlite3.Database("./db/database.db", (err)=>{
        if(err) return err;
        })

    db.all("SELECT * FROM Users WHERE Username = (?)", [usr], async (err, rows)=>{
        if(err){
            console.log(err);
        }
        
        if(rows.length!=0){
            if(!(await bcrypt.compare(pwd, rows[0]["Password"]))){
                // console.log(pwd, rows[0]["Password"])
                return res.status(401).json({message: "Invalid Password"})
            }else{

            // console.log(await bcrypt.compare(pwd, rows[0]["Password"]))

            const token = jwt.sign({usr}, secretK);

            res.cookie("jwt", token, {
                httpOnly: false,
                maxAge: 24*60*60*1000
            });

            console.log("Successful");


            ////Esto solo es para la app relacionada, cualquier otra app que quiera usar esto como api tendra que establecer su propia cookie
            //res.send(token);
            res.sendStatus(200)
            }
        }

    })

    db.close()
});

app.post("/logout", (req,res)=>{
    res.cookie("jwt", "", {
        maxAge:0
    });
    res.end();
});

app.listen(port, ()=>{
    console.log("Server running on port", port);
});
