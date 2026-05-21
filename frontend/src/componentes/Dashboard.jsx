import OrdersTable from "./OrdersTable.jsx";
import TopBar from "./TopBar.jsx";
import OrdersKpi from "./OrdersKpi.jsx";
import { useEffect, useState } from "react";
import ImportButton from "./ImportButton.jsx";
import Pagination from "./Pagination.jsx";
import OrdersDetailsModal from "./OrdersDetailsModal.jsx";
import styles from "./Dashboard.module.css"
import PeriodsButtons from "./PeriodButtons.jsx";

function Dashboard() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("customer");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const [period, setPeriod] = useState("");

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [kpis, setKpis] = useState(null);
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [errorKpis, setErrorKpis] = useState(null);


  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", limit);

        if (query) {
          params.append("search", query);
          params.append("searchBy", searchBy);
        }

        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }

        if (sourceFilter !== "all") {
          params.append("source", sourceFilter);
        }

        if (period) {
          params.append("period", period);
        }

        const URL = `http://localhost:3000/orders?${params.toString()}`;
        const res = await fetch(URL);

        if (!res.ok) {
          setError(`Request is failed ${res.status}`);
          setOrders([]);
          return;
        } 
        
        const data = await res.json();
        setOrders(data.data ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        
      } catch {
        setError(`Network error, please try again`);
        setTotal(0);
        setTotalPages(1);
        setOrders([]);
      } finally{
        setLoading(false);
      }
    }
    fetchOrders()
  }, [query, page, limit, searchBy, statusFilter, sourceFilter, reloadKey, period]);


  useEffect(() => {
    async function fetchKpis() {
      setLoadingKpis(true);
      setErrorKpis(null);

      try {
        const params = new URLSearchParams();

        if (query) {
          params.append("search", query);
          params.append("searchBy",searchBy);
        }

        if (sourceFilter !== "all") {
          params.append("source", sourceFilter);
        }

        if (period) {
          params.append("period", period);
        }

        // if(statusFilter !== "all") {
        //   params.append("statusFilter", statusFilter);
        // }

        const URL = `http://localhost:3000/orders/kpis?${params.toString()}`;
        const res = await fetch(URL);

        if (!res.ok) {
          setErrorKpis(`Request is failed ${res.status}`);
          setKpis(null);
          return;
        }
        const data = await res.json();
        setKpis(data);
      } catch {
        setErrorKpis(`Network error, please try again`);
        setKpis(null);
      } finally {
        setLoadingKpis(false)
      }
    }
    fetchKpis();
  }, [query, searchBy, sourceFilter, reloadKey, period]);

  function handleSubmit(e) {
    e.preventDefault();
    setPage(1);
    setQuery(inputValue.trim().toLowerCase());
  }

  function handleInput(e) {
    setInputValue(e.target.value);
  }

  function handleSearchBy(e) {
    setPage(1);
    setSearchBy(e.target.value);
  }

  function handleFilterStatus(e) {
    setPage(1);
    setStatusFilter(e.target.value);
    
  }

  function handleFilterSource(e) {
    setPage(1);
    setSourceFilter(e.target.value);
  }

  function handleImportCsv() {
    setPage(1);
    setReloadKey(prev => prev +1);
  }

 function handleOpenDetails(orderId) {
    setSelectedOrderId(orderId);
    setDetailOpen(true);
  } 

  function handleCloseDetails() {
    setSelectedOrderId(null);
    setDetailOpen(false);
  }

 return (
  <>
  <div className={styles.contentTop}>
    <TopBar 
        handleSubmit = {handleSubmit}
        valueInput = {inputValue}
        handleInput = {handleInput}
        valueSearch = {searchBy}
        onHandleSearchBy = {handleSearchBy}
        />
      <PeriodsButtons 
        period = {period}
        onChangePeriod = {setPeriod}
        />
    </div>

    <div className={styles.header}>
      <h2 className={styles.titleDesc}>general summary</h2>
      <h1 className={styles.title}>{period === "month" ? "Month Summary" : 
                                      period === "semester" ? "Semester Summary":
                                      period === "quarter" ? "Quarter Summary":
                                      period === "annual" ? "Annual Summary":
                                      "General Summary"
                                    }</h1>
      </div>
  
  {loadingKpis && <p>Loading Kpis</p>}
  {errorKpis && <p>{errorKpis}</p>}
  {kpis && <OrdersKpi ordersKpi = {kpis}/>}
  
  <ImportButton onImportSuccess = {handleImportCsv}/>

  {loading === true ?  <p>Loading orders...</p> :
    error !==null ? <p>{error}</p>:
    query !== '' && orders.length === 0 ? <p>No results for "{query}"</p> :
    <OrdersTable 
      orders = {orders}
      onHandleStatusFilter = {handleFilterStatus}
      onHandleSourceFilter = {handleFilterSource}
      valueStatus = {statusFilter}
      valueSource= {sourceFilter}
      onViewDetails = {handleOpenDetails}
   />
    }
  
  {!loading && !error && totalPages > 1 && (
    <Pagination 
    page = {page}
    totalPages = {totalPages}
    total = {total}
    onPrev = {() => setPage((prev) => Math.max(prev -1, 1))}
    onNext = {() => setPage((prev) => Math.min(prev+1, totalPages))}/>
  )}
   
  {detailOpen && selectedOrderId && (
    <OrdersDetailsModal 
      isOpen = {detailOpen}
      orderId = {selectedOrderId}
      onClose = {handleCloseDetails}
      />
  )}
  </>
 )
}

export default Dashboard;
