const mongooose = require('mongoose')

const app = require('./app')

const {DB_HOST}=require("./config")

mongooose.set('strictQuery',true);

mongooose.connect(DB_HOST)
    .then(()=>{
        app.listen(3000)
    })
    .catch(error=>{
        console.log(error.message)
        process.exit(1)
    })

