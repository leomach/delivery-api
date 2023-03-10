import express from 'express';
const router = express.Router();
import PedidosController from '../controllers/pedidos.controller.js'

router.post('/criarPedido', PedidosController.criarPedido)
router.put('/atualizarPedido/:id', PedidosController.atualizarPedido)
router.patch('/atualizarStatus/:id', PedidosController.atualizarStatus)
router.delete('/deletarPedido/:id', PedidosController.deletarPedido)
router.get('/consultarPedido/:id', PedidosController.consultarPedido)
router.get('/totalPorCliente/:client', PedidosController.totalPorCliente)
router.get('/totalPorProduto/:produto', PedidosController.totalPorProduto)
router.get('/listaMaisPedidos/', PedidosController.listaMaisPedidos)

router.use((err, req, res, next) => {
    logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
    res.status(400).send({ error: err.message });
});

export default router