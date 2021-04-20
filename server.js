'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3001;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended :true}))

// Specify a directory for static resources
app.use(express.static('public'))

// define our method-override reference
app.use(methodOverride('_method'))


// Set the view engine for server-side templating
app.set('view engine', 'ejs');

// Use app cors
app.use(cors())


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',renderHome)
app.post('/favorite-quotes',handelSave)
app.get('/saved',renderSaved)
app.get('/favorite-quotes/:quote_id',renderDetails)
app.put('/favorite-quotes/:quote_id',handelUpdate)
app.delete('/favorite-quotes/:quote_id',handelDelete)




// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function handelUpdate(req,res){
    const id= req.params.quote_id
    const character= req.body.character
    const sql= 'UPDATE simpson SET character=$1 WHERE id=$2'
    client.query(sql,[character,id])
    .then(()=>{
        res.redirect(`/favorite-quotes/${id}`)
    })
}
function handelDelete(req,res){
    const id= req.params.quote_id
    const sql='DELETE FROM simpson WHERE id=$1'
    client.query(sql,[id])
    .then(()=>{
        res.redirect('/favorite-quotes')
    })

}
function renderDetails(req,res){
    const id= req.params.quote_id
    const sql='SELECT * FROM simpson WHERE id=$1'
    client.query(sql,[id])
    .then(data=>{
        res.render('details',{datbaseData:data.rows})
    })
}
function renderSaved(req,res){
    const sql='SELECT * FROM simpson'
    client.query(sql)
    .then(data=>{
        res.render('seved',{datbaseData:data.rows})
    })
}

function handelSave(req,res){
    const data= req.body
    const values= Object.values(data)
    const sql='INSERT INTO simpson (quote,character,image,characterdirection)VALUES($1,$2,$3,$4)'
    client.query(sql,values)
    .then(()=> res.redirect('/saved'))
}
function renderHome (req,res){
    const url='https://thesimpsonsquoteapi.glitch.me/quotes?count=10'
    superagent.get(url)
    .set('User-Agent', '1.0')
    .then(data=>{
        const array=data.body.map(result=>new Simp(result)) 
        console.log(array)
        res.render('home',{apiData:array})
    })
}

// helper functions

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
function Simp (info){
    this.quote = info.quote;
    this.character = info.character;
    this.image = info.image;
    this.characterdirection=info.characterDirection
}
