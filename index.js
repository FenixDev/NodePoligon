const express = require('express')

const s = require('./components/super')

var app = express()

app.get('/', (req, res) => {
    res.send('MAIN')
})

app.get('/super', async (req, res) => {
    try {
        var buff = await s.readFile()
        //var list = await s.getFileList()
        //s.saveFiles(list)
        res.json(buff.toString())
    }
    catch (ex) {
        res.json(ex)
    }
})

app.listen(88)