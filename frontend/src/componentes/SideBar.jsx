import styles from "./SideBar.module.css";
import { NavLink } from "react-router-dom";
function SideBar() {
    return (
        <>
          <aside className={styles.sidebar}>
           <div className={styles.brand}>
              <h2 className={styles.logo}>bs</h2>
              <div className={styles.brandText}>
                <h3 className={styles.storeName}>Bridal Store</h3>
                <p className={styles.storeDesc}>dresses & accesories</p>
              </div>
           </div>
      
            <nav className={styles.linkNav}>
              <NavLink to= '/' end
                className={({isActive}) => 
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink }> 
                  <span>▦</span>
                    Dashboard </NavLink>
            </nav>
        </aside>
        </>
          
    )
    
}

export default SideBar;