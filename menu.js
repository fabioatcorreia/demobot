const https = require('https');
const constants = require('./constants');
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

function getMonth(date) {
    const month = date.getMonth() + 1;
    return (month < 10 ? '0' : '') + month;
}

function formatDate(date) {
    return `${date.getDate()}-${getMonth(date)}-${date.getFullYear()}`;
}

function getWeek(date) {
    let currentWeekDay = date.getDay();

    let monday = new Date();
    monday.setDate(date.getDate() - currentWeekDay + 1);

    let friday = new Date()
    friday.setDate(monday.getDate() + 4);

    return {
        monday,
        friday
    };
}

function getMenuByDateInterval(startDate, endDate = startDate) {
    return new Promise((resolve, reject) => {
        const month = getMonth(startDate);
        const startDateFormatted = formatDate(startDate);
        const endDateFormatted = formatDate(endDate);

        const menuURL = constants.MENU_URL.format(startDate.getFullYear(), month, startDateFormatted, endDateFormatted);

        https.get(menuURL, (response) => {
            let chunks = [];
            let body = "";
            response.on("data", data => {
                chunks.push(data);
                body += data;
            });

            response.on('end', () => {
                let file = new Buffer.concat(chunks).toString('base64');
                let x = parsePDF(file);
                resolve(x);
            });

        }).on("error", (errorMessage) => {
            reject(errorMessage);
        });
    });
}

function parsePDF(pdfBuffer) {
    // pdfBuffer contains the file content 
    let pdfParser = new PDFParser();

    return pdfParser.parseBuffer(pdfBuffer);
}