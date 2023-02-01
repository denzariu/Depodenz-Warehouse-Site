const express = require('express');
const session = require('express-session');
var bodyParser = require('body-parser');
const path = require("path")
const app = express();
const sharp = require("sharp");
// import db from "./db.json"

var mysql = require('mysql')
var db = require("./db.json");


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Inits
app.use(session({
    secret: 'proiect_bd',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.engine('html', require('ejs').renderFile);



//Create connection
var dbSql = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lantmagazine'
})


//Connect
dbSql.connect((err) => {
    if(err){
        throw err;
    }
    console.log("MySql Started.");
})


//Fetch data from MySQL databse table
app.get('/showEmployees', function(req, res, next) {
    var sql='SELECT * FROM accounts';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.render('user-list', { title: 'User List', userData: data});
    });
});

//Create the DB
app.get('/createdb', (req, res) => {
    console.log('aici creez', req.query);

    let name = req.query.name;

    let sql = `CREATE DATABASE ${name}`;

    dbSql.query(sql, (err, result) => {
        if(err){
            console.log(err)
        }else{
            console.log(result);
            dbSql.end();
            res.send("it worked!");
        }
    })
});


// Graph 1 - Repartition of employees in Warehouses
app.get('/empWH', (req, res) => {

    sql = 'SELECT M.nume AS Name, COUNT(A.id) AS Number FROM angajati A LEFT JOIN magazine M ON A.idMagazin = M.id GROUP BY M.nume';
    dbSql.query(sql, null, (error, results, fields) => {
        console.log(results);
        res.json(results);
    });

});

// Graph 2 - Products of Producers
app.get('/ProducerProductGraph', (req, res) => {

    sql = 'SELECT PR.nume AS Name, COUNT(P.id) AS NumberOfProducts FROM produse AS P RIGHT JOIN producatori AS PR ON P.idProducator = PR.id GROUP BY PR.id';
    dbSql.query(sql, null, (error, results, fields) => {
        console.log(results);
        res.json(results);
    });

});

// Graph 3 - Number of Products in Warehouse
app.get('/WarehouseNoProductGraph', (req, res) => {

    sql = 'SELECT M.nume AS Name, SUM(PM.cantitate) AS Quantity from magazine M JOIN produse_magazine PM ON PM.id = M.id GROUP BY M.id';
    dbSql.query(sql, null, (error, results, fields) => {
        console.log(results);
        res.json(results);
    });

});

// Graph 4 - How many Warehouses in every City
app.get('/WarehousesPerCity', (req, res) => {

    sql = 'SELECT ZD.oras AS City, COUNT(ZD.id) As Number FROM zone_distribuire ZD JOIN magazine M ON M.zip = ZD.id ' +
        'GROUP BY M.zip';
    dbSql.query(sql, null, (error, results, fields) => {
        console.log(results);
        res.json(results);
    });

});

//Update Employee Table
app.post('/updateEmployee/:id', (req, res) => {
    var name = req.body.Name;
    var surname = req.body.Surname;
    var cnp = req.body.CNP;
    var birthdate = req.body.Birthdate;
    var hiredate = req.body.Hiredate;
    var type = req.body.Position;
    var shop_name = req.body.ShopName;
    var iddeposit;
    console.log("AM AJ");

    dbSql.query('SELECT id FROM magazine WHERE nume = ?', [shop_name], (error, results, fields) => {

        console.log(error);
        if (typeof results[0] !== 'undefined') {
            console.log("aiciiiii");
            iddeposit = results[0].id;
        }
        else
            iddeposit = null;
        console.log(iddeposit);

        if (name && surname) {
            if(iddeposit) {
                var sql = 'UPDATE angajati SET nume = ?, prenume = ?, cnp = ?, dataNasterii = ?, dataAngajarii = ?, tipAngajat = ?, idMagazin = ?' +
                    ' WHERE angajati.id = ?';
                dbSql.query(sql, [name, surname, cnp, birthdate, hiredate, type, iddeposit, req.params.id], (error, results, fields) => {
                    console.log(results);
                    console.log(error);
                    console.log(iddeposit,req.params.id);
                    res.end();
                });
            } else {
                var sql = 'UPDATE angajati SET nume = ?, prenume = ?, cnp = ?, dataNasterii = ?, dataAngajarii = ?, tipAngajat = ?, idMagazin = ?' +
                    ' WHERE angajati.id = ?';
                dbSql.query(sql, [name, surname, cnp, birthdate, hiredate, type, iddeposit, req.params.id], (error, results, fields) => {
                    console.log(results);
                    console.log(error);
                    console.log("nu are iddep");
                    console.log(birthdate);
                    res.end();
                });
            }

        } else {
            res.send('Please complete all of the fields!');
            res.end();
        }
    });
});


