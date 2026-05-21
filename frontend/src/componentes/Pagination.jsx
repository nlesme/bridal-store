import styles from "./Pagination.module.css";

function Pagination({page, totalPages, total, onPrev, onNext}){

    return(
        <>
        <div className={styles.pagination}>
            <button 
                onClick={onPrev}
                className={styles.btnPage}
                disabled={page === 1}>
                    Prev
            </button>
            <p> Page {page} of {totalPages} | Total orders: {total}</p>
            <button 
                onClick={onNext}
                className={styles.btnPage}
                disabled={page === totalPages || totalPages === 0}>
                    Next
            </button>
        </div>
        </>
    )
}

export default Pagination;