import React, { useEffect, useState, useRef } from "react";
import {StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, 
  Platform, Modal, TouchableWithoutFeedback, Animated, Dimensions, Keyboard} from "react-native";
import MapView, { Marker, Region, Polyline } from "react-native-maps";
import markersData from "../lib/markers.json";
import places from "../lib/searchLocIndex.json";

// Base URL for your routing backend - ignore this, this is my local wifi IP port forwarding lol
const API_BASE = "http://xxx.xxx.x.xxx:8000";

// Default map camera region
const INITIAL_REGION = {
  latitude: 44.0020,
  longitude: -91.4346,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

// Bounding box to restrict map panning
const delta = 1;
const TREMP_BOUNDS = {
  minLat: 43.983886 - delta,
  maxLat: 44.597192 + delta,
  minLng: -91.614620 - delta,
  maxLng: -91.150042 + delta,
};

// Simple shared types
type Coordinate = { latitude: number; longitude: number };
type MarkerItem = {
  id: string;
  name?: string;
  title?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
};
// Entries from searchLocIndex.json
type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
};

// Static options for UI toggles
const TRANSPORT_MODES = ["Walk", "ATV", "Snowmobile"] as const;
const FILTER_OPTIONS = ["Parks", "Trail X", "Trail Y"];
const MAX_STOPS = 5;

// Polyline stroke style type definitions
type StrokeStyle = {
  strokeColor: string;
  strokeWidth: number;
  lineDashPattern?: number[];
};

// Load places data from local JSON
const PLACES: Place[] = places as unknown as Place[];

// Color + opacity tokens
const PRIMARY_BLUE = "#266AB1";
const LIGHT_BLUE = "#9EC7F0";
const OPAQUE_WHITE = "rgba(255,255,255,0.9)";
const OPAQUE_WHITE_STRONG = "rgba(255,255,255,0.95)";

// How far the layers sheet starts off-screen
const SHEET_SLIDE_DISTANCE = Dimensions.get("window").height * 0.5;

export default function MapScreen() {
  //map regions
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const mapRef = useRef<MapView | null>(null);
  // Local POI markers from JSON
  const [markers, setMarkers] = useState<MarkerItem[]>([]);
  // Raw start/end (and optional) stops placed on map via tap/marker
  const [stops, setStops] = useState<Coordinate[]>([]);
  // Route polyline from OSRM
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  // Short summary of the current route
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: string;
    durationMin: string;
  } | null>(null);

  // Map appearance + high-level mode
  const [mapType, setMapType] =
    useState<"standard" | "hybrid" | "satellite">("standard");
  const [transportMode, setTransportMode] = useState<string>("Walk");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Inputs typed into the planner (Start, [Stops], Destination)
  const [searchInputs, setSearchInputs] = useState<string[]>(["", ""]);

  //search UI state
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);

  // UI state for bottom sheet + keyboard
  const [layersVisible, setLayersVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Animated offset for layers drawer
  const sheetTranslateY = useRef(
    new Animated.Value(SHEET_SLIDE_DISTANCE)
  ).current;

  // Load marker data once from local JSON
  useEffect(() => {
    setMarkers(markersData as any);
  }, []);

  // Listen for keyboard show/hide to adjust bottom padding
  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvt, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Ensure map region stays within Trempealeau County
  const clampRegion = (region: Region): Region => {
    let { latitude, longitude, latitudeDelta, longitudeDelta } = region;

    latitude = Math.min(TREMP_BOUNDS.maxLat, Math.max(TREMP_BOUNDS.minLat, latitude));
    longitude = Math.min(TREMP_BOUNDS.maxLng, Math.max(TREMP_BOUNDS.minLng, longitude));

    return { latitude, longitude, latitudeDelta, longitudeDelta };
  };

  // Get stroke style for route polylines
  const getStrokeStyle = (): StrokeStyle => {
    switch (transportMode) {
      case "Walk":
        return {
          strokeColor: "#2c92ffff",
          strokeWidth: 4,
          lineDashPattern: [1, 6], // dash length, gap length
        };
      case "ATV":
        return {
          strokeColor: "#2c92ffff",
          strokeWidth: 5,
        };
      case "Snowmobile":
        return {
          strokeColor: "#2c92ffff",
          strokeWidth: 3,
          lineDashPattern: [10, 6], 
        };
      default:
        return { strokeColor: "#2c92ffff", strokeWidth: 4 };
    }
  };

  // Zoom/pan map to show entire route
  const fitRouteOnMap = (coords: Coordinate[]) => {
    if (!mapRef.current || !coords.length) return;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: {
        top: 80,
        right: 40,
        bottom: 350, // extra space for bottom sheet
        left: 40,
      },
      animated: true,
    });
  };


  // Call routing backend and update polyline + summary
  const fetchRoute = async (origin: Coordinate, destination: Coordinate) => {
    try {
      const res = await fetch(`${API_BASE}/route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });

      const data = await res.json();
      const coords: Coordinate[] = data.coords || [];
      setRouteCoords(coords);

      fitRouteOnMap(coords);

      if (data.distance_m != null && data.duration_s != null) {
        setRouteInfo({
          distanceKm: (data.distance_m / 1000).toFixed(2),
          durationMin: (data.duration_s / 60).toFixed(1),
        });
      } else {
        setRouteInfo(null);
      }
    } catch (err) {
      console.log("Route fetch error:", err);
      setRouteCoords([]);
      setRouteInfo(null);
    }
  };

  // Long press on map to set start/end in two steps
  const onMapLongPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const newPoint = { latitude, longitude };

    setStops((prev) => {
      if (prev.length === 0) {
        setRouteCoords([]);
        setRouteInfo(null);
        return [newPoint];
      }
      if (prev.length === 1) {
        const origin = prev[0];
        fetchRoute(origin, newPoint);
        return [origin, newPoint];
      }
      setRouteCoords([]);
      setRouteInfo(null);
      return [newPoint];
    });
  };

  // Reset all transient route/UI state
  const handleClear = () => {
    Keyboard.dismiss();
    setStops([]);
    setRouteCoords([]);
    setRouteInfo(null);
    setSearchInputs(["", ""]);
    setActiveFilters([]);
    setTransportMode("Walk");
    setSuggestions([]);
    setActiveFieldIndex(null);
  };

  // Tap on a marker to use it as start/end in same two-step pattern
  const onMarkerPress = (m: MarkerItem) => {
    const lat = m.latitude ?? m.lat;
    const lng = m.longitude ?? m.lng;
    if (lat == null || lng == null) return;

    const point = { latitude: lat, longitude: lng };

    setStops((prev) => {
      if (prev.length === 0) {
        setRouteCoords([]);
        setRouteInfo(null);
        return [point];
      }
      if (prev.length === 1) {
        const origin = prev[0];
        fetchRoute(origin, point);
        return [origin, point];
      }
      setRouteCoords([]);
      setRouteInfo(null);
      return [point];
    });
  };

  // Update a single search field (Start / Stop / Destination)
  const handleChangeSearchInput = (index: number, text: string) => {
    setSearchInputs((prev) => {
      const next = [...prev];
      next[index] = text;
      return next;
    });

    const q = text.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }

    // Simple local filter over PLACES
    const matches = PLACES.filter((p) =>
      p.name.toLowerCase().includes(q)
    ).slice(0, 20);

    setSuggestions(matches);
  };

  // Handle selecting a suggestion from the dropdown
  const handleSelectSuggestion = (fieldIndex: number, place: Place) => {
    const coord: Coordinate = { latitude: place.lat, longitude: place.lon };

    // Set text in the chosen field
    setSearchInputs((prev) => {
      const next = [...prev];
      next[fieldIndex] = place.name;
      return next;
    });

    // Clear suggestion UI
    setSuggestions([]);
    setActiveFieldIndex(null);

    setStops((prev) => {
      let next = [...prev];

      if (fieldIndex === 0) {
        if (next.length === 0) {
          next = [coord];
        } else if (next.length === 1) {
          next = [coord, next[0]];
        } else {
          next[0] = coord;
        }
      } else {
        if (next.length === 0) {
          next = [coord]; 
        } else if (next.length === 1) {
          next.push(coord); 
        } else {
          next[1] = coord; 
        }
      }

      return next;
    });

    setRouteCoords([]);
    setRouteInfo(null);
    Keyboard.dismiss();
  };


  // Insert a new "Stop" field before the Destination
  const handleAddStop = () => {
    setSearchInputs((prev) => {
      if (prev.length >= MAX_STOPS) return prev;
      const next = [...prev];
      next.splice(prev.length - 1, 0, "");
      return next;
    });
  };

  // For now, just log planner state (future hook: geocode + fetchRoute)
  const handleSearchStart = () => {
    Keyboard.dismiss();
    setSuggestions([]);
    setActiveFieldIndex(null);

    if (stops.length < 2) {
      console.log("Need at least start and destination before routing.");
      return;
    }

    const origin = stops[0];
    const destination = stops[1];

    fetchRoute(origin, destination);
  };
  // Toggle “map details” filter badges (parks, specific trails, etc.)
  const toggleFilter = (name: string) => {
    setActiveFilters((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  };

  // Open layers drawer and slide it into view
  const openLayers = () => {
    setLayersVisible(true);
    sheetTranslateY.setValue(SHEET_SLIDE_DISTANCE);
    Animated.timing(sheetTranslateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  // Close layers drawer and slide it off-screen
  const closeLayers = () => {
    Animated.timing(sheetTranslateY, {
      toValue: SHEET_SLIDE_DISTANCE,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setLayersVisible(false);
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType={mapType}
        region={mapRegion}
        onRegionChangeComplete={(r) => setMapRegion(clampRegion(r))}
        onLongPress={onMapLongPress}
      >
        {stops.map((p, idx) => (
          <Marker
            key={`stop-${idx}`}
            coordinate={p}
            title={idx === 0 ? "Start" : "End"}
            pinColor={idx === 0 ? "green" : "red"}
          />
        ))}

        {markers.map((m, i) => {
          const lat = m.latitude ?? m.lat;
          const lng = m.longitude ?? m.lng;
          if (lat == null || lng == null) return null;

          return (
            <Marker
              key={m.id ?? i}
              coordinate={{ latitude: lat, longitude: lng }}
              title={m.title || m.name}
              onPress={() => onMarkerPress(m)}
            />
          );
        })}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            {...getStrokeStyle()}
          />
        )}
      </MapView>

      <KeyboardAvoidingView
        style={styles.bottomAvoider}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View
          style={[
            styles.bottomContainer,
            { paddingBottom: keyboardVisible ? 30 : 110 },
          ]}
        >
          {/* Top bar over map */}
          <View style={styles.optionsBar}>
            <TouchableOpacity style={styles.layersButton} onPress={openLayers}>
              <Text style={styles.layersButtonText}>Layers</Text>
            </TouchableOpacity>

            <View style={styles.transportRow}>
              {TRANSPORT_MODES.map((mode) => {
                const active = transportMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.transportChip, active && styles.transportChipActive]}
                    onPress={() => setTransportMode(mode)}
                  >
                    <Text
                      style={[
                        styles.transportText,
                        active && styles.transportTextActive,
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {routeInfo && (
              <View style={styles.routeInfoPill}>
                <Text style={styles.routeInfoText}>{routeInfo.distanceKm} km</Text>
                <Text style={styles.routeInfoDot}>•</Text>
                <Text style={styles.routeInfoText}>{routeInfo.durationMin} min</Text>
              </View>
            )}
          </View>

          {/* Planner card */}
          <View style={styles.searchCard}>
            <View style={styles.searchHeaderRow}>
              <Text style={styles.searchTitle}>Plan route</Text>
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routeFieldsRow}>
              <View style={styles.fieldsColumn}>
                {searchInputs.map((value, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === searchInputs.length - 1;
                  const label = isFirst
                    ? "Start"
                    : isLast
                    ? "Destination"
                    : `Stop ${idx}`;
                  const placeholder = isFirst
                    ? "Search starting point"
                    : isLast
                    ? "Search destination"
                    : "Search stop";

                  return (
                    <View key={idx} style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>{label}</Text>
                      <TextInput
                        style={styles.searchInput}
                        placeholder={placeholder}
                        placeholderTextColor="#000000"
                        value={value}
                        onChangeText={(text) =>
                          handleChangeSearchInput(idx, text)
                        }
                        onFocus={() => {
                          setActiveFieldIndex(idx);
                          if (searchInputs[idx]?.trim()) {
                            handleChangeSearchInput(idx, searchInputs[idx]);
                          }
                        }}
                        returnKeyType="next"
                      />
                    </View>
                  );
                })}
              </View>

              {searchInputs.length < MAX_STOPS && (
                <View style={styles.addStopColumn}>
                  <TouchableOpacity
                    style={styles.addStopFab}
                    onPress={handleAddStop}
                  >
                    <Text style={styles.addStopFabText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {activeFieldIndex !== null && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.suggestionRow}
                    onPress={() => handleSelectSuggestion(activeFieldIndex, p)}
                  >
                    <Text style={styles.suggestionName}>{p.name}</Text>
                    {!!p.tags && (
                      <Text style={styles.suggestionMeta}>
                        {p.tags.amenity ||
                          p.tags.natural ||
                          p.tags.tourism ||
                          ""}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.searchFooterRow}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleSearchStart}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Layers sheet */}
      <Modal
        transparent
        visible={layersVisible}
        animationType="none"
        onRequestClose={closeLayers}
      >
        <TouchableWithoutFeedback onPress={closeLayers}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={[
                  styles.layersSheet,
                  { transform: [{ translateY: sheetTranslateY }] },
                ]}
              >
                <View style={styles.layersHeaderRow}>
                  <Text style={styles.layersTitle}>Map type</Text>
                  <TouchableOpacity onPress={closeLayers}>
                    <Text style={styles.layersCloseText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tileRow}>
                  {(["standard", "satellite", "hybrid"] as const).map((t) => {
                    const active = mapType === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.tileButton, active && styles.tileButtonActive]}
                        onPress={() => setMapType(t)}
                      >
                        <View style={styles.tileIcon}>
                          <View style={styles.tileIconInner} />
                        </View>
                        <Text style={styles.tileLabel}>
                          {t === "standard"
                            ? "Default"
                            : t === "satellite"
                            ? "Satellite"
                            : "Hybrid"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.layersSectionTitle}>Map details</Text>
                <View style={styles.tileGrid}>
                  {FILTER_OPTIONS.map((f) => {
                    const active = activeFilters.includes(f);
                    return (
                      <TouchableOpacity
                        key={f}
                        style={[
                          styles.tileButtonSmall,
                          active && styles.tileButtonActive,
                        ]}
                        onPress={() => toggleFilter(f)}
                      >
                        <View style={styles.tileIcon}>
                          <View style={styles.tileIconInner} />
                        </View>
                        <Text style={styles.tileLabelSmall}>{f}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  bottomAvoider: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomContainer: {
    paddingHorizontal: 16,
  },

  // Top options over map
  optionsBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  layersButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  layersButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  transportRow: {
    flexDirection: "row",
    marginLeft: 10,
    flexShrink: 1,
  },
  transportChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY_BLUE,
    marginRight: 8,
    backgroundColor: OPAQUE_WHITE,
  },
  transportChipActive: {
    backgroundColor: PRIMARY_BLUE,
  },
  transportText: {
    fontSize: 11,
    color: "#000000",
    fontWeight: "500",
  },
  transportTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  routeInfoPill: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY_BLUE,
    backgroundColor: LIGHT_BLUE,
  },
  routeInfoText: {
    fontSize: 11,
    color: "#000000",
    fontWeight: "600",
  },
  routeInfoDot: {
    marginHorizontal: 4,
    fontSize: 11,
    color: "#000000",
  },

  // Planner card
  searchCard: {
    backgroundColor: OPAQUE_WHITE_STRONG,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: LIGHT_BLUE,
  },
  searchHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  searchTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  clearText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000000",
  },

  routeFieldsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldsColumn: {
    flex: 1,
    marginRight: 8,
  },
  fieldBlock: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  searchInput: {
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: OPAQUE_WHITE,
    fontSize: 14,
    color: "#000000",
    borderWidth: 1,
    borderColor: LIGHT_BLUE,
  },

  addStopColumn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addStopFab: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: "center",
    alignItems: "center",
  },
  addStopFabText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },

  searchFooterRow: {
    marginTop: 12,
    alignItems: "center",
  },
  startButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PRIMARY_BLUE,
    alignSelf: "center",
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  // Layers modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  layersSheet: {
    backgroundColor: "#202020",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    minHeight: "45%",
    maxHeight: "60%",
  },
  layersHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  layersTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  layersCloseText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  layersSectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  tileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tileButton: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  tileButtonSmall: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "5%",
    marginBottom: 10,
  },
  tileButtonActive: {
    borderColor: LIGHT_BLUE,
    backgroundColor: "#333333",
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  tileIconInner: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: LIGHT_BLUE,
  },
  tileLabel: {
    fontSize: 12,
    color: LIGHT_BLUE,
    textAlign: "center",
  },
  tileLabelSmall: {
    fontSize: 11,
    color: LIGHT_BLUE,
    textAlign: "center",
  },
    suggestionsContainer: {
    marginTop: 4,
    maxHeight: 160,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: LIGHT_BLUE,
    overflow: "hidden",
  },
  suggestionRow: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  suggestionMeta: {
    fontSize: 11,
    color: "#555555",
    marginTop: 2,
  },
});
