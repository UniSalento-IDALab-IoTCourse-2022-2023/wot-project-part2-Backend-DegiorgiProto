const express = require("express")

const {WebSocketServer, WebSocket} = require("ws");
const wss = new WebSocket.Server({ port : 8000});

const mongoClient = require("mongodb").MongoClient
const url = "mongodb://localhost:27017"

const app = express()

app.listen(3000, () => console.log("Server ready"))

let dbUsed;
let utenti;
let veritySense;
let polarH10;
let pression;
let diabetes;

let doctors;
let exercises;
let notifications;

const today = new Date();
const options = { year: 'numeric', month: 'numeric', day: 'numeric' };

//connessione socket
wss.on('connection', (ws) => {
    console.log("Connessione stabilita");

    //arriva il messaggio dal client
    ws.on('message', (messaggio) => {
        console.log("Messaggio ricevuto:", messaggio.toString())
        let mess = messaggio.toString()
        ws.send(mess)
    });

    ws.on('close', () => {
        console.log('Connessione chiusa');
    });
});

//connessione
mongoClient.connect(url).then(mongoClient => {
    console.log("Connection done");
    dbUsed = mongoClient.db("mydb")
    if(dbUsed !== undefined) {
        //c'è la connessione
        isConnected = true;
        //riferimento alla collection
        utenti= dbUsed.collection("Utente");
        veritySense= dbUsed.collection("Verity");
        polarH10= dbUsed.collection("Polar H10")
        pression= dbUsed.collection("Pressione");
        diabetes= dbUsed.collection("Diabete");
        doctors = dbUsed.collection("Dottore");
        exercises = dbUsed.collection("Esercizi")
        notifications = dbUsed.collection("Notifica")
    }
}).catch(err => {
    console.log("Connection error");
    console.log(err);
});

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

//post utente
app.post("/aggiungiUtente", (req, res) => {
    utenti.insertOne(
        {
            name: req.body.name,
            surname: req.body.surname,
            emailAddress: req.body.emailAddress,
            password: req.body.password,
            doctor: req.body.doctor
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getall utenti
app.get("/lista", async (req, res) => {
    var results = [];
    const cursor = utenti.find({}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({ utenti: results })
})

//getByEmail
app.get("/elemento", async (req, res) => {
    const email_address = req.query.email_address;
    const cursor = utenti.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        console.log("Getting done");
        return res.status(200).json({utenti: doc})
    }
    return res.status(200).json({utenti: {"email":"no email"}})
})

// app.get("/elemento_test", async (req, res) => {
//     const data = req.query.data;
//     console.log("get done!", data);
//     res.status(200).json({})
// })

// app.get("/elemento_test", async (req, res) => {
//     const cursor = utenti.find({emailAddress: req.body.emailAddress}, {});
//     console.log(req.body)
//     if(cursor.hasNext()){
//         for await (const doc of cursor) {
//             console.log("Getting done");
//             res.status(200).json({utenti: doc})
//         }
//     } else {
//         res.status(200).json({})// app.get("/elemento_test", async (req, res) => {
//     const cursor = utenti.find({emailAddress: req.body.emailAddress}, {});
//     console.log(req.body)
//     if(cursor.hasNext()){
//         for await (const doc of cursor) {
//             console.log("Getting done");
//             res.status(200).json({utenti: doc})
//         }
//     } else {
//         res.status(200).json({})
//     }
//
// })


//getByDoctor
app.get("/pazienti", async (req, res) => {
    var results = [];
    const dottore = req.query.doctor;
    const cursor = utenti.find({doctor: dottore}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({utenti: results})
})

//deletebyEmail
app.delete("/cancella", (req, res) => {
    utenti.deleteOne({emailAddress: req.body.emailAddress}, {});
    return res.status(200).json({ok: true})
})

//relativo alla collection verity sense
//post verity sense
app.post("/aggiungiVS", (req, res) => {
    veritySense.insertOne(
        {
            heartRate: req.body.heartRate,
            ecg: req.body.ecg,
            acc: req.body.acc,
            gyro: req.body.gyro,
            magnet: req.body.magnet,
            ppg1: req.body.ppg1,
            ppg2: req.body.ppg2,
            ppg3: req.body.ppg3,
            ppi: req.body.ppi,
            emailAddress: req.body.emailAddress,
            date: today.toLocaleDateString('it-IT', options).replace(/ /g, '-'),
            hour: new Date().toLocaleTimeString().toString()
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getall hr
app.get("/allVS", async (req, res) => {
    var results = [];
    const cursor = veritySense.find({}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({ veritySense: results })
})

//getByEmail vs
app.get("/parametriVS", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const cursor = veritySense.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({veritySense: results})
})

//getByEmail e Giorno
app.get("/vsGrafico", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const data = req.query.date;
    const cursor = veritySense.find({emailAddress: email_address, date: data}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({veritySense: results})
})

//aggiornamento verity sense hr
// app.put("/veritySense", (req, res) => {
//     veritySense.updateOne({$and: [
//         { emailAddress: req.body.emailAddress },
//         { date: req.body.date }
//     ]},
//         {
//             $set: {
//                 heartRate: req.body.heartRate
//             },
//             $currentDate: {lastUpdated: true}
//         })
//     res.status(200).json({veritySense : results})
// })

//aggiornamento verity sense hr
app.put("/hrVS", (req, res) => {
    veritySense.updateOne({$and: [
                { emailAddress: req.body.emailAddress },
                { date: req.body.date }
            ]},
        {
            $set: {
                heartRate: req.body.heartRate
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({veritySense: results})
})

//aggiornamento verity sense ecg
app.put("/ecgVS", (req, res) => {
    veritySense.updateOne({$and: [
                { emailAddress: req.body.emailAddress },
                { date: req.body.date }
            ]},
        {
            $set: {
                ecg: req.body.ecg
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({veritySense: results})
})

//aggiornamento verity sense acc
app.put("/accVS", (req, res) => {
    veritySense.updateOne({$and: [
                { emailAddress: req.body.emailAddress },
                { date: req.body.date }
            ]},
        {
            $set: {
                acc: req.body.acc
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({veritySense: results})
})

//aggiornamento verity sense gyro
app.put("/gyroVS", (req, res) => {
    veritySense.updateOne({$and: [
                { emailAddress: req.body.emailAddress },
                { date: req.body.date }
            ]},
        {
            $set: {
                gyro: req.body.gyro
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({veritySense: results})
})

//aggiornamento verity sense magn
app.put("/magnVS", (req, res) => {
    veritySense.updateOne({$and: [
                { emailAddress: req.body.emailAddress },
                { date: req.body.date }
            ]},
        {
            $set: {
                magnet: req.body.magnet
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({veritySense: results})
})

//aggiornamento verity sense ppg
app.put("/ppgVS", (req, res) => {
    veritySense.updateOne({$and: [
                { emailAddress: req.body.emailAddress },
                { date: req.body.date }
            ]},
        {
            $set: {
                ppg: req.body.ppg
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({veritySense: results})
})

//aggiornamento verity sense ppi
app.put("/ppiVS", (req, res) => {
    veritySense.updateOne({$and: [
                { emailAddress: req.body.emailAddress },
                { date: req.body.date }
            ]},
        {
            $set: {
                ppi: req.body.ppi
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({veritySense: results})
})

//relativo alla collection polar H10
//post polar h10
app.post("/aggiungiH10", (req, res) => {
    polarH10.insertOne(
        {
            heartRate: req.body.heartRate,
            ecg : req.body.ecg,
            emailAddress: req.body.emailAddress,
            date: today.toLocaleDateString('it-IT', options).replace(/ /g, '-'),
            hour: new Date().toLocaleTimeString().toString()
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getall h10
app.get("/allH10", async (req, res) => {
    var results = [];
    const cursor = polarH10.find({}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({ polarH10: results })
})

//getByEmail h10
app.get("/parametriH10", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const cursor = polarH10.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({polarH10: results})
})

//getByEmail e Giorno
app.get("/h10Grafico", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const data = req.query.date;
    const cursor = polarH10.find({emailAddress: email_address, date: data}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({polarH10: results})
})

//aggiornamento parametri H10
app.put("/polarH10", (req, res) => {
    polarH10.updateOne({emailAddress: req.body.emailAddress},
        {
            $set: {
                heartRate: req.body.heartRate
            },
            $currentDate: {lastUpdated: true}
        })
    return res.status(200).json({polarH10: results})
})

//relativo alla collection pressione
//post pressione
app.post("/aggiungiPres", (req, res) => {
    pression.insertOne(
        {
            valuemax: req.body.valuemax,
            valuemin: req.body.valuemin,
            day: req.body.day,
            hour: req.body.hour,
            emailAddress: req.body.emailAddress,
            date: new Date().toDateString() + " " + new Date().toLocaleTimeString().toString()
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getall pression
app.get("/allPres", async (req, res) => {
    var results = [];
    const cursor = pression.find({}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({ pression: results })
})

//getByEmail pression
app.get("/parametriPres", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const cursor = pression.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({pression: results})
})

//getByEmail e Giorno
app.get("/presGrafico", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const data = req.query.date;
    const cursor = pression.find({emailAddress: email_address, day: data}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({pression: results})
})

//relativo alla collection diabete
//post diabete
app.post("/aggiungiDiab", (req, res) => {
    diabetes.insertOne(
        {
            value: req.body.value,
            day: req.body.day,
            hour: req.body.hour,
            emailAddress: req.body.emailAddress,
            date: new Date().toDateString() + " " + new Date().toLocaleTimeString().toString()
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getall diabete
app.get("/allDiab", async (req, res) => {
    var results = [];
    const cursor = diabetes.find({}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({ diabetes: results })
})

//getByEmail diabete
app.get("/parametriDiab", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const cursor = diabetes.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({diabetes: results})
})

//getByEmail e Giorno
app.get("/diabGrafico", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const data = req.query.date;
    const cursor = diabetes.find({emailAddress: email_address, day: data}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({diabetes: results})
})

//relativa alla collection esercizi
//post
app.post("/aggiungiEsercizio", (req, res) => {
    exercises.insertOne(
        {
            esercizio: req.body.esercizio,
            durata: req.body.durata,
            inizio: req.body.inizio,
            emailAddress: req.body.emailAddress
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getall esercizi
app.get("/allexe", async (req, res) => {
    var results = [];
    const cursor = exercises.find({}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({ exercises: results })
})

//getByEmail esercizi
app.get("/exemail", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const cursor = exercises.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({exercises: results})
})

//delete by date
app.delete("/noExe", (req, res) => {
    const email_address = req.query.email_address;
    const start = req.query.start;
    exercises.deleteOne({emailAddress: email_address, inizio: start}, {}).then(() => {
        console.log("Delete done");
        return res.status(200).json({ok: true});
    }).catch(error => {
        console.log("Error during delete:", error);
        return res.status(500).json({ok: false, error: error});
    });
})

//relativa alla collection dottore
//post utente
app.post("/aggiungiDottore", (req, res) => {
    doctors.insertOne(
        {
            name: req.body.name,
            surname: req.body.surname,
            eta : req.body.eta,
            emailAddress: req.body.emailAddress,
            password: req.body.password
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getall dottori
app.get("/dottori", async (req, res) => {
    var results = [];
    const cursor = doctors.find({}, {});
    for await (const doc of cursor) {
        results.push(doc);
    }
    return res.status(200).json({ doctors: results })
})

//getByEmail
app.get("/dottoreEmail", async (req, res) => {
    const email_address = req.query.email_address;
    const cursor = doctors.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        console.log("Getting done");
        return res.status(200).json({doctors: doc})
    }
})

//relativa alla collection notifiche
//post notifica
app.post("/aggiungiNotifica", (req, res) => {
    notifications.insertOne(
        {
            notifica: req.body.notifica,
            emailAddress: req.body.emailAddress
        }).then(() => {
        console.log("Insertion done");
        return res.status(200).json({ ok : true})
        //mongoClient.close();
    }).catch(err => {
        console.log("Insertion error");
        console.log(err);
        return res.status(500).json({ err: err })
    });
})

//getByEmail
app.get("/notificaEmail", async (req, res) => {
    var results = [];
    const email_address = req.query.email_address;
    const cursor = notifications.find({emailAddress: email_address}, {});
    for await (const doc of cursor) {
        console.log("Getting done");
        results.push(doc)
    }
    return res.status(200).json({notifiche: results})
})





