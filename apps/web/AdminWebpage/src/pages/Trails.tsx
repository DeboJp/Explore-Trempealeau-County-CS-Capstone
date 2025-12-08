import React, { useMemo, useState } from "react";
import "./Trails.css";

type TabId = "geodata" | "markers" | "routing";

type GeoLoadedFile = {
  key: string; // import path
  name: string; // file name
  data: any; // parsed JSON/GeoJSON
};

type Marker = {
  id: string; // unique across all markers
  title: string;
  lat: number;
  lon: number;
  origin: "folder" | "uploaded" | "manual";
  fileName?: string; // which file it came from (for folder/uploaded)
};

type MarkerFile = {
  fileName: string;
  markers: Marker[];
};

type RoutingFile = {
  name: string;
};

type FeatureSummary = {
  id: string;
  name: string;
};

type GeoDiffState = {
  existingName: string;
  uploadedName: string;
  existingCount: number;
  uploadedCount: number;
  newProps: string[];
  missingProps: string[];
  sharedProps: string[];
  newFeatures: FeatureSummary[];
  missingFeatures: FeatureSummary[];
};

/* ---------- Load GeoData from ../data/geodata ---------- */

const geoModules = import.meta.glob("../data/geodata/*.{json,geojson}", {
  eager: true,
});

const geoFilesFromFolder: GeoLoadedFile[] = Object.entries(geoModules).map(
  ([path, mod]) => {
    const name = path.split("/").pop() || path;
    const data = (mod as any).default;
    return { key: path, name, data };
  }
);

/* ---------- Load marker files from ../data/markers ---------- */

const markerModules = import.meta.glob("../data/markers/*.json", {
  eager: true,
});

const folderMarkerFiles: MarkerFile[] = Object.entries(markerModules).map(
  ([path, mod]) => {
    const fileName = path.split("/").pop() || path;
    const raw = (mod as any).default as any[];
    const markers: Marker[] = Array.isArray(raw)
      ? raw.map((item, idx) => ({
          id: String(item.id ?? `${fileName}-${idx}`),
          title: String(item.title ?? "Untitled marker"),
          lat: Number(item.lat),
          lon: Number(item.lon),
          origin: "folder",
          fileName,
        }))
      : [];
    return { fileName, markers };
  }
);

// Flatten project markers for map selection
const folderMarkersFlat: Marker[] = folderMarkerFiles.flatMap(
  (f) => f.markers
);

// Optional: primary markers.json if present (not used yet, but fine to keep)
const primaryMarkerFile: MarkerFile | undefined = folderMarkerFiles.find(
  (f) => f.fileName === "markers.json"
);

/* ---------- Load routing files from ../data/routing (names only) ---------- */

const routingModules = import.meta.glob("../data/routing/*.pbf", {
  eager: true,
  as: "url", // treat as asset URL, not code
});

const routingFilesFromFolder: RoutingFile[] = Object.keys(routingModules).map(
  (path) => ({
    name: path.split("/").pop() || path,
  })
);

/* ---------- Map helper ---------- */

function buildOsmEmbedUrl(lat: number, lon: number): string {
  const delta = 0.01;
  const minLat = lat - delta;
  const maxLat = lat + delta;
  const minLon = lon - delta;
  const maxLon = lon + delta;
  // ✅ fixed bbox order: minLon,minLat,maxLon,maxLat
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${lat},${lon}`;
}

const MarkerMapPreview: React.FC<{ marker: Marker | null }> = ({ marker }) => {
  if (!marker) {
    return (
      <div className="marker-map empty">
        <span>Type lat/lon or click a marker to preview its location.</span>
      </div>
    );
  }

  const url = buildOsmEmbedUrl(marker.lat, marker.lon);

  return (
    <div className="marker-map">
      <div className="marker-map-header">
        <div className="marker-map-title">{marker.title}</div>
        <div className="marker-map-coords">
          {marker.lat.toFixed(5)}, {marker.lon.toFixed(5)}
        </div>
      </div>
      <iframe title="Marker preview map" src={url} loading="lazy" />
    </div>
  );
};

/* ---------- Main component ---------- */

const Trails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("geodata");

  // GeoData tab state
  const [geoUploads, setGeoUploads] = useState<File[]>([]);
  const [selectedGeoExistingKey, setSelectedGeoExistingKey] = useState<string>(
    geoFilesFromFolder[0]?.key ?? ""
  );
  const [selectedGeoLocalName, setSelectedGeoLocalName] =
    useState<string>("");

  // Markers tab state (same as your working version)
  const [uploadedMarkers, setUploadedMarkers] = useState<Marker[]>([]);
  const [manualMarkers, setManualMarkers] = useState<Marker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
    folderMarkersFlat[0]?.id ?? null
  );

  // Marker input (live preview before "Add")
  const [markerTitle, setMarkerTitle] = useState("");
  const [markerLat, setMarkerLat] = useState("");
  const [markerLon, setMarkerLon] = useState("");

  // Routing tab state
  const [routingUploads, setRoutingUploads] = useState<File | null>(null);

  // Geo diff state
  const [uploadedGeoParsed, setUploadedGeoParsed] = useState<
    Record<string, any>
  >({});
  const [geoDiff, setGeoDiff] = useState<GeoDiffState | null>(null);
  const [geoDiffError, setGeoDiffError] = useState<string>("");

  /* ---------- Derived marker values (unchanged) ---------- */

  const allMarkers: Marker[] = useMemo(
    () => [...folderMarkersFlat, ...uploadedMarkers, ...manualMarkers],
    [uploadedMarkers, manualMarkers]
  );

  const selectedMarker =
    allMarkers.find((m) => m.id === selectedMarkerId) ?? null;

  // Live "draft" marker while typing lat/lon
  const draftMarker: Marker | null = useMemo(() => {
    if (!markerLat || !markerLon) return null;
    const lat = parseFloat(markerLat);
    const lon = parseFloat(markerLon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return {
      id: "draft",
      title: markerTitle || "Draft marker",
      lat,
      lon,
      origin: "manual",
    };
  }, [markerTitle, markerLat, markerLon]);

  const markerForMap = draftMarker ?? selectedMarker;

  // Workspace markers (things you might send to backend)
  const workspaceMarkers: Marker[] = useMemo(
    () => [...uploadedMarkers, ...manualMarkers],
    [uploadedMarkers, manualMarkers]
  );

  const workspaceMarkersJson = JSON.stringify(
    workspaceMarkers.map(({ origin, fileName, ...rest }) => rest),
    null,
    2
  );

  /* ---------- Marker handlers (unchanged) ---------- */

  const handleAddManualMarker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerLat || !markerLon) return;

    const lat = parseFloat(markerLat);
    const lon = parseFloat(markerLon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    const newMarker: Marker = {
      id: `manual-${Date.now()}`,
      title: markerTitle || "Manual marker",
      lat,
      lon,
      origin: "manual",
    };

    setManualMarkers((prev) => [...prev, newMarker]);
    setSelectedMarkerId(newMarker.id);

    setMarkerTitle("");
    setMarkerLat("");
    setMarkerLon("");
  };

  // Delete only works on workspace markers (uploaded or manual)
  const handleDeleteWorkspaceMarker = (id: string) => {
    setUploadedMarkers((prev) => prev.filter((m) => m.id !== id));
    setManualMarkers((prev) => prev.filter((m) => m.id !== id));
    if (selectedMarkerId === id) {
      setSelectedMarkerId(null);
    }
  };

  const handleImportMarkers = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!Array.isArray(data)) throw new Error();

        const imported: Marker[] = data.map((item, i) => ({
          id: String(item.id ?? `uploaded-${Date.now()}-${i}`),
          title: String(item.title ?? "Imported marker"),
          lat: Number(item.lat),
          lon: Number(item.lon),
          origin: "uploaded",
          fileName: file.name,
        }));

        setUploadedMarkers(imported);
        if (imported.length > 0) {
          setSelectedMarkerId(imported[0].id);
        }
      } catch {
        alert(
          'Uploaded markers JSON must look like: [ { "id": "unique_id", "title": "...", "lat": 44.0, "lon": -91.4 }, ... ]'
        );
      }
    };
    reader.readAsText(file);
  };

  const handleSendWorkspaceMarkers = () => {
    // This is where you’d POST to FastAPI to append/update markers.json.
    console.log("Workspace markers payload:", workspaceMarkers);
    alert("Check console: workspace markers payload ready for backend.");
  };

  /* ---------- Render ---------- */

  return (
    <main className="main-content">
      <div className="trail-layout">
        <header className="trail-header">
          <div>
            <h1>Trail Editor</h1>
            <p>
              Manage GeoData layers, markers, and routing data before wiring it
              to AWS / FastAPI.
            </p>
          </div>
        </header>

        {/* Tabs */}
        <div className="trail-tabs">
          <button
            type="button"
            className={
              activeTab === "geodata" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("geodata")}
          >
            GeoData
          </button>
          <button
            type="button"
            className={
              activeTab === "markers" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("markers")}
          >
            Markers
          </button>
          <button
            type="button"
            className={
              activeTab === "routing" ? "tab-button active" : "tab-button"
            }
            onClick={() => setActiveTab("routing")}
          >
            Routing
          </button>
        </div>

        {/* GeoData tab */}
        {activeTab === "geodata" && (
          <section className="tab-panel">
            <div className="tab-columns">
              {/* Upload column */}
              <div className="card">
                <h2>Upload GeoData</h2>
                <p className="subtitle">
                  Trails, waterways, polygons from local JSON/GeoJSON. For now
                  this is front-end only.
                </p>

                <label className="file-drop">
                  <span>Drop .json / .geojson here or click to browse</span>
                  <input
                    type="file"
                    accept=".json,.geojson,application/json"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setGeoUploads(files);
                      setSelectedGeoLocalName(files[0]?.name ?? "");

                      const parsed: Record<string, any> = {};
                      files.forEach((file) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          try {
                            const json = JSON.parse(String(reader.result));
                            parsed[file.name] = json;
                            // merge into state (multi-file safe)
                            setUploadedGeoParsed((prev) => ({
                              ...prev,
                              ...parsed,
                            }));
                          } catch {
                            console.error(
                              "Failed to parse uploaded GeoJSON",
                              file.name
                            );
                          }
                        };
                        reader.readAsText(file);
                      });
                    }}
                  />
                </label>

                {geoUploads.length > 0 && (
                  <ul className="file-list">
                    {geoUploads.map((f) => (
                      <li key={f.name + f.lastModified}>
                        <span className="file-name">{f.name}</span>
                        <span className="file-size">
                          {(f.size / 1024).toFixed(1)} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() =>
                    alert("Later: send selected GeoData files to backend.")
                  }
                  disabled={geoUploads.length === 0}
                >
                  Upload Selected Files
                </button>
              </div>

              {/* Existing files + diff UI */}
              <div className="card">
                <h2>Existing GeoData (from ../data/geodata)</h2>
                <p className="subtitle">
                  Files already in the repo. Later you can swap this to list
                  from S3.
                </p>

                <div className="existing-table-wrapper">
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {geoFilesFromFolder.map((f) => (
                        <tr
                          key={f.key}
                          className={
                            selectedGeoExistingKey === f.key
                              ? "row-selected"
                              : ""
                          }
                          onClick={() => setSelectedGeoExistingKey(f.key)}
                        >
                          <td>{f.name}</td>
                          <td>FeatureCollection / JSON</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="diff-controls">
                  <div className="label small">Diff check (UI only)</div>
                  <div className="diff-selects">
                    <select
                      value={selectedGeoExistingKey}
                      onChange={(e) =>
                        setSelectedGeoExistingKey(e.target.value)
                      }
                    >
                      <option value="">Existing file</option>
                      {geoFilesFromFolder.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedGeoLocalName}
                      onChange={(e) => setSelectedGeoLocalName(e.target.value)}
                    >
                      <option value="">Uploaded file</option>
                      {geoUploads.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="secondary-btn"
                      disabled={
                        !selectedGeoExistingKey || !selectedGeoLocalName
                      }
                      onClick={() => {
                        setGeoDiffError("");
                        const existing = geoFilesFromFolder.find(
                          (f) => f.key === selectedGeoExistingKey
                        );
                        const uploaded =
                          uploadedGeoParsed[selectedGeoLocalName];

                        if (!existing || !uploaded) {
                          setGeoDiff(null);
                          setGeoDiffError(
                            "Could not load both files. Make sure the upload is parsed successfully."
                          );
                          return;
                        }

                        const existingData = existing.data;
                        const uploadedData = uploaded;

                        const asFeatures = (obj: any): any[] => {
                          if (
                            obj?.type === "FeatureCollection" &&
                            Array.isArray(obj.features)
                          ) {
                            return obj.features;
                          }
                          if (Array.isArray(obj)) return obj;
                          return [];
                        };

                        const asCount = (obj: any): number =>
                          asFeatures(obj).length;

                        const existingFeats = asFeatures(existingData);
                        const uploadedFeats = asFeatures(uploadedData);

                        const existingCount = asCount(existingData);
                        const uploadedCount = asCount(uploadedData);

                        const summarizeProps = (obj: any): string[] => {
                          const feats = asFeatures(obj);
                          if (!feats.length) return [];
                          const props = new Set<string>();
                          feats.slice(0, 200).forEach((feat: any) => {
                            if (
                              feat &&
                              typeof feat.properties === "object"
                            ) {
                              Object.keys(feat.properties).forEach((k) =>
                                props.add(k)
                              );
                            }
                          });
                          return Array.from(props).sort();
                        };

                        const existingProps = summarizeProps(existingData);
                        const uploadedProps = summarizeProps(uploadedData);

                        const newProps = uploadedProps.filter(
                          (p) => !existingProps.includes(p)
                        );
                        const missingProps = existingProps.filter(
                          (p) => !uploadedProps.includes(p)
                        );
                        const sharedProps = existingProps.filter((p) =>
                          uploadedProps.includes(p)
                        );

                        const featureId = (feat: any): string => {
                          const props = feat?.properties ?? {};
                          return String(
                            props.GlobalID ??
                              props.OBJECTID ??
                              props.Name ??
                              props.name ??
                              ""
                          );
                        };

                        const featureName = (feat: any): string => {
                          const props = feat?.properties ?? {};
                          const byName = props.Name ?? props.name;
                          if (byName) return byName;
                          if (props.OBJECTID !== undefined) {
                            return `OBJECTID=${props.OBJECTID}`;
                          }
                          return "(no name)";
                        };

                        const existingIds = new Set(
                          existingFeats.map(featureId)
                        );
                        const uploadedIds = new Set(
                          uploadedFeats.map(featureId)
                        );

                        const newFeatures: FeatureSummary[] = uploadedFeats
                          .filter((f) => {
                            const id = featureId(f);
                            return id && !existingIds.has(id);
                          })
                          .slice(0, 20)
                          .map((f) => ({
                            id: featureId(f),
                            name: featureName(f),
                          }));

                        const missingFeatures: FeatureSummary[] = existingFeats
                          .filter((f) => {
                            const id = featureId(f);
                            return id && !uploadedIds.has(id);
                          })
                          .slice(0, 20)
                          .map((f) => ({
                            id: featureId(f),
                            name: featureName(f),
                          }));

                        setGeoDiff({
                          existingName: existing.name,
                          uploadedName: selectedGeoLocalName,
                          existingCount,
                          uploadedCount,
                          newProps,
                          missingProps,
                          sharedProps,
                          newFeatures,
                          missingFeatures,
                        });
                      }}
                    >
                      Compare
                    </button>
                  </div>

                  {geoDiffError && (
                    <p
                      className="hint"
                      style={{ marginTop: 6, color: "#b3261e" }}
                    >
                      {geoDiffError}
                    </p>
                  )}

                  {geoDiff && (
                    <div className="geo-diff-panel">
                      <div className="geo-diff-meta">
                        <div>
                          <div className="label small">Existing file</div>
                          <div className="geo-diff-file">
                            {geoDiff.existingName}
                          </div>
                          <div className="geo-diff-count">
                            ~{geoDiff.existingCount} features
                          </div>
                        </div>
                        <div>
                          <div className="label small">Uploaded file</div>
                          <div className="geo-diff-file">
                            {geoDiff.uploadedName}
                          </div>
                          <div className="geo-diff-count">
                            ~{geoDiff.uploadedCount} features
                          </div>
                        </div>
                      </div>

                      <div className="geo-diff-grid">
                        <div>
                          <h4>New in uploaded</h4>
                          {geoDiff.newProps.length ? (
                            <div className="chip-list">
                              {geoDiff.newProps.map((p) => (
                                <span key={p} className="chip chip-new">
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="hint">None</p>
                          )}
                        </div>

                        <div>
                          <h4>Missing from uploaded</h4>
                          {geoDiff.missingProps.length ? (
                            <div className="chip-list">
                              {geoDiff.missingProps.map((p) => (
                                <span key={p} className="chip chip-missing">
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="hint">None</p>
                          )}
                        </div>

                        <div>
                          <h4>Shared properties</h4>
                          {geoDiff.sharedProps.length ? (
                            <div className="chip-list">
                              {geoDiff.sharedProps.map((p) => (
                                <span key={p} className="chip chip-shared">
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="hint">No overlapping properties</p>
                          )}
                        </div>
                      </div>

                      <div className="geo-diff-features">
                        <h4>Feature changes</h4>
                        <div className="geo-diff-features-columns">
                          <div>
                            <div className="label small">
                              New features in uploaded
                            </div>
                            {geoDiff.newFeatures.length ? (
                              <ul className="feature-list">
                                {geoDiff.newFeatures.map((f) => (
                                  <li key={f.id}>
                                    <strong>{f.name}</strong>
                                    <span className="feature-id">
                                      ({f.id})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="hint">None</p>
                            )}
                          </div>

                          <div>
                            <div className="label small">
                              Only in existing file
                            </div>
                            {geoDiff.missingFeatures.length ? (
                              <ul className="feature-list">
                                {geoDiff.missingFeatures.map((f) => (
                                  <li key={f.id}>
                                    <strong>{f.name}</strong>
                                    <span className="feature-id">
                                      ({f.id})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="hint">None</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="hint">
                    Backend can respond with: “93% features matched, 5 new, 2
                    removed, CRS ok”, etc.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Markers tab (same behavior you liked before) */}
        {activeTab === "markers" && (
          <section className="tab-panel">
            <div className="tab-columns markers-layout">
              {/* Left column: project markers + workspace */}
              <div className="card">
                <h2>Markers</h2>
                <p className="subtitle">
                  Project markers (from files) on the left, workspace markers
                  (uploaded/manual) on the right. Click any row to preview on
                  the map.
                </p>

                {/* Marker input (live preview) */}
                <form className="marker-form" onSubmit={handleAddManualMarker}>
                  <label>
                    <div className="label">Title</div>
                    <input
                      type="text"
                      value={markerTitle}
                      onChange={(e) => setMarkerTitle(e.target.value)}
                      placeholder="Perrot State Park Trailhead"
                    />
                  </label>

                  <div className="marker-coords">
                    <label>
                      <div className="label">Latitude</div>
                      <input
                        type="text"
                        value={markerLat}
                        onChange={(e) => setMarkerLat(e.target.value)}
                        placeholder="44.0020"
                      />
                    </label>
                    <label>
                      <div className="label">Longitude</div>
                      <input
                        type="text"
                        value={markerLon}
                        onChange={(e) => setMarkerLon(e.target.value)}
                        placeholder="-91.4346"
                      />
                    </label>
                  </div>

                  <button type="submit" className="primary-btn">
                    Add Manual Marker
                  </button>
                </form>

                {/* Two tables side-by-side: project vs workspace */}
                <div className="markers-two-columns">
                  {/* Project markers (from folder) */}
                  <div className="markers-column">
                    <div className="label small">
                      Project markers (../data/markers)
                    </div>
                    <div className="marker-list-wrapper">
                      <table className="marker-table">
                        <thead>
                          <tr>
                            <th>File</th>
                            <th>Title</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folderMarkerFiles.map((file) =>
                            file.markers.map((m) => (
                              <tr
                                key={file.fileName + ":" + m.id}
                                className={
                                  selectedMarkerId === m.id
                                    ? "row-selected"
                                    : ""
                                }
                                onClick={() => setSelectedMarkerId(m.id)}
                              >
                                <td>{file.fileName}</td>
                                <td>{m.title}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Workspace markers (uploaded + manual) */}
                  <div className="markers-column">
                    <div className="label small">
                      Workspace markers (uploaded / manual)
                    </div>

                    <div className="import-row">
                      <span className="hint">
                        Import markers JSON: [&#123; "id", "title", "lat",
                        "lon" &#125;, ...]
                      </span>
                      <label className="file-mini">
                        Choose file
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleImportMarkers}
                        />
                      </label>
                    </div>

                    <div className="marker-list-wrapper">
                      <table className="marker-table">
                        <thead>
                          <tr>
                            <th>Source</th>
                            <th>Title</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {workspaceMarkers.map((m) => (
                            <tr
                              key={m.id}
                              className={
                                selectedMarkerId === m.id ? "row-selected" : ""
                              }
                              onClick={() => setSelectedMarkerId(m.id)}
                            >
                              <td>
                                {m.origin === "uploaded" ? "Uploaded" : "Manual"}
                              </td>
                              <td>{m.title}</td>
                              <td className="marker-actions">
                                <button
                                  type="button"
                                  className="link-btn danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteWorkspaceMarker(m.id);
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                          {workspaceMarkers.length === 0 && (
                            <tr>
                              <td colSpan={3}>
                                <span className="hint">
                                  No workspace markers yet.
                                </span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="json-block">
                      <div className="label small">
                        Workspace JSON (append/update markers.json via backend)
                      </div>
                      <textarea
                        readOnly
                        rows={5}
                        className="json-preview"
                        value={workspaceMarkersJson}
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={handleSendWorkspaceMarkers}
                        disabled={workspaceMarkers.length === 0}
                      >
                        Send to backend (append)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: map preview */}
              <div className="card">
                <h2>Marker Preview</h2>
                <p className="subtitle">
                  As you type lat/lon, or click a row, the map updates.
                </p>
                <MarkerMapPreview marker={markerForMap} />
              </div>
            </div>
          </section>
        )}

        {/* Routing tab */}
        {activeTab === "routing" && (
          <section className="tab-panel">
            <div className="tab-columns">
              {/* Existing routing data */}
              <div className="card">
                <h2>Existing Routing Data</h2>
                <p className="subtitle">
                  Files in ../data/routing. Later you can swap this with S3
                  listing and OSRM status.
                </p>

                <div className="existing-table-wrapper">
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routingFilesFromFolder.map((f) => (
                        <tr key={f.name}>
                          <td>{f.name}</td>
                        </tr>
                      ))}
                      {routingFilesFromFolder.length === 0 && (
                        <tr>
                          <td>
                            <span className="hint">
                              No .osm.pbf files in ../data/routing yet.
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Upload new routing data */}
              <div className="card">
                <h2>Upload .osm.pbf</h2>
                <p className="subtitle">
                  Choose a new extract to upload; backend can rebuild OSRM.
                </p>

                <label className="file-drop small">
                  <span>
                    {routingUploads
                      ? routingUploads.name
                      : "Choose .osm.pbf file"}
                  </span>
                  <input
                    type="file"
                    accept=".pbf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setRoutingUploads(f);
                    }}
                  />
                </label>

                {routingUploads && (
                  <div className="routing-summary">
                    <div className="label">Selected file</div>
                    <div className="routing-name">
                      {routingUploads.name}
                    </div>
                    <div className="routing-meta">
                      {(routingUploads.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="primary-btn"
                  disabled={!routingUploads}
                  onClick={() =>
                    alert(
                      "Later: upload .osm.pbf to S3 and trigger OSRM rebuild."
                    )
                  }
                >
                  {routingUploads
                    ? "Upload & Rebuild Routing"
                    : "Choose file first"}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Trails;
