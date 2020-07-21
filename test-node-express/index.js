// import db from "./db.json"
const express = require('express');
var db = require("./db.json")
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    return res.send(db);
});




app.get('/search', (req, res) => {
    console.log('aici search', req.query);

    let name = req.query.value;


    let user_with_name = db.users.filter(user => user.public.name === name);

    if( user_with_name.length !== 0 )
    {
        console.log("User gasit si returnat.");
        res.send(user_with_name[0].public.email);
    }
    else
        res.status(404).send({error: "Nu s-a gasit user-ul cu numele dat."})

})

app.get('/:id/movies', (req, res) => {
    console.log('aici afisare filme user', req.query);

    let name = req.query.value;
    let id = req.params.id;

    let listaCodFilme = db.users[id].public.liked_movies;

    if( listaCodFilme.length !== 0 )
    {
        let listaFilme = listaCodFilme.map(idFilm => {return db.movies.find(movie => movie.id === idFilm)}).filter(movie => movie != null)
        listaFilme = listaFilme.map(movie => movie.name)
        res.send("This user likes movies such as:\n" + listaFilme);
    }
    else
        res.status(200).send({error: "Userul nu a adaugat niciun film."})

})

app.put('/update/:id', (req, res) => {
    console.log('aici update', req.body);
    let id = req.params.id;
    let updatedProfileData = req.body;
    let newProfile = {...db.users[id].public,  ...updatedProfileData}
    db.users[id].public = newProfile;
    console.log(db.users[id]);
    //db.users[id].public.name = name;
    res.send(db.users[id]);

})


/*
let a = [1, 2, 3, 4]
a.map(val => val % 2 == 0)      iti da [5, 10, 15, 20]
a.filter(val => val % 2 == 0)   iti da [2, 4]

 */

app.get('/:id', (req, res) => {
    console.log('aici', req.params.id);
    let id = req.params.id
    if(db.users[id]) {
        // let a = db.users.filter(user => user.id === id ); sa te uiti de functia de filter.
        // db.users.map(user => { console.log(user)});  sa te uiti de functia map ;)
        res.send(db.users[id])
    }
    else
        res.status(404).send({error: "nu s-a gasit user-ul"})

})




app.post('/', (req, res) => {
    console.log(req.body);
    db.users.push({});
    return res.send(db);
});

app.put('/', (req, res) => {
    return res.send('Received a PUT HTTP method');
});

app.delete('/', (req, res) => {
    return res.send('Received a DELETE HTTP method');
});


app.listen(8000, () =>
    console.log(`Example app listening on port ${8000}!`),
);