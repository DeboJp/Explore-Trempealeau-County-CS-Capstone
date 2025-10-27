import AsyncStorage from "@react-native-async-storage/async-storage";
import locations from "../assets/ts/locations";

// Key under which saved item IDs are stored persistently
const KEY = "trempealeau/savedIds:v1";

// Load saved IDs from AsyncStorage → return as a Set for quick lookups
async function getSet() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? new Set(JSON.parse(raw)) : new Set();
}

// Save the current Set of IDs back to AsyncStorage
async function putSet(s) {
  await AsyncStorage.setItem(KEY, JSON.stringify([...s]));
}

// Check if a specific location ID is already saved
export async function isSaved(id) {
  const s = await getSet();
  return s.has(id);
}

// Toggle a location’s saved state (add if not saved, remove if saved)
export async function toggleSaved(id) {
  const s = await getSet();
  s.has(id) ? s.delete(id) : s.add(id);
  await putSet(s);
  return s.has(id); // returns the new saved state (true/false)
}

// Return the list of full location objects that are currently saved
export async function getSavedItems() {
  const s = await getSet();
  return locations.filter(loc => s.has(loc.id));
}
