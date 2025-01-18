const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    leverl: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({stack: true}),
        format.json(),
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log'}),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple(),
    }));
}

module.exports = logger;