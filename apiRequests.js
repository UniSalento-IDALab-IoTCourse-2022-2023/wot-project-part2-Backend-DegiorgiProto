const mongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

var isConnected = false;
var dbUsed = undefined;

var colls = "Utente";
var collect;

var utente1 = { name: "Mario", surname:"Rossi", emailAddress: "mariorossi@gmail.com", password: "12345"};
var domanda = {emailAddress: "mariorossi@gmail.com"};
var risultati = [];
var risultato = [];


mongoClient.connect(url).then(mongoClient => {
  console.log("Connection done");
  dbUsed = mongoClient.db("mydb")
  if(dbUsed !== undefined) {
    //c'è la connessione
    isConnected = true;
    //riferimento alla collection
    collect = dbUsed.collection(colls);

    postRequest(collect, utente1);
    findAll(collect);
    findBy(collect, domanda, {});

    //console.log(risultati);
  }
}).catch(err => {
  console.log("Connection error");
  console.log(err);
});


function postRequest(collect, utente) {
  collect.insertOne(utente).then(() => {
    console.log("Insertion done");
    //mongoClient.close();
  }).catch(err => {
    console.log("Insertion error");
    console.log(err);
  });
}

//trova della collection tutti i documenti
async function findAll(collect) {
  const cursor = collect.find({}, {});
  for await (const doc of cursor) {
    risultati.push(doc);
  }
  //console.log(risultato);
  //return risultato;
}

async function findBy(collect, query = {}, options = {}) {
  const cursor = collect.find(query, options);
  for await (const doc of cursor) {
    risultato.push(doc);
  }
  if (risultato.length === 1) {
    console.log(risultato);
    //return risultato;
  } else {
    console.log("error, too much users");
  }
}


