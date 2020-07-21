// import db from "./db.json"
const express = require('express');
var db = require("./db.json")
const path = require("path")
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

    let id = req.params.id;
    let movieArray = db.users[id].public.liked_movies;

    if( movieArray.length !== 0 )
    {
        let likedMovies = movieArray.map(idMovie => {return db.movies.find(movie => movie.id === idMovie)}).filter(movie => movie != null)
        likedMovies = likedMovies.map(movie => movie.name)
        res.send("This user likes movies such as:\n" + likedMovies.map(movie => " " + movie));
    }
    else
        res.status(200).send({error: "Userul nu a adaugat niciun film."})
})

app.get('/hello/:id', (req, res) => {

    res.sendFile(path.join(__dirname + '/helloworld.html'));

})
app.get('/:id/series', (req, res) => {
    console.log('aici afisare filme user', req.query);

    let id = req.params.id;
    let seriesArray = db.users[id].public.liked_series;

    if( seriesArray.length !== 0 )
    {
        let likedSeries = seriesArray.map(idSeries => {return db.series.find(series => series.id === idSeries)}).filter(series => series != null)
        likedSeries = likedSeries.map(movie => movie.name)
        res.send("This user likes series such as:\n" + likedSeries);
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
    res.json(db.users[id]);

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