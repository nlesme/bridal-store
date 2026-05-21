import styles from "../componentes/OrdersKpi.module.css"


function OrdersKpi({ordersKpi}) {
    return (
    <>
        <div className={styles.kpiContainer}>

                <div className={styles.kpi}>
                    <p className={styles.titleKpi}> Total Orders</p>
                    <p className={styles.explanation}>Paid, Refunded, Partially Refunded</p>
                    <p className={styles.resultKpi}>{ordersKpi.orders.totalOrders}</p>
                </div>
                
                <div className={styles.kpi}>
                    <p className={styles.titleKpi}>Orders with Pending Items</p>
                    <p className={styles.resultKpi}>{ordersKpi.orders.pendingOrders}</p>
                </div>

                <div className={styles.kpi}>
                    <p className={styles.titleKpi}>Orders with Cancellations</p>
                    <p className={styles.resultKpi}>{ordersKpi.orders.cancelledOrders}</p>
                </div>

                <div className={styles.kpi}>
                    <p className={styles.titleKpi}>Gross sales</p>
                    <p className={styles.explanation}>Paid, Refunded, Partially Refunded</p>
                    <p className={styles.resultKpi}>$ {ordersKpi.sales.grossSales}</p>
                </div>
            
                <div className={styles.kpi}>
                    <p className={styles.titleKpi}> Gross units sold</p>
                    <p className={styles.explanation}>Paid, Refunded, Partially Refunded</p>
                    <p className={styles.resultKpi}>{ordersKpi.products.grossUnitsSold}</p>
                </div>
        </div>

                <div className={styles.kpiResumePrincipal}>
                    <div className={styles.kpiResume}>
                        <p className={styles.titleKpi}> Refunds</p>
                        <p className={styles.resultKpi}>$ {ordersKpi.sales.refundedSales}</p>
                    </div>

                    <div className={styles.kpiResume}>
                        <p className={styles.titleKpi}> Net sales</p>
                        <p className={styles.resultKpi}>$ {ordersKpi.sales.netSales}</p>
                    </div>

                    
                    <div className={styles.kpiResume}>
                        <p className={styles.titleKpi}>Refunded Units</p>
                        <p className={styles.resultKpi}>{ordersKpi.products.refundedUnits}</p>
                    </div>

                    <div className={styles.kpiResume}>
                        <p className={styles.titleKpi}>Net units sold</p>
                        <p className={styles.resultKpi}>{ordersKpi.products.netUnitsSold}</p>
                    </div>
                </div>
  </>
    )}

export default OrdersKpi;