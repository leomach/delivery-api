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

const consultarPedido = async (req, res, next) => {
    let idParams = req.params.id
    try {
        const data = JSON.parse(await readFile(global.fileName));
        if (!data.pedidos[idParams] - 1) {
            throw new Error("Registro não encontrado")
        }
        let pedido = data.pedidos.filter(a => a.id === parseInt(idParams))
        res.send(pedido)
        logger.info(`GET /pedidos/consultarPedido/:id - ${JSON.stringify(idParams)}`)
    } catch (err) {
        next(err);
    }
}

const totalPorCliente = async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        
        if (req.params.client === "") {
            res.sendStatus(400)
            throw new Error("Coloque o nome do cliente")
        }
    
        let ordersClientTotal = data.pedidos.filter((item) => {
          if ((item.cliente != undefined && item.cliente) && (item.entregue == true)){
            return item.cliente.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g,"").toLowerCase().includes(req.params.client.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g,"").toLowerCase())
          }
        }).reduce((a,b) => a + b.valor, 0)
    
        console.log(ordersClientTotal);
        ordersClientTotal = {cliente: req.params.client, total: ordersClientTotal}
        
        res.status(200).send(ordersClientTotal)
        logger.info(`GET /orders/total/:client - ${req.params.client}`)
    } catch (err) {
        next(err);
    }
}

const totalPorProduto = async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));

        if (req.params.produto === "") {
          res.sendStatus(400)
          throw new Error("Coloque o nome do produto")
        }
    
        let ordersProdutoTotal = data.pedidos.filter((item) => {
          if ((item.produto != undefined && item.produto) && (item.entregue == true)){
            return item.produto.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g,"").toLowerCase().includes(req.params.produto.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/ /g,"").toLowerCase())
          }
        }).reduce((a,b) => a + b.valor, 0)
    
        console.log(ordersProdutoTotal);
        ordersProdutoTotal = {produto: req.params.produto, total: ordersProdutoTotal}
        
        res.status(200).send(ordersProdutoTotal)
        logger.info(`GET /orders/total/:produto - ${req.params.produto}`)
    } catch (err) {
        next(err);
    }
}

const listaMaisPedidos = async (req, res, next) => {
    const data = JSON.parse(await readFile(global.fileName));
    try {
        let product = []

        data.pedidos.forEach(element => {
          if(element.entregue === true){
            product.push(element.produto);
          }
        });
        
        const occurrences = product.reduce((acc, curr)=>{
          return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
        }, [])
    
    
        let most = []
        for (const key in occurrences) {
          most.push({produto: key, qtd: occurrences[key]})
        }
    
        most = most.sort((a,b) => {
          return a.qtd < b.qtd ? 1 : -1
        })
    
        res.status(200).send(most);
    } catch (err) {
        next(err);
    }
}

export default {
    criarPedido,
    atualizarPedido,
    atualizarStatus,
    deletarPedido,
    consultarPedido,
    totalPorCliente,
    totalPorProduto,
    listaMaisPedidos
}