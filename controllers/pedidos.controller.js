import { promises as fs } from 'fs';
const { readFile, writeFile } = fs;

const criarPedido = async (req, res, next) => {
    let pedido = req.body
    if (!pedido.cliente || !pedido.produto || pedido.valor == null) {
        throw new Error("Cliente, produto e valor são obrigatórios")
    }
    const data = JSON.parse(await readFile(global.fileName));
    try {
        pedido = {
            id: data.nextId++,
            cliente: pedido.cliente,
            produto: pedido.produto,
            valor: pedido.valor,
            entregue: false,
            timestamp: new Date()
        }
        data.pedidos.push(pedido)
    
        await writeFile(global.fileName, JSON.stringify(data, null, 2));
        res.send(pedido)
        logger.info(`POST /pedidos/criarPedido - ${JSON.stringify(pedido)}`)
    } catch (err) {
        next(err);
    }
}

const atualizarPedido = async (req, res, next) => {
    let idParams = req.params.id
    let pedido = req.body
    if (idParams == null || !pedido.cliente || !pedido.produto || pedido.valor == null || pedido.entregue == null) {
        throw new Error("Id, cliente, produto, valor e entregue são obrigatórios")
    }
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const index = data.pedidos.findIndex(a => a.id === parseInt(idParams))
    
        if (!data.pedidos[idParams] - 1) {
            throw new Error("Registro não encontrado")
        }
    
        data.pedidos[index].cliente = pedido.cliente
        data.pedidos[index].produto = pedido.produto
        data.pedidos[index].valor = pedido.valor
        data.pedidos[index].entregue = pedido.entregue
        await writeFile(global.fileName, JSON.stringify(data, null, 2));
        res.send(data.pedidos[index])
        logger.info(`PUT /pedidos/atualizarPedido - ${JSON.stringify(pedido)}`)
    } catch (err) {
        next(err);
    }
}

const atualizarStatus = async (req, res, next) => {
    let idParams = req.params.id
    let pedido = req.body
    if (idParams == null || pedido.entregue == null) {
        throw new Error("Id e entregue são obrigatórios")
    }
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const index = data.pedidos.findIndex(a => a.id === parseInt(idParams))
        if (!data.pedidos[idParams] - 1) {
            throw new Error("Registro não encontrado")
        }
    
        data.pedidos[index].entregue = pedido.entregue
        await writeFile(global.fileName, JSON.stringify(data, null, 2));
        res.send(data.pedidos[index])
        logger.info(`PATCH /pedidos/atualizarStatus - ${JSON.stringify(pedido)}`)
    } catch (err) {
        next(err);
    }
}

const deletarPedido = async (req, res, next) => {
    let idParams = req.params.id
    try {
        const data = JSON.parse(await readFile(global.fileName));
        if (!data.pedidos[idParams] - 1) {
            throw new Error("Registro não encontrado")
        }
        data.pedidos = data.pedidos.filter(a => a.id !== parseInt(idParams))
        await writeFile(global.fileName, JSON.stringify(data, null, 2));
        res.end()
        logger.info(`DELETE /pedidos/deletarPedido/:id - ${JSON.stringify(idParams)}`)
    } catch (err) {
        next(err);
    }
}

export default {
    criarPedido,
    atualizarPedido,
    atualizarStatus,
    deletarPedido
}