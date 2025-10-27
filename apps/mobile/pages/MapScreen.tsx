import React, { useMemo, useState, useCallback, useRef } from "react";
import { View, Text, Image, Pressable, StyleSheet, Linking, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import markersSeed from "../lib/markers.json";

// Travel modes we support for deep-links:
type Mode = "walking" | "driving" | "bicycling";

// shape for a marker item. 
type MarkerItem = {
  id: string;
  title?: string;
  lat: number;
  lng: number;
  icon?: string;     // e.g., "library.png" (must exist in ICONS)
  iconUrl?: string;  // remote URL
};

// ---- Local icon registry -----------
// Map known icon names in your JSON to actual bundled images.
// Add more as needed (e.g., "park.png": require("../assets/pins/park.png"))
const ICONS: Record<string, any> = {
  "library.png": require("../assets/favicon.png"),
};

// ---- Deep-link routing --------
// Opens a route using Google Maps if possible. On iOS, we first try the
// comgooglemaps:// scheme (app). If not available, we fall back to Google
// universal URL (opens the app if installed, else browser). Finally, for iOS,
// we try Apple Maps. This is *free* (no Directions API billing).
async function openRoute(
  points: { lat: number; lng: number }[],
  mode: Mode,
  loop: boolean
) {
  if (points.length < 2) return;

  // Start is the first selected point; destination is either last or start (loop)
  const start = points[0];
  const dest = loop ? start : points[points.length - 1];

  // Waypoints are all middle points (Google supports up to ~25 total incl. start/end)
  const mids = points.slice(1, loop ? points.length : points.length - 1);

  // iOS: Prefer Google Maps app via comgooglemaps://
  if (Platform.OS === "ios") {
    const scheme = "comgooglemaps://";
    if (await Linking.canOpenURL(scheme)) {
      // Build Google scheme with waypoints + mode
      const p = new URLSearchParams({
        saddr: `${start.lat},${start.lng}`,
        daddr: `${dest.lat},${dest.lng}`,
        directionsmode: mode, // "walking" | "driving" | "bicycling"
      });
      if (mids.length) p.append("waypoints", mids.map(p => `${p.lat},${p.lng}`).join("|"));

      const url = `${scheme}?${p.toString()}`;
      if (await Linking.canOpenURL(url)) return Linking.openURL(url);
    }
  }

  // Universal Google URL -> opens Google Maps app if present, otherwise browser
  {
    const base = "https://www.google.com/maps/dir/?api=1";
    const p = new URLSearchParams({
      origin: `${start.lat},${start.lng}`,
      destination: `${dest.lat},${dest.lng}`,
      travelmode: mode,
    });
    if (mids.length) p.append("waypoints", mids.map(p => `${p.lat},${p.lng}`).join("|"));

    const url = `${base}&${p.toString()}`;
    if (await Linking.canOpenURL(url)) return Linking.openURL(url);
  }

  // iOS fallback: Apple Maps (dirflg: d=driving, w=walking, b=biking-best-effort)
  if (Platform.OS === "ios") {
    const flag = mode === "driving" ? "d" : mode === "walking" ? "w" : "b";
    const apple = `maps://?saddr=${start.lat},${start.lng}&daddr=${dest.lat},${dest.lng}&dirflg=${flag}`;
    if (await Linking.canOpenURL(apple)) return Linking.openURL(apple);
  }

  // (4) Last resort: plain Google directions in browser
  return Linking.openURL(
    `https://www.google.com/maps/dir/${start.lat},${start.lng}/${dest.lat},${dest.lng}`
  );
}

// ---- Custom Pin ----
// A minimal custom pin that avoids layout growth. We call onReady on image load
// so the native marker snapshot can be frozen (see tracksViewChanges below).
function Pin({
  item,
  selected,
  onReady,
}: {
  item: MarkerItem;
  selected: boolean;
  onReady: () => void;
}) {
  const hasLocal = item.icon && ICONS[item.icon];
  if (!hasLocal && !item.iconUrl) return null;

  // Prefer bundled image if `icon` matches ICONS; otherwise remote uri
  const src = hasLocal ? ICONS[item.icon as string] : { uri: item.iconUrl! };

  return (
    <View style={{ alignItems: "center" }}>
      <Image
        source={src}
        style={{ width: 36, height: 36, borderRadius: 8 }}
        onLoad={onReady} // signal: snapshot can now be frozen (tracksViewChanges=false)
      />
      {/* Use our own label (avoid MapKit/Google callout nudging the marker) */}
      {!!item.title && <Text style={styles.pinLabel}>{item.title}</Text>}
      {/* Selection dot doesn't change layout height (small + below image) */}
      {selected && <View style={styles.dot} />}
    </View>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  // Your bottom tab is ~90 height + 10 margin → reserve ~110 + safe area.
  // This keeps floating UI above the tab bar on all devices.
  const TAB_OFFSET = 110 + insets.bottom;

  // Predefined markers (from JSON) + new user-added ones
  const [markers, setMarkers] = useState<MarkerItem[]>(
    (markersSeed as MarkerItem[]).slice()
  );

  // Path selection state: order = the order user taps markers
  const [pathIds, setPathIds] = useState<string[]>([]);

  // Travel mode + whether to return to start (close loop)
  const [mode, setMode] = useState<Mode>("walking");
  const [closeLoop, setCloseLoop] = useState(false);

  // true only until first image load (per marker), and briefly on selection change.
  const tracksRef = useRef<Record<string, boolean>>({});
  const markDirty = (id: string) => {
    tracksRef.current[id] = true; // allow one re snapshot frame
    requestAnimationFrame(() => {
      tracksRef.current[id] = false; // then freeze again
    });
  };

  // Fast iditem lookups (stable across renders as markers change)
  const byId = useMemo(() => new Map(markers.map(m => [m.id, m])), [markers]);

  // Initial map region:
  // Open on first predefined marker if exists; else fallback to SF.
  const initialRegion = useMemo(() => {
    const m0 = markers[0];
    return {
      latitude: m0?.lat ?? 37.7749,
      longitude: m0?.lng ?? -122.4194,
      latitudeDelta: 0.06,
      longitudeDelta: 0.06,
    };
  }, [markers]);

  // Long-press to drop a new marker at pressed coordinates
  const onLongPressAdd = useCallback((e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const id = `tmp-${Date.now()}`;
    setMarkers(prev => [
      ...prev,
      { id, title: `Point ${prev.length + 1}`, lat: latitude, lng: longitude },
    ]);
    tracksRef.current[id] = true; // new custom pin (if any) gets one snapshot
  }, []);

  // Toggle a marker in/out of the current path, preserving order
  const togglePath = useCallback((id: string) => {
    setPathIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    markDirty(id);
  }, []);

  // Coordinates for drawing the in-app path (straight segments)
  const lineCoords = useMemo(() => {
    const base = pathIds
      .map(id => byId.get(id))
      .filter(Boolean)
      .map(m => ({ latitude: (m as MarkerItem).lat, longitude: (m as MarkerItem).lng }));
    return closeLoop && base.length >= 2 ? [...base, base[0]] : base;
  }, [pathIds, byId, closeLoop]);

  // Coords for deep-link (lat/lng only, in selected order)
  const selectedPts = useMemo(
    () =>
      pathIds
        .map(id => byId.get(id))
        .filter(Boolean)
        .map(m => ({ lat: (m as MarkerItem).lat, lng: (m as MarkerItem).lng })),
    [pathIds, byId]
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Core map. Default provider = Apple Maps (iOS), Google Maps (Android). */}
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass
        onLongPress={onLongPressAdd}
      >
        {markers.map(m => {
          const selected = pathIds.includes(m.id);
          const hasCustom = !!(m.icon || m.iconUrl);

          // For custom pins start as true until first img load calls onReady
          if (tracksRef.current[m.id] === undefined) tracksRef.current[m.id] = !!hasCustom;

          return (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              // Avoid using native title (native callout can nudge/auto-focus).
              onPress={() => togglePath(m.id)}
              // If no custom view, we use native pin color to indicate selection.
              pinColor={hasCustom ? undefined : selected ? "#2563eb" : "#ef4444"}
              // Critical: keep true only briefly to snapshot updated custom view.
              tracksViewChanges={tracksRef.current[m.id]}
              // Stable visual anchor: bottom center, so label/dot won’t shift the pin.
              anchor={{ x: 0.5, y: 1 }}
              calloutAnchor={{ x: 0.5, y: 0 }}
              centerOffset={{ x: 0, y: -18 }} // slight upward nudge for custom content
            >
              {hasCustom ? (
                <Pin
                  item={m}
                  selected={selected}
                  onReady={() => (tracksRef.current[m.id] = false)} // freeze after first paint
                />
              ) : null}
            </Marker>
          );
        })}

        {/* In-app path (straight segments) */}
        {lineCoords.length >= 2 && (
          <Polyline coordinates={lineCoords} strokeWidth={5} strokeColor="#2563eb" />
        )}
      </MapView>

      {/* Basic toogle options (mode switch, loop toggle, clear, counter) */}
      <View style={[styles.topBar, { top: -40 + insets.top }]}>
        <View style={styles.switch}>
          {(["walking", "driving", "bicycling"] as Mode[]).map(m => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={[styles.swBtn, mode === m && styles.swBtnActive]}
            >
              <Text style={[styles.swTxt, mode === m && styles.swTxtActive]}>
                {m === "walking" ? "Walk" : m === "driving" ? "Drive" : "Bike"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          style={[styles.chip, closeLoop && styles.chipActive]}
          onPress={() => setCloseLoop(v => !v)}
        >
          <Text style={[styles.chipTxt, closeLoop && styles.chipTxtActive]}>Close loop</Text>
        </Pressable>

        <Pressable style={styles.chip} onPress={() => setPathIds([])}>
          <Text style={styles.chipTxt}>Clear</Text>
        </Pressable>

        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{pathIds.length}</Text>
        </View>
      </View>

      {/* Hint text — placed above the bottom CTA and tab bar */}
      <View style={[styles.hintCard, { bottom: TAB_OFFSET + 26 }]}>
        <Text style={styles.hintText}>
          Long-press to add new markers. Tap in order. Toggle “Close loop” to return to start.
        </Text>
      </View>

      {/* Bottom CTA — sits above your tab bar using TAB_OFFSET */}
      <View style={[styles.bottomBar, { bottom: TAB_OFFSET - 30}]}>
        <Pressable
          style={[styles.cta, selectedPts.length < 2 && styles.ctaDisabled]}
          onPress={() => openRoute(selectedPts, mode, closeLoop)}
          disabled={selectedPts.length < 2}
        >
          <Text style={styles.ctaTxt}>
            Open in Google Maps
            {selectedPts.length >= 2 ? ` (${selectedPts.length}${closeLoop ? " • loop" : ""})` : ""}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 6,
};

const styles = StyleSheet.create({
  topBar: {
    position: "absolute",
    left: 12,
    right: 12,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    ...shadow,
  },
  switch: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  swBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  swBtnActive: { backgroundColor: "white" },
  swTxt: { color: "#475569", fontWeight: "600" },
  swTxtActive: { color: "#111827" },

  chip: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipTxt: { color: "#111827", fontWeight: "600" },
  chipTxtActive: { color: "white" },

  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTxt: { color: "white", fontWeight: "700" },

  // Hint card; sits above the CTA and well above the tab bar
  hintCard: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    ...shadow,
  },
  hintText: { color: "#334155", textAlign: "center" },

  bottomBar: { position: "absolute", left: 12, right: 12 },
  cta: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    ...shadow,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaTxt: { color: "white", fontWeight: "700" },

  pinLabel: {
    marginTop: 4,
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "white",
    borderRadius: 6,
    ...shadow,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginTop: 4,
  },
});