//Update Warehouse Table
app.post('/updateWarehouse/:id', (req, res) => {
    var name = req.body.Name;
    var descName = req.body.DescName;
    var address = req.body.Address;
    var zip = req.body.ZIP;
    var latitude = req.body.Latitude;
    var longitude = req.body.Longitude;
    var open_time = req.body.OpenTime;
    var closing_time = req.body.CloseTime;

    console.log("AM AJ WH");

    if (name && zip) {
        var sql = 'UPDATE magazine SET nume = ?, sub_nume = ?, adresa = ?, zip = ?, latitudine = ?, longitudine = ?, ora_deschidere = ?, ora_inchidere = ?' +
                    ' WHERE magazine.id = ?';
        dbSql.query(sql, [name, descName, address, zip, latitude, longitude, open_time, closing_time, req.params.id], (error, results, fields) => {
            console.log(results);
            console.log(error);
            res.end();
        });
    } else {
        res.send('Please complete all of the fields!');
        res.end();
    }

});

//Testing SQL Queries
app.get('/testSQL', (req, res) => {
    //var sql='SELECT * FROM angajati';
    var sql='SELECT A.id, A.nume, A.prenume, M.nume AS numeMag ' +
        'FROM angajati A LEFT JOIN magazine M ON A.idMagazin = M.id';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.send(data);
    });
})

//Fetch Team when pressing a button
app.get('/ourTeam', (req, res) => {
    //var sql='SELECT * FROM angajati';
    var sql='SELECT A.id, A.nume, A.prenume, A.cnp, A.dataNasterii, A.dataAngajarii, A.tipAngajat, M.nume AS numeMag ' +
            'FROM angajati A LEFT JOIN magazine M ON A.idMagazin = M.id ORDER BY numeMag';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

//Fetch WH
app.get('/ourWarehouses', (req, res) => {
    var sql='SELECT * FROM magazine ORDER BY zip';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

//Fetch DistZones
app.get('/ourDistZones', (req, res) => {
    var sql='SELECT * FROM zone_distribuire';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

//Fetch Producers
app.get('/ourProducers', (req, res) => {
    var sql='SELECT * FROM producatori';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

//Fetch Products
app.get('/ourProducts', (req, res) => {
    var sql='SELECT P.id, P.nume, P.pret, P.status, P.dataImport, PR.nume as producator FROM produse P LEFT JOIN producatori PR ON P.idProducator = PR.id';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

//Fetch Warehouse
app.get('/ourWarehouses/:id', (req, res) => {

    let id = req.params.id;
    let sql = `SELECT WH.nume, WH.sub_nume, WH.adresa, WH.zip, WH.latitudine, WH.longitudine, WH.ora_deschidere, WH.ora_inchidere
                FROM magazine AS WH WHERE WH.id = ?`;

    dbSql.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            //dbSql.query(`SELECT nume FROM magazine WHERE magazine.id = ${id}`, (err, result) => {
            console.log(result);
            res.send(result);
        }
    })
})

//TODO: add nume mag to 'our team' - done
app.get('/ourTeam/:id', (req, res) => {

    let id = req.params.id;
    let sql = `SELECT A.nume, A.prenume, A.cnp, A.dataNasterii, A.dataAngajarii, A.tipAngajat, M.nume AS numeMag
                FROM angajati A LEFT JOIN magazine M ON A.idMagazin = M.id WHERE A.id = ?`;

    dbSql.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            //dbSql.query(`SELECT nume FROM magazine WHERE magazine.id = ${id}`, (err, result) => {
            console.log(result);
            res.send(result);
        }
    })
})

// Test
app.post('/viewEmployees', (req, res) => {
    console.log('aici vad toti angajatii', req.query);


    let sql = `SELECT * FROM angajati`;

    dbSql.query(sql, (err, result) => {
        if(err){
            console.log(err)
        } else{
            let rows = [];
            if(result.length) {
                for (var i = 0; i < result.length; i++) {
                    result.push(res[i]);
                }
                console.log(result);

                res.render(__dirname + "/home.html", {result: rows});
                //res.send(result.nume);
            }
        }
    })
});

//Login Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/login.html'));
})

//Login Check
app.post('/auth', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    console.log("User login: ", username, password);
    if (username && password) {
        var sql = 'SELECT * FROM accounts WHERE username = ? AND password = ?';
        dbSql.query(sql, [username, password], (error, results, fields) => {
            console.log(results);
            if (results.length > 0) {
                console.log(results);
                req.session.loggedin = true;
                req.session.username = username;
                res.status(200).redirect('/home');
            } else {
                res.status(200).send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

//Load main page
app.get('/home',(req, res) => {
    if (req.session.loggedin) {
        res.render(__dirname + "/home.html", {name:req.session.username, result:null});
        //res.sendFile(path.join(__dirname + '/home.html'));
    } else {
        res.send('Please login to view this page!');
    }
    res.end();
});

//Delete an employee
app.get('/deleteEmployee/:id', (req, res) => {
    let idAng = req.params.id;
    console.log(idAng);

    if(idAng) {
        let sql = 'DELETE FROM angajati WHERE id = ?';
        dbSql.query(sql, [idAng], (error, results, fields) => {
            console.log("deleted");
            console.log(error);

            res.end();
        });
    }
});

//Delete a WH
app.get('/deleteWarehouse/:id', (req, res) => {
    let idWH = req.params.id;
    console.log(idWH);

    if(idWH) {
        let sql = 'DELETE FROM magazine WHERE id = ?';
        dbSql.query(sql, [idWH], (error, results, fields) => {
            console.log("deleted");
            console.log(error);

            res.end();
        });
    }
});

//Add a product
app.post('/addProduct', (req, res) => {
    var name = req.body.Name;
    var producer = req.body.Producer;
    var price = req.body.Price;
    var status = req.body.Status;
    var importDate = req.body.ImportDate;
    var logo = req.body.LinkLogo;
    var idProducer;
    dbSql.query('SELECT id FROM producatori WHERE LOWER(nume) = ?', [producer.toLowerCase()], (error, results, fields) => {

        console.log(error);
        if (typeof results[0] !== 'undefined') {
            console.log("aiciiiii produs");
            idProducer = results[0].id;
        } else
            idProducer = null;


        //if (idProducer) {
            var sql = 'INSERT INTO produse (nume, idProducator, pret, status, dataImport, linkLogo) ' +
                    'VALUES (?,?,?,?,?,?)';
            dbSql.query(sql, [name, idProducer, price, status, importDate, logo], (error, results, fields) => {
                console.log(results);
                console.log(error);
                console.log(idProducer, req.params.id);
                res.end();
            });
        /*} else {
            var sql = 'INSERT INTO angajati (nume, prenume, cnp, dataNasterii, dataAngajarii, tipAngajat) ' +
                'VALUES (?,?,?,?,?,?)';
            dbSql.query(sql, [name, price, status, importDate, logo], (error, results, fields) => {
                //console.log(results);
                //console.log(error);
                console.log("nu am gasit producatorul");
                res.end();
            });
        }*/
    });

});


//TODO: scurtat, cautat si dupa producer - done
app.post('/linkProductToWH', (req, res) => {
    var product = req.body.Product;
    var producer = req.body.Producer;
    var WH = req.body.Warehouse;
    var quantity = req.body.Quantity;

    var idWH;
    var idProd;
    dbSql.query('SELECT id FROM magazine WHERE LOWER(nume) = ?', [WH.toLowerCase()], (error, results, fields) => {

        console.log(error);
        if (typeof results[0] !== 'undefined') {
            console.log("aiciiiii");
            idWH = results[0].id;
        } else
            idWH = null;
        console.log(idWH);

        dbSql.query('SELECT P.id FROM produse P JOIN producatori PR ON P.idProducator = PR.id WHERE LOWER(P.nume) = ? AND LOWER(PR.nume) = ?', [product.toLowerCase(), producer.toLowerCase()], (error, results, fields) => {

            console.log(error);
            if (typeof results[0] !== 'undefined') {
                console.log("aiciiiii");
                idProd = results[0].id;
            } else
                idProd = null;
            console.log(idProd);

            dbSql.query('INSERT INTO produse_magazine (id, idProdus, cantitate) ' +
                'VALUES (?,?,?)', [idWH, idProd, quantity], (error, results, fields) => {

                console.log(results);
                console.log(error);
                res.end();
            })

        });
    });

})

//Add a Producer
app.post('/addProducer', (req, res) => {
   var name = req.body.Name;
   var phone = req.body.Phone;
   var email = req.body.Email;
   var category = req.body.Category;

   dbSql.query('INSERT INTO producatori (nume, telefon, email, categorie) ' +
       'VALUES (?,?,?,?)', [name, phone, email, category], (error, results, fields) => {

       console.log(results);
       console.log(error);
       res.end();
   })

});

//Add an employee
app.post('/addEmployee', (req, res) => {
    var name = req.body.Name;
    var surname = req.body.Surname;
    var cnp = req.body.CNP;
    var birthdate = req.body.Birthdate;
    var hiredate = req.body.Hiredate;
    var type = req.body.Type;
    var shop_name = req.body.WarehouseName;

    dbSql.query('SELECT id FROM magazine WHERE LOWER(nume) = ?', [shop_name.toLowerCase()], (error, results, fields) => {

        console.log(error);
        if (typeof results[0] !== 'undefined') {
            console.log("aiciiiii");
            iddeposit = results[0].id;
        } else
            iddeposit = null;

        console.log(iddeposit);

        if (name && surname) {
            if (iddeposit) {
                var sql = 'INSERT INTO angajati (nume, prenume, cnp, dataNasterii, dataAngajarii, tipAngajat, idMagazin) ' +
                    'VALUES (?,?,?,?,?,?,?)';
                dbSql.query(sql, [name, surname, cnp, birthdate, hiredate, type, iddeposit], (error, results, fields) => {
                    console.log(results);
                    console.log(error);
                    console.log(iddeposit, req.params.id);
                    res.end();
                });
            } else {
                var sql = 'INSERT INTO angajati (nume, prenume, cnp, dataNasterii, dataAngajarii, tipAngajat) ' +
                    'VALUES (?,?,?,?,?,?)';
                dbSql.query(sql, [name, surname, cnp, birthdate, hiredate, type, iddeposit], (error, results, fields) => {
                    //console.log(results);
                    //console.log(error);
                    console.log("nu are iddep");

                    res.end();
                });
            }
        } else {
            res.send('Please complete all of the fields!');
            res.end();
        }
    });

});

//Add DZ
app.post('/addDistributionZone', (req, res) => {
    var city = req.body.City;
    var district = req.body.District;
    var zip = req.body.ZIP;

    if (city && district) {

        var sql = 'INSERT INTO zone_distribuire (id, oras, subregiune) ' +
            'VALUES (?,?,?)';
        dbSql.query(sql, [zip, city, district], (error, results, fields) => {
            console.log(results);
            console.log(error);

            res.end();
        });

    } else {
        res.send('Please complete all of the fields!');
        res.end();
    }
});

//Add WH
app.post('/addWarehouse', (req, res) => {
    var name = req.body.WarehouseName;
    var desc_name = req.body.DescName;
    var address = req.body.Address;
    var zip = req.body.ZIP;
    var latitude = req.body.Latitude;
    var longitude = req.body.Longitude;
    var open_time = req.body.OpeningTime;
    var closing_time = req.body.ClosingTime;

    console.log(name);
    if (name && zip) {

        var sql = 'INSERT INTO magazine (nume, sub_nume, adresa, zip, latitudine, longitudine, ora_deschidere, ora_inchidere) ' +
            'VALUES (?,?,?,?,?,?,?,?)';
        dbSql.query(sql, [name, desc_name, address, zip, latitude, longitude, open_time, closing_time], (error, results, fields) => {
            console.log(results);
            console.log(error);

            res.end();
        });

    } else {
        res.send('Please complete all of the fields!');
        res.end();
    }
});


//Fetch Oldest Employees by Warehouse
app.get('/oldestEmp', (req, res) => {
    var sql='SELECT A.id, A.nume AS Name, A.prenume AS Surname, A.dataAngajarii AS HireDate, M.nume AS WHName FROM angajati A JOIN magazine M ON A.idMagazin = M.id ' +
        'WHERE A.dataAngajarii > ALL (SELECT A1.dataAngajarii FROM angajati A1 WHERE A1.idMagazin = A.idMagazin AND A1.id != A.id) AND A.idMagazin IS NOT NULL';
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

//Fetch Top Producers by Category
app.get('/topProducers', (req, res) => {
    let sql = `SELECT P.id, P.nume AS Name, P.categorie AS Category, COUNT(Prod.id) AS NrProducts FROM producatori P JOIN produse Prod ON P.id = Prod.idProducator
WHERE (SELECT COUNT(Prod1.id) FROM produse Prod1 WHERE P.id = Prod1.idProducator) > ALL (SELECT COUNT(Prod2.id) FROM produse Prod2 JOIN producatori P2 ON P2.id = Prod2.idProducator WHERE P.id != Prod2.idProducator AND P2.categorie = P.categorie)
GROUP BY P.categorie`;
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

app.get('/topProducersByCategory/:category', (req, res) => {
    let sql = `SELECT P.id, P.nume AS Name, P.categorie AS Category, COUNT(Prod.id) AS NrProducts FROM producatori P JOIN produse Prod ON P.id = Prod.idProducator
WHERE (SELECT COUNT(Prod1.id) FROM produse Prod1 WHERE P.id = Prod1.idProducator) > ALL (SELECT COUNT(Prod2.id) FROM produse Prod2 JOIN producatori P2 ON P2.id = Prod2.idProducator WHERE P.id != Prod2.idProducator AND P2.categorie = P.categorie)
GROUP BY P.categorie HAVING P.categorie = ?`;
    dbSql.query(sql, req.params.category, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

app.get('/topProductsByWH', (req, res) => {
    let sql = `SELECT M.nume AS WHName, P.nume AS Name, PM.cantitate*P.pret AS Price FROM Produse P JOIN produse_magazine PM ON P.id = PM.idProdus JOIN magazine M ON PM.id = M.id
WHERE PM.cantitate*P.pret >= ALL 
(SELECT PM1.cantitate*P1.pret FROM Produse P1 JOIN produse_magazine PM1 ON P1.id = PM1.idProdus JOIN magazine M1 ON PM1.id = M1.id
     WHERE M.id = M1.id)`;
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

app.get('/StockInWH', (req, res) => {
    let sql = `SELECT 100*(SELECT COUNT(*) from produse P1 JOIN produse_magazine PM1 ON PM1.idProdus = P1.id WHERE P1.status = 'InStock' AND PM1.id = M.id)/(SELECT COUNT(*) from produse P2 JOIN produse_magazine PM2 ON PM2.idProdus = P2.id WHERE PM2.id = M.id) AS Percent, M.nume AS Name FROM magazine M`;
    dbSql.query(sql, function (err, data, fields) {
        if (err) throw err;
        res.json(data);
    });
})

//Test
app.get('/view', (req, res) => {
    console.log('aici vad date de test', req.query);


    let sql = `SELECT (SELECT COUNT(*) from produse P1 JOIN produse_magazine PM1 ON PM1.idProdus = P1.id WHERE P1.status = 'InStock' AND PM1.id = M.id)/(SELECT COUNT(*) from produse P2 JOIN produse_magazine PM2 ON PM2.idProdus = P2.id JOIN magazine M2 ON M2.id = PM2.id WHERE PM2.id = M2.id) AS Procent`;
    dbSql.query(sql, (err, result) => {
        if(err){
            console.log(err)
        }else{
            console.log(result);
            //res.render(__dirname + "/home.html", {result:result});
            //res.send(result.nume);
        }
    })

});

//Test
app.get('/view/:id', (req, res) => {
    console.log('aici vad angajatii cu id', req.query);

    let id = req.params.id;

    let sql = `SELECT * FROM angajati WHERE angajati.id = ${id}`;

    dbSql.query(sql, (err, result) => {
        if(err){
            console.log(err)
        }else{
            console.log(result);
            res.send(result);
        }


    })

});


//Test zone - nu contribuie la proiect in mod direct
//Pentru referinte viitoare

app.get('/test', (req, res) => {

    console.log('aici imagine', req.query);

    let image = sharp('example.jpg')

    function addModifiers(item) {
        switch (item) {
            case "grayscale":
                image.grayscale();
                break;
            case "resize":
                image.resize(200);
                break;
        }
    }

    let modifiers = req.query.modifier.split(" ");

    modifiers.forEach( child => {
        addModifiers(child)
    });

    //modifier.forEach(item => addModifiers(item));

    // .resize(200)
    image.toFile("ex2.png")
         .then(info => res.sendFile(path.join(__dirname + '/ex2.png')));

    //res.sendFile(path.join(__dirname + 'example.jpg'));

})

app.get('/search', (req, res) => {
    console.log('aici search', req.query);

    let name = req.query.value;


    let user_with_name = db.users.filter(user => user.public.name === name);

    if (user_with_name.length !== 0) {
        console.log("User gasit si returnat.");
        res.send(user_with_name[0].public.email);
    } else {
        res.status(404).send({error: "Nu s-a gasit user-ul cu numele dat."})
    }

})

app.get('/hello/:id', (req, res) => {
    res.sendFile(path.join(__dirname + '/home.html'));
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

app.listen(8080, () =>
    console.log(`Example app listening on port ${8080}!`),
);