const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const cheerio = require('cheerio')
const page = require('./data/page')
const e = require('express')

const URL = 'http://prices.shufersal.co.il'

const FILE_DIR_PATH = `${path.resolve('.')}\\data`

/*
function readStreamContens(s) {
    var p = new Promise((resolve, reject) => {
        var bufRes = Buffer.allocUnsafe(0)

        s.on('data', chunk => {
            bufRes = Buffer.concat([bufRes, chunk])
        })

        s.on('end', () => {
            resolve(bufRes)
        })

        s.on('error', (err) => {
            reject(err)
        })
    })
}
*/

async function getFileList() {
    var linkList = []

    var cont = await page.getPageContents(URL).then(buff => buff.toString())

    var docRoot = cheerio.load(cont)
    var tab = docRoot('#gridContainer')
    var trs = tab.find('tr.webgrid-row-style, tr.webgrid-alternating-row')

    trs.each(function () {
        var elm = docRoot(this)
        var a = elm.find('a')
        linkList.push(a.attr('href'))
    })

    return linkList
}

async function saveFiles(filesList) {
    for (let link of filesList) {
        let fileName = path.basename(link)
        let fPath = `${FILE_DIR_PATH}\\${fileName}`
        let filePath = fPath.split('?')[0]

        let fileCont = await page.execRequest(link)
        fs.writeFileSync(filePath, fileCont)
    }
}


async function readFile(fileName) {
    var res = '';

    if (fileName) {
        var dirInfo = fs.readdirSync(FILE_DIR_PATH)
        var fileName = dirInfo[0]
        var filePath = `${FILE_DIR_PATH}\\${fileName}`

        var fileCont = fs.readFileSync(filePath)
        var unZipBuffer = zlib.unzipSync(fileCont)

        var xml = cheerio.load(unZipBuffer, {
            xmlMode: true
        })

        var items = xml('Items').find('Item')

        var item = items.eq(0)

        var PriceUpdateDate = item.find('PriceUpdateDate')

        res = PriceUpdateDate.html()
    }

    return res
}


module.exports = {
    getFileList,
    saveFiles,
    readFile
}