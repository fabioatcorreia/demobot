const https = require('https');
const constants = require('./constants');
const fs = require('fs');
const PDFParser = require('pdf2json');

module.exports = {
    getTodayMenu() {
        //'2018-01-03T03:24:00'
        let week = getWeek(new Date());
        return getMenuByDateInterval(week.monday, week.friday);
    },
    getWeekMenu() {
        return getMenuByDateInterval();
    }
}

function formatDigits(digit) {
    return (digit < 10 ? '0' : '') + digit;
}

function formatDate(date) {
    return `${formatDigits(date.getDate())}-${formatDigits(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function getWeek(date) {
    let currentWeekDay = date.getDay();

    let monday = new Date();
    monday.setDate(date.getDate() - currentWeekDay + 1);

    let friday = new Date(monday.getTime());
    friday.setDate(monday.getDate() + 4);

    return {
        monday,
        friday
    };
}

function getMenuByDateInterval(startDate, endDate = startDate) {
    return new Promise((resolve, reject) => {
        const month = formatDigits(startDate.getMonth() + 1);
        const startDateFormatted = formatDate(startDate);
        const endDateFormatted = formatDate(endDate);

        const menuURL = constants.MENU_URL.format(startDate.getFullYear(), month, startDateFormatted, endDateFormatted);

        var file = fs.createWriteStream("test.pdf");
        https.get(menuURL, (response) => {
            let chunks = [];
            let body = "";
            response.on("data", data => {
                chunks.push(data);
                body += data;
            });

            response.pipe(file);

            response.on('end', () => {
                // let file = new Buffer.concat(chunks).toString('base64');
                // let x = parsePDF(file);
                file.close(parsePDF());
                resolve();
            });

        }).on("error", (errorMessage) => {
            reject(errorMessage);
        });
    });
}

function parsePDF() {
    // pdfBuffer contains the file content 
    let pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
        getPdfText(pdfParser.getMergedTextBlocksIfNeeded())
    });

    pdfParser.loadPDF("./test.pdf");

    // return pdfParser.parseBuffer(pdfBuffer);
}

function getPdfText(pdfJson) {
    let texts = [];
    if (pdfJson && pdfJson.formImage) {
        for (const node of pdfJson.formImage.Pages) {
            texts.push.apply(texts, node.Texts.map(elem => decodeURIComponent(elem.R.reduce((text, current) => text + current.T, ''))));
        }
    }

    const pos = [];

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        if (text === 'SOPA') {
            pos.push(i - 1);
        } else if (text.startsWith('Glúten')) {
            pos.push(i);
        }
    }

    const menu = [];

    for (let index = 0; index < pos.length - 1; index++) {
        menu.push(texts.slice(pos[index], pos[index + 1]).reduce((text, current) => text + current, ''));
    }
}