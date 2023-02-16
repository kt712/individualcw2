
const express = require('express')
const app = express()
const mongoclient = require('mongodb').mongoclient
const http = require('http')
const port = process.env.PORT || 3000

var path = require('path')
var fs = require('fs')
var cors = require('cors')

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

//to extract parameter from requesthk
app.use(express.json())

//mongo db connection
let db;
mongoclient.connect('mongodb+srv://ismail-kabir:Danmama785@cluster0.lpmoenk.mongodb.net/test', (err,client)=>{
    db = client.db('coursework2')
})

//get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

app.get('/',(req,res,next)=>{
    res.send('Please select a collection e.g /collection/messages')
})

//retrieving the lessons
app.get('/collection/:collectionName',(req,res,next)=>{
    req.collection.find({}).toArray((e,results)=>{
        if(e) return next(e)
        res.send(results)
    })
})

//adding a post to save new order
app.post('/collection/:collectionName',(req,res,next)=>{
    req.collection.insert(req.body,(e,results)=>{
        if(e) return next(e)
        res.send(results.ops)
    })
})

// updating a collection object
app.put('/collection/:collectionName/:id',(req,res,next)=>{
    req.collection.update(
        {_id:new objectId(req.params.id)},
        {$set:req.body},
        {safe:true, multi:false},
        (e,result)=>{
            if(e)return next(e)
            res.send(result.result.n ===1)?{'message':'Success'}:{'message':'Error'}
        }
    )
})

// search
app.get('/collection/:collectionName/search', (req, res, next) => {
    let query_str = req.query.key_word
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        let newList = results.filter((lesson) => {
            return lesson.subject.toLowerCase().match(query_str) || lesson.location.toLowerCase().match(query_str)
        });
        res.send(newList)
    })
})


// serving static files
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