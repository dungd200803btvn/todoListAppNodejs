const express = require("express");
const mongoose = require("mongoose");
const app = express();
const url = "mongodb+srv://dungbtvn:dungbtvn2003@cluster0.aq21kv9.mongodb.net/?retryWrites=true&w=majority";
async function connect(){
    try {
       await mongoose.connect(url);
       console.log("Connect Mongodb success"); 
    } catch (err) {
        console.error(err);
    }
}
connect();

app.listen(8000, function() {
    console.log("Server started on port 8000");
  });
  