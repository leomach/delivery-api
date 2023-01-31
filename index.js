import express from 'express';
import winston from 'winston';
global.fileName = "pedidos.json";
import PedidosRouter from './routes/pedidos.routes.js'
import { promises as fs } from 'fs';
const { readFile, writeFile } = fs;

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
global.logger = winston.createLogger({
    level: 'silly',
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'delivery-api.log' })
    ],
    format: combine(
        label({ label: 'delivery-api' }),
        timestamp(),
        myFormat
    )
})

const app = express();
app.use(express.json());

app.use("/pedidos", PedidosRouter)

app.listen(3000, async () => {
    try {
        await readFile(global.fileName)
        logger.info('listening on 3000');
    } catch (err) {
            logger.error(err)
    }
})