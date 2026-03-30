
function ClearDataSection() {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [backupDone, setBackupDone] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const BILLING_KEYS = [
    "hotelCheckIns",
    "hotelBanquetBills",
    "hotelRestaurantBills",
    "hotelRoomFoodOrders",
    "kdm_room_invoices",
    "kdm_room_food_orders",
    "kdm_restaurant_bills",
    "kdm_restaurant_room_bills",
    "kdm_banquet_bills",
    "kdm_banquet_bookings",
    "kdm_kot_orders",
    "kdm_kitchen_orders",
    "kdm_booking_reservations",
    "kdm_reservations",
    "kdm_customer_profiles",
    "kdm_customers",
    "kdm_past_guests",
    "kdm_guest_history",
    "kdm_accounts",
    "kdm_night_audits",
    "kdm_reviews",
    "kdm_feedback",
    "kdm_purchase_orders",
  ];

  const handleDownloadBackup = () => {
    const backup: Record<string, any> = {};
    for (const key of BILLING_KEYS) {
      const val = localStorage.getItem(key);
      if (val !== null) backup[key] = JSON.parse(val);
    }
    for (const k of Object.keys(localStorage).filter((k) =>
      k.startsWith("kdm_folio_extras")
    )) {
      const val = localStorage.getItem(k);
      if (val !== null) backup[k] = JSON.parse(val);
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    a.href = url;
    a.download = `kdm_backup_${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupDone(true);
    toast.success("Backup downloaded successfully!");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    setImportSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data !== "object" || Array.isArray(data)) {
          setImportError("Invalid backup file format.");
          return;
        }
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, JSON.stringify(value));
          count++;
        }
        setImportSuccess(`Backup restored successfully! (${count} data groups loaded)`);
        toast.success("Backup restored! Refresh the page to see all data.");
      } catch {
        setImportError("Failed to parse backup file. Please use a valid KDM backup JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearAll = () => {
    for (const key of BILLING_KEYS) {
      localStorage.removeItem(key);
    }
    for (const k of Object.keys(localStorage).filter((k) =>
      k.startsWith("kdm_folio_extras")
    )) {
      localStorage.removeItem(k);
    }
    setDone(true);
    setConfirmed(false);
    setBackupDone(false);
    toast.success("All billing data cleared. Starting fresh!");
  };

  return (
    <div style={{ padding: "24px" }}>
      <SectionTitle title="Clear All Data" />

      {/* BACKUP SECTION */}
      <div
        style={{
          background: "#f0fdf4",
          border: "2px solid #16a34a",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#15803d", fontWeight: "700", margin: "0 0 6px", fontSize: "16px" }}>
          📦 Step 1: Create Backup Before Clearing
        </h4>
        <p style={{ color: "#166534", margin: "0 0 14px", fontSize: "14px" }}>
          Download a full backup of all billing data (invoices, check-ins, KOTs, guests, banquet bills, etc.) before clearing. You can restore this data anytime using the Import section below.
        </p>
        <button
          type="button"
          onClick={handleDownloadBackup}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ⬇️ Download Backup (.json)
        </button>
        {backupDone && (
          <span style={{ marginLeft: "16px", color: "#15803d", fontWeight: "600", fontSize: "14px" }}>
            ✅ Backup saved!
          </span>
        )}
      </div>

      {/* IMPORT / RESTORE SECTION */}
      <div
        style={{
          background: "#eff6ff",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#1d4ed8", fontWeight: "700", margin: "0 0 6px", fontSize: "16px" }}>
          📂 Import from Backup (Restore Data)
        </h4>
        <p style={{ color: "#1e40af", margin: "0 0 14px", fontSize: "14px" }}>
          Select a previously downloaded KDM backup JSON file to restore all billing data. Existing data will be overwritten.
        </p>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          ⬆️ Select Backup File
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            style={{ display: "none" }}
          />
        </label>
        {importSuccess && (
          <div style={{ marginTop: "12px", color: "#15803d", fontWeight: "600", fontSize: "14px", background: "#dcfce7", padding: "10px 16px", borderRadius: "8px" }}>
            ✅ {importSuccess}
          </div>
        )}
        {importError && (
          <div style={{ marginTop: "12px", color: "#dc2626", fontWeight: "600", fontSize: "14px", background: "#fef2f2", padding: "10px 16px", borderRadius: "8px" }}>
            ❌ {importError}
          </div>
        )}
      </div>

      {/* CLEAR SECTION */}
      {done ? (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #16a34a",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <h3 style={{ color: "#15803d", fontSize: "20px", fontWeight: "700", margin: "0 0 8px" }}>
            All Data Cleared Successfully
          </h3>
          <p style={{ color: "#166534", margin: "0 0 16px" }}>
            All invoices, KOTs, guest records, and billing history have been wiped. You can now start fresh billing.
          </p>
          <button
            type="button"
            data-ocid="clear-data.confirm_button"
            onClick={() => setDone(false)}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            OK, Got It
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "#fef2f2",
            border: "2px solid #fca5a5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h4 style={{ color: "#dc2626", fontWeight: "700", margin: "0 0 8px", fontSize: "16px" }}>
            🗑️ Step 2: Clear All Billing Data
          </h4>
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <p style={{ color: "#7f1d1d", margin: "0 0 8px", fontSize: "14px", fontWeight: "600" }}>
              ⚠️ Warning: This action is irreversible. The following data will be permanently deleted:
            </p>
            <ul style={{ color: "#7f1d1d", fontSize: "14px", margin: "0", paddingLeft: "20px" }}>
              <li>All Room Check-Ins &amp; Invoices</li>
              <li>All Restaurant Bills &amp; KOT Orders</li>
              <li>All Room Food Orders</li>
              <li>All Banquet Bills &amp; Bookings</li>
              <li>All Guest Records &amp; Customer Profiles</li>
              <li>All Night Audit Records</li>
              <li>All Purchase Orders &amp; Accounts</li>
              <li>Guest History &amp; Folio Data</li>
            </ul>
            <p style={{ color: "#dc2626", fontWeight: "600", margin: "12px 0 0 0", fontSize: "14px" }}>
              Hotel settings, room list, menu items, staff, and configuration will NOT be affected.
            </p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                background: "#fffbeb",
                border: "1px solid #fcd34d",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <input
                data-ocid="clear-data.checkbox"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ marginTop: "2px", width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ color: "#92400e", fontWeight: "600", fontSize: "15px" }}>
                I understand this will permanently delete all billing and guest data. This cannot be undone.
              </span>
            </label>
          </div>
          <button
            type="button"
            data-ocid="clear-data.delete_button"
            onClick={handleClearAll}
            disabled={!confirmed}
            style={{
              background: confirmed ? "#dc2626" : "#9ca3af",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px 32px",
              cursor: confirmed ? "pointer" : "not-allowed",
              fontWeight: "700",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            🗑️ Clear All Billing Data &amp; Start Fresh
          </button>
        </div>
      )}
    </div>
  );
}

