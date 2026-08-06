import { Router } from 'express';
import { placeOrder, getOrderStatus, updateOrderStatus, getAllOrders, deleteOrder } from '../controllers/orderController';

const router = Router();

router.post('/', placeOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderStatus);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
