import { useEffect, useState } from "react";
import styles from "../componentes/ImportButton.module.css";

function ImportButton({onImportSuccess}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [importError, setImportError] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");

    function handleFileChange(e) {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
        setImportError(null);
        setSuccessMsg("");
    }

    async function handleUpload() {
        if (!selectedFile) {
            setImportError("Please select a CSV file.");
            return;
        }
        setUploading(true);
        setImportError(null);
        setSuccessMsg("");
        
        if(!selectedFile.name.toLowerCase().endsWith(".csv")) {
            setImportError("Only CSV files are allowed.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch(`http://localhost:3000/imports`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setImportError(data.message || `Import failed: ${res.status}`)
                return;
            }

            setSuccessMsg(data?.message || "Import successful.");
            setSelectedFile(null);

            if (onImportSuccess) {
                onImportSuccess();
            }
        } catch {
            setImportError("Network error, please try again.");
        } finally {
            setUploading(false);
        }
    }

    useEffect (() => {
        if (!successMsg && !importError) return;
            const timer = setTimeout(() => {
                setSuccessMsg("");
                setImportError(null);
            }, 3000);
            return () => clearTimeout(timer);
    }, [successMsg, importError]);


    return (
        <div className={styles.importContainer}>
            <input 
                   id="csvFile"
                   type="file"
                   accept=".csv"
                   onChange={handleFileChange}
                   className={styles.hiddenInput} />

            <label htmlFor="csvFile" className={styles.selectBtn}>
                Choose CSV
            </label>

            <span className={styles.fileName}>
                {selectedFile ? selectedFile.name : "No file selected."}
            </span>
            <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className={styles.importButton}>
                    {uploading ? "Uploading..." : "Import Report"}
            </button>

            
            {importError  && <p className={styles.error}>{importError}</p>}
            {successMsg && <p className={styles.success}>{successMsg}</p>}
        </div>
    );
}

export default ImportButton;