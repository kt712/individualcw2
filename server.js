
const express = require('express');
const app = express();
const MongoClient = require("mongodb").MongoClient;
const http = require('http');
const port = process.env.PORT || 3000;

var path = require('path');
var fs = require('fs');
app.use(express.json());

// logger middleware
app.use((req,res, next)=>{
    console.log("Request IP:"+req.url)
    console.log("Request Date"+ new Date())
    next();
})

//to avoid cors error
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

//mongo db connection
MongoClient.connect("mongodb+srv://ismail-kabir:Danmama785@cluster0.lpmoenk.mongodb.net", (error, client) => {
    db = client.db("coursework2");
});

app.use(express.static("./"));


app.get('/',(req,res,next)=>{
    res.send('Please select a collection e.g /collection/messages')
})


app.param("collectionName", (req, res, next, collectionName)=>{
    req.collection = db.collection(collectionName);
    return next();
});


app.get("/collection/:collectionName", (req, res, next)=>{
    req.collection.find({}).toArray((e, results) => {
        if (e) return next();
        res.send(results);
    });
});

//adding a post to save new order
app.post('/collection/:collectionName' , (req, res, next)=>{
    req.collection.insertMany(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});


// UPDATE SPACES OF LESSONS IN DB AFTER ORDER
app.put('/collection/:collectionName', (req, res) => {
    req.body.forEach((item) => {
        let filter = { id: item.id }
        let new_value = { $set: {numberofspaces: item.numberofspaces} }
        let options = { safe: true, multi: false }
        req.collection.updateOne(filter, new_value, options, (err, result) => {
            if (err) return next(err)
        })
    });
    res.send({msg: "spaces successfully updated"})
});

//search
app.get('/collection/:collectionName/search', (req, res, next) => {
    let query_str = req.query.key_word
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        let newList = results.filter((lesson) => {
            return lesson.subject.toLowerCase().match(query_str) || lesson.location.toLowerCase().match(query_str)
        });
        res.send(newList)
    })
});

//static files
app.use((req,res,next)=>{
    var filePath = path.join(__dirname, 'images',req.url)
    fs.stat(filePath, function(err,fileInfo){
        if(err){
            next();
            return ;
        }
        if(fileInfo.isFile) res.send(filePath)
        else next()
    })
})


//error handler
app.use(function(req,res){
    res.status(404).send("File not found")
})

app.listen(port,()=>{
    console.log("App started");
})