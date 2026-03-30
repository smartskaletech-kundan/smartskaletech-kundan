function ImageManagerSection() {
  const GOLD = "#c9a84c";

  type TabKey = "banner" | "room-category" | "room-number" | "restaurant" | "banquet";
  const [activeTab, setActiveTab] = useState<TabKey>("banner");

  const ROOM_CATEGORIES = ["Executive", "Deluxe", "Single Executive", "Standard", "Rajgirih", "Amrapali"];
  const ALL_ROOM_NUMBERS = [
    "101","102","103","104","105","106","107",
    "201","202","203","204","205","206","207","208","209","210","211","212","214",
    "401","402","403","404","405","406","407","408","409","410","411","412","414","415","416",
    "501","502","503","504","505","506","507","508","509"
  ];
  const BANQUET_HALLS = ["Vaishali Hall", "Pataliputra Hall", "Rajgriha Hall"];

  const getGroupKey = (tab: TabKey, group: string): string => {
    if (tab === "room-category") return `kdm_img_cat_${group}`;
    if (tab === "room-number") return `kdm_img_room_${group}`;
    if (tab === "restaurant") return "kdm_img_restaurant";
    if (tab === "banquet") return `kdm_img_banquet_${group}`;
    return "kdm_banner_images";
  };

  const [bannerImages, setBannerImages] = useState<ManagedImage[]>(() => {
    try { return JSON.parse(localStorage.getItem("kdm_banner_images") || "[]"); } catch { return []; }
  });

  const [groupImages, setGroupImages] = useState<Record<string, ManagedImage[]>>(() => {
    const result: Record<string, ManagedImage[]> = {};
    for (const cat of ["Executive", "Deluxe", "Single Executive", "Standard", "Rajgirih", "Amrapali"]) {
      const key = `kdm_img_cat_${cat}`;
      try { result[key] = JSON.parse(localStorage.getItem(key) || "[]"); } catch { result[key] = []; }
    }
    for (const room of ["101","102","103","104","105","106","107","201","202","203","204","205","206","207","208","209","210","211","212","214","401","402","403","404","405","406","407","408","409","410","411","412","414","415","416","501","502","503","504","505","506","507","508","509"]) {
      const key = `kdm_img_room_${room}`;
      try { result[key] = JSON.parse(localStorage.getItem(key) || "[]"); } catch { result[key] = []; }
    }
    const rk = "kdm_img_restaurant";
    try { result[rk] = JSON.parse(localStorage.getItem(rk) || "[]"); } catch { result[rk] = []; }
    for (const hall of ["Vaishali Hall", "Pataliputra Hall", "Rajgriha Hall"]) {
      const key = `kdm_img_banquet_${hall}`;
      try { result[key] = JSON.parse(localStorage.getItem(key) || "[]"); } catch { result[key] = []; }
    }
    return result;
  });

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ img: ManagedImage; storageKey: string; isBanner: boolean } | null>(null);
  const [editName, setEditName] = useState("");
  const [editCaption, setEditCaption] = useState("");

  const getGroupImgs = (key: string): ManagedImage[] => groupImages[key] || [];

  const saveGroupImgs = (key: string, imgs: ManagedImage[]) => {
    localStorage.setItem(key, JSON.stringify(imgs));
    setGroupImages((prev) => ({ ...prev, [key]: imgs }));
  };

  const handleGroupUpload = (storageKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const current = [...getGroupImgs(storageKey)];
    let loaded = 0;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        current.push({
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          url: ev.target?.result as string,
          caption: "",
          uploadedAt: new Date().toISOString(),
        });
        loaded++;
        if (loaded === files.length) {
          saveGroupImgs(storageKey, [...current]);
          toast.success(`${files.length} image(s) uploaded!`);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const current = [...bannerImages];
    let loaded = 0;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        current.push({
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          url: ev.target?.result as string,
          caption: "",
          uploadedAt: new Date().toISOString(),
        });
        loaded++;
        if (loaded === files.length) {
          localStorage.setItem("kdm_banner_images", JSON.stringify(current));
          setBannerImages([...current]);
          toast.success(`${files.length} image(s) uploaded!`);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleDelete = (storageKey: string, id: string, isBanner: boolean) => {
    if (isBanner) {
      const updated = bannerImages.filter((i) => i.id !== id);
      localStorage.setItem("kdm_banner_images", JSON.stringify(updated));
      setBannerImages(updated);
    } else {
      saveGroupImgs(storageKey, getGroupImgs(storageKey).filter((i) => i.id !== id));
    }
    toast.success("Image deleted.");
  };

  const openEdit = (storageKey: string, img: ManagedImage, isBanner: boolean) => {
    setEditModal({ img, storageKey, isBanner });
    setEditName(img.name);
    setEditCaption(img.caption);
  };

  const handleSaveEdit = () => {
    if (!editModal) return;
    if (editModal.isBanner) {
      const updated = bannerImages.map((i) =>
        i.id === editModal.img.id ? { ...i, name: editName, caption: editCaption } : i
      );
      localStorage.setItem("kdm_banner_images", JSON.stringify(updated));
      setBannerImages(updated);
    } else {
      saveGroupImgs(
        editModal.storageKey,
        getGroupImgs(editModal.storageKey).map((i) =>
          i.id === editModal.img.id ? { ...i, name: editName, caption: editCaption } : i
        )
      );
    }
    setEditModal(null);
    toast.success("Image updated!");
  };

  const imgGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  };

  const renderImageGrid = (images: ManagedImage[], storageKey: string, isBanner: boolean) => (
    images.length === 0 ? (
      <div
        style={{ textAlign: "center", padding: 24, color: "#64748b", background: "#0f172a", borderRadius: 8, fontSize: "0.82rem" }}
        data-ocid="image-manager.empty_state"
      >
        No images yet. Click "Upload Images" to add photos.
      </div>
    ) : (
      <div style={imgGridStyle}>
        {images.map((img, idx) => (
          <div
            key={img.id}
            data-ocid={`image-manager.item.${idx + 1}`}
            style={{ background: "#1e293b", borderRadius: 10, overflow: "hidden", border: "1px solid #334155" }}
          >
            <div style={{ height: 120, overflow: "hidden" }}>
              <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                {img.name || "Untitled"}
              </div>
              {img.caption && (
                <div style={{ color: "#94a3b8", fontSize: "0.7rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
                  {img.caption}
                </div>
              )}
              <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => openEdit(storageKey, img, isBanner)}
                  style={{ flex: 1, background: "#334155", color: "#cbd5e1", border: "none", borderRadius: 5, padding: "4px 6px", cursor: "pointer", fontSize: "0.72rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}
                  data-ocid={`image-manager.edit_button.${idx + 1}`}
                >
                  <Pencil size={11} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(storageKey, img.id, isBanner)}
                  style={{ flex: 1, background: "#450a0a", color: "#f87171", border: "none", borderRadius: 5, padding: "4px 6px", cursor: "pointer", fontSize: "0.72rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}
                  data-ocid={`image-manager.delete_button.${idx + 1}`}
                >
                  <Trash2 size={11} /> Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  );

  const renderUploadBtn = (storageKey: string, isBanner: boolean) => (
    <label
      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: GOLD, color: "#000", borderRadius: 7, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: "0.78rem", marginBottom: 12 }}
    >
      ⬆ Upload Images
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={isBanner ? handleBannerUpload : (e) => handleGroupUpload(storageKey, e)}
        style={{ display: "none" }}
        data-ocid="image-manager.upload_button"
      />
    </label>
  );

  const renderAccordionGroups = (groups: string[], tab: TabKey) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {groups.map((group) => {
        const key = getGroupKey(tab, group);
        const imgs = getGroupImgs(key);
        const isOpen = expandedGroup === key;
        return (
          <div
            key={key}
            style={{ background: "#1e293b", border: `1px solid ${isOpen ? GOLD : "#334155"}`, borderRadius: 10, overflow: "hidden" }}
          >
            <button
              type="button"
              onClick={() => setExpandedGroup(isOpen ? null : key)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", color: isOpen ? GOLD : "#e2e8f0" }}
              data-ocid="image-manager.toggle"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{group}</span>
                <span style={{
                  background: imgs.length > 0 ? "rgba(201,168,76,0.2)" : "#0f172a",
                  color: imgs.length > 0 ? GOLD : "#64748b",
                  borderRadius: 20,
                  padding: "2px 8px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                }}>
                  {imgs.length} photo{imgs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span style={{ fontSize: "0.8rem", display: "inline-block", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                {renderUploadBtn(key, false)}
                {renderImageGrid(imgs, key, false)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: "banner", label: "🖼 Banner" },
    { key: "room-category", label: "🏷 Room Category" },
    { key: "room-number", label: "🔢 Room Number" },
    { key: "restaurant", label: "🍽 Restaurant" },
    { key: "banquet", label: "🎉 Banquet" },
  ];

  const restaurantKey = "kdm_img_restaurant";

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: GOLD, fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, marginBottom: 20 }}>
        Image Manager
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setActiveTab(t.key); setExpandedGroup(null); }}
            data-ocid="image-manager.tab"
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: `1px solid ${activeTab === t.key ? GOLD : "#334155"}`,
              background: activeTab === t.key ? "rgba(201,168,76,0.15)" : "transparent",
              color: activeTab === t.key ? GOLD : "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.82rem",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Banner Tab */}
      {activeTab === "banner" && (
        <div>
          {renderUploadBtn("kdm_banner_images", true)}
          {renderImageGrid(bannerImages, "kdm_banner_images", true)}
        </div>
      )}

      {/* Room Category Tab */}
      {activeTab === "room-category" && renderAccordionGroups(ROOM_CATEGORIES, "room-category")}

      {/* Room Number Tab */}
      {activeTab === "room-number" && renderAccordionGroups(ALL_ROOM_NUMBERS, "room-number")}

      {/* Restaurant Tab */}
      {activeTab === "restaurant" && (
        <div>
          {renderUploadBtn(restaurantKey, false)}
          {renderImageGrid(getGroupImgs(restaurantKey), restaurantKey, false)}
        </div>
      )}

      {/* Banquet Tab */}
      {activeTab === "banquet" && renderAccordionGroups(BANQUET_HALLS, "banquet")}

      {/* Edit Modal */}
      {editModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          data-ocid="image-manager.modal"
        >
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 28, maxWidth: 400, width: "100%" }}>
            <h3 style={{ color: GOLD, margin: "0 0 20px", fontWeight: 700 }}>Edit Image Details</h3>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="editImgName" style={{ color: "#cbd5e1", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Image Name</label>
              <input
                id="editImgName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#f1f5f9", fontSize: "0.85rem" }}
                data-ocid="image-manager.input"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="editImgCaption" style={{ color: "#cbd5e1", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Caption</label>
              <input
                id="editImgCaption"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                style={{ width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", color: "#f1f5f9", fontSize: "0.85rem" }}
                data-ocid="image-manager.textarea"
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                style={{ flex: 1, background: GOLD, color: "#000", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem" }}
                data-ocid="image-manager.save_button"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                style={{ flex: 1, background: "#334155", color: "#cbd5e1", border: "none", borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                data-ocid="image-manager.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

