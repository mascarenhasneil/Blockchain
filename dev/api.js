var express=require('express')
var app=express()

app.get('/blockchain',function(req,res){
    res.send('Hello Blockchain World')
});

app.post('/transaction',function(req,res){

});

app.get('/mine',function(req,res){

});




app.listen(3000, function(){
    console.log("Listening on Port 3000......");
});

