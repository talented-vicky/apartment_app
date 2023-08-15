const { createLogger, transports, format } = require('winston')
const { combine, timestamp, label, printf } = format

const defFormat = printf(({ level, label, message, timestamp }) => `${timestamp} [${level}] ${label} ${message}`)

// setting up logger for connectin status, time and info
const enumErrFormat = format((info) => {
    if(info instanceof Error){
        Object.assign(info, { message: info.stack })
    }
    return info;
});

const options = {
    console: {
        level: 'info',
        handleException: true,
        json: true,
        colorize: true
    }
};

const logger = createLogger({
    level: 'info',
    format: combine(
        enumErrFormat(),
        format.colorize(),
        label({ label: 'Response =>' }),
        timestamp({format: 'HH:mm:ss' }),
        defFormat
    ),
    transports: [
        new transports.Console(options.console)
    ],
    exitOnError: false
})

module.exports = { logger };