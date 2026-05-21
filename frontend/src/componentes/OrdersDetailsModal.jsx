import { useEffect, useState } from "react";
import styles from "./OrderDetailsModal.module.css";

function OrdersDetailsModal({isOpen, orderId, onClose}) {

    const [orderDetail, setOrderDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOrderById() {
            setError(null);
            setLoading(true);
            setOrderDetail(null);

            try{
                const url = `http://localhost:3000/orders/${orderId}`;
                const res = await fetch(url);

                if (!res.ok) {
                    setError(`Request is failed ${res.status}`);
                    return;
                }

                const data = await res.json();
                
                setOrderDetail(data.data);
                setError(null);

            } catch {
                setError(`Network Error`);
                setOrderDetail(null);
            } finally {
                setLoading(false);
            }
        }
        fetchOrderById()
    }, [orderId, isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return() => {
            document.body.style.overflow= "auto"
        }
    },[isOpen]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}

                
                {orderDetail && 
                    <div className={styles.modal}>
                        <button className={styles.btnClose} onClick={onClose}>X</button>
                        <h2 className={styles.modalTitle}>Order Information</h2>
                        <h3 className={styles.modalSubtitle}>#{orderDetail.sourceOrderId}</h3>
                        <p className={styles.modalDesc}><strong>Source:</strong> <span> {orderDetail.source}</span></p>
                        <p className={styles.modalDesc}><strong>Customer name:</strong> <span> {orderDetail.customerName}</span></p>
                        <p className={styles.modalDesc}><strong>Sold at: </strong><span> {orderDetail.soldAt}</span></p>
                        <p className={styles.modalDesc}><strong>Order status: </strong><span> {orderDetail.status}</span></p>
                        <p className={styles.modalDesc}><strong>Total order:</strong> <span>$ {orderDetail.total}</span></p>
                        <p className={styles.modalDesc}><strong>Refunded total:</strong><span>$ {orderDetail.refundedTotal}</span></p>
                        <p className={styles.modalDesc}><strong>Refunded at: </strong><span> {orderDetail.refundedAt}</span></p>

                        <h2 className={styles.modalTitle}>Items</h2>
                        <table className={styles.table}>
                            <thead className={styles.headChart}>
                            <tr>
                                <th>Product name</th>
                                <th>SKU</th>
                                <th>Qty</th>
                                <th>Unit price</th>
                                <th>Total</th>
                                <th>Item Status</th>
                            </tr>
                            </thead>
                            <tbody className={styles.bodyChart}>
                                {orderDetail.items.map(itemDetail => (
                                    <tr key={itemDetail.id}>
                                        <td>{itemDetail.productName}</td>
                                        <td>{itemDetail.sku}</td>
                                        <td>{itemDetail.quantity}</td>
                                        <td>{itemDetail.unitPrice}</td>
                                        <td>{itemDetail.lineTotal}</td>
                                        <td>{itemDetail.itemStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
        </div>
    }

  
        </div>
        </div>
    )
}

export default OrdersDetailsModal;