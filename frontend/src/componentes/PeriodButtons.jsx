import styles from "./PeriodsButtons.module.css";


function PeriodsButtons({period, onChangePeriod}) {
    

    return (
        <div className={styles.periodButtons}>
            <button className={styles.btn} 
                    type="button"
                    onClick={() => onChangePeriod("month")}
                    disabled={period === "month"}>
                        Month
            </button>
            <button className={styles.btn} 
                    type="button"
                    onClick={() => onChangePeriod("quarter")}
                    disabled ={period === "quarter"}>
                        Quarter
            </button>
            <button className={styles.btn} 
                    type="button"
                    onClick={() => onChangePeriod("semester")}
                    disabled={period === "semester"}>
                        Semester
            </button>
            <button className={styles.btn} 
                    type="button"
                    onClick={() => onChangePeriod("annual")}
                    disabled={period === "annual"}>
                        Annual
            </button>
            <button className={styles.btn} 
                    type="button"
                    onClick={() => onChangePeriod("")}
                    disabled={period === ""}>
                        All
            </button>
        </div>
    )
}

export default PeriodsButtons;