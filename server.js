const express = require("express");
const app = express();
const port = 30070;
const cors = require("cors");
const bodyParser = require("body-parser");

//mysql
var db_config = require('./database.js');
var conn = db_config.init();
db_config.connect(conn);


//caver
const Caver = require('caver-js');
const BAOBAB_TESTNET_RPC_URL = 'https://api.baobab.klaytn.net:8651/'
const rpcURL = BAOBAB_TESTNET_RPC_URL
const caver = new Caver(rpcURL)
const feePayerAddress = "0xec0943b713403953d88b33cac0dd45aa9e146f37";
const feePayerPrivateKey = "0xa42c3e961699cfd3c02d5a68dadff9840f72b70099fd0f456c59be34f3fe7efd";

caver.klay.accounts.wallet.add(feePayerPrivateKey, feePayerAddress);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());

//거래량 api
app.post('/vRank', function (req, res) {
    var body = req.body
    var params = [body.startDate, body.endDate];
    var sql =
    `select title, epi_title, artist, count(*) as volume
    from joyvolume
    WHERE (DATE > ? AND date < ?)
    group by title, epi_title, artist
    order by volume desc;`

    conn.query('USE joyvolume')
    conn.query(sql, params, function (err, results, fields) {
        if (err) console.log('query is not excuted. select fail...\n' + err);
        else res.send(results)
    });
});

app.put("/update", (req, res) => {
    var body = req.body

    var sql = 'INSERT INTO joyvolume VALUES(?, ?, ?, ?, ?)';
    var params = [body.title, body.episode, body.author, body.dateCreated, body.date];
    conn.query('USE joyvolume')
    conn.query(sql, params, function (err) {
        if (err) console.log('query is not excuted. insert fail...\n' + err);
    });
});

//Card 관리 api
app.put("/series", (req, res) => {
    var body = req.body

    var sql = 'INSERT INTO series VALUES(?)';
    var params = [body.series];
    conn.query('USE joyvolume')
    conn.query(sql, params, function (err) {
        if (err) console.log('query is not excuted. insert fail...\n' + err);
    });
});

app.get("/getSeries", (req, res) => {
    var sql = 'SELECT series FROM joyvolume.series;';
    conn.query('USE joyvolume')

    conn.query(sql, function (err, results, fields) {
        if (err) console.log('query is not excuted. select fail...\n' + err);
        else res.send(results)
    });
});



//대납 api
app.post("/", (req, res) => {
    const senderRawTransaction = req.body.rawTransaction;

    caver.klay.sendTransaction({
        senderRawTransaction: senderRawTransaction,
        feePayer: feePayerAddress,
    })
        .on('receipt', function (receipt) {
            res.send({ transactionHash: receipt.transactionHash });
        })
        .on('error', console.error); // If an out-of-gas error, the second parameter is the receipt.
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
