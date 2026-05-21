import styles from "../componentes/TopBar.module.css";
import { FiSearch } from "react-icons/fi";


function TopBar({handleSubmit, handleInput, valueInput, valueSearch, onHandleSearchBy}) {
    return (
        <div >
            <form 
                onSubmit={handleSubmit}
                className={styles.containerForm}>
            <div className={styles.inputBox}>
            <span className={styles.searchIcon}><FiSearch /></span>
            <input 
                    className={styles.input}
                    value={valueInput}
                    name = "search"
                    id="search"
                    type="text" 
                    aria-label="Search order, customers..."
                    placeholder="Search order, customers..." 
                    onChange={handleInput}/>
            </div>
                

                <select 
                    value={valueSearch}
                    onChange={onHandleSearchBy}
                    className={styles.optionsFilter}>
                        <option value="customer">Customer</option>
                        <option value="orderNumber">Order Number</option>
                </select>
            </form>
        </div>
    )
}

export default TopBar;