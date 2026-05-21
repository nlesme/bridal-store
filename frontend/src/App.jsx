
import styles from "./App.module.css";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./componentes/Dashboard";
import SideBar from "./componentes/SideBar";

function App() {
 

 return (
  <>
  <div className={styles.appLayout}>
    <SideBar />
    <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Dashboard />}></Route>
        </Routes>
      </main>
  </div>
  
  </>
 )
}

export default App;
