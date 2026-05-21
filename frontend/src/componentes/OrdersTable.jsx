import Pagination from "./Pagination";
import styles from "../componentes/OrdersTable.module.css";

function OrdersTable({orders, onHandleStatusFilter, onHandleSourceFilter, valueStatus, valueSource, onViewDetails}) {
    return (
        <div className={styles.containerTable}>
        
        <div className={styles.headerTable}>
            <div className={styles.headerTitle}>
                <h3>Orders Management</h3>
            </div>
        
        <div className={styles.filterTable}>
            <select 
                value={valueStatus}
                onChange={onHandleStatusFilter}
                className={styles.filters}>
                <option value="all">All status</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIALLY_PENDING">Partially pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_REFUNDED">Partially refunded</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PARTIALLY_CANCELLED">Partially cancelled</option>
            </select>

            <select 
                value={valueSource}
                onChange={onHandleSourceFilter}
                className={styles.filters}>
                <option value="all">All sources</option>
                <option value="ONLINE">Online</option>
                <option value="PARTY">Party</option>
            </select>
            </div>
        </div>
        
        <div className={styles.table}>
        <table>
            <thead className={styles.tableHead}>
                <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
            </thead>

            <tbody className={styles.tableBody}>
                {orders.map(order => (
                    <tr key={order.id}>
                        <td className={styles.sourceOrderId}># {order.sourceOrderId}</td>
                        <td>{order.customerName}</td>
                        <td className={styles.source}>{order.source}</td>
                        <td className={order.status === "PAID" ? styles.orderPaid : order.status === "PENDING" ? styles.orderPending : order.status === "CANCELLED" ? styles.orderCancelled : styles.orderRefund}>{order.status}</td>
                        <td>$ {order.total}</td>
                        <td>{order.soldAt}</td>
                        <td>
                            <button onClick={()=> onViewDetails(order.id)} className={styles.btnDetails}>View details</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        
        </table>
        </div>

        <div>
            
        </div>
        </div>
        

    )
}

export default OrdersTable;