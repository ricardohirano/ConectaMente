const express = require("express");
const app = express();
app.set('view engine', 'ejs');


app.get("/", function(req, res){
    res.render("index");
});

const porta = 8080;
app.listen(porta,function(erro){
    if(erro){
        console.log("Ocorreu um erro!");
    } else {
        console.log(`Servidor iciado com sucesso pagina http://localhost:${porta} `)
    }
})