import React from 'react'
import { View, ScrollView, Text, Button, TouchableOpacity } from 'react-native'
import CategoryTile from '../components/CategoryTile';
import LocationTile from '../components/LocationTile';
import SearchBar from '../components/SearchBar';
import locations from '../assets/ts/locations';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function ExploreScreen() {
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 5;

  const [suggestions, setSuggestions] = useState<typeof locations>([]);

  // derive unique cities from dataset
  const cities = Array.from(new Set(locations.map(l => (l.city || '').trim()).filter(Boolean)));

  // basic Levenshtein distance for small fuzzy matching
  const levenshtein = (a: string, b: string) => {
    const pa = a.toLowerCase(), pb = b.toLowerCase();
    const m = pa.length, n = pb.length;
    const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = pa[i - 1] === pb[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      }
    }
    return d[m][n];
  };

  const fuzzyMatch = (source: string, query: string) => {
    if (!query) return false;
    const s = source.toLowerCase();
    const q = query.toLowerCase();
    if (s.includes(q)) return true;
    if (s.startsWith(q)) return true;
    // allow small typos (distance threshold relative to length)
    const dist = levenshtein(s, q);
    return dist <= Math.max(1, Math.floor(q.length * 0.25));
  }

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setPage(1);

    if (text.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    // location name matches
    const locMatches = locations.filter(loc =>
      fuzzyMatch(loc.name || '', text) ||
      fuzzyMatch(loc.city || '', text) ||
      (loc.activityTags || []).some((t: string) => fuzzyMatch(t, text)) ||
      fuzzyMatch(loc.type || '', text)
    );

    // categories that match the query (using types and some tags)
    const categories = Array.from(new Set(locations.map(l => l.type).filter(Boolean)));
    const categoryMatches = categories.filter(c => fuzzyMatch(c, text)).slice(0, 5);

    // cities that match
    const cityMatches = cities.filter(c => fuzzyMatch(c, text)).slice(0, 5);

    const combined: any[] = [];
    locMatches.slice(0, 5).forEach(l => combined.push({ kind: 'location', item: l }));
    categoryMatches.forEach(c => combined.push({ kind: 'category', item: c }));
    cityMatches.forEach(c => combined.push({ kind: 'city', item: c }));

    setSuggestions(combined.slice(0, 8));
  };


  const getPaginatedLocations = () => {
    const filtered = locations.filter(loc =>
      loc.parent_location_id === null &&
      loc.type !== "Lodging" &&
      loc.type !== "Business" &&
      loc.name.toLowerCase().includes(searchText.toLowerCase())
    );
    return filtered.slice(0, page * itemsPerPage);
  };

  const paginatedLocations = getPaginatedLocations();

  const handleLoadMore = () => {
    if (paginatedLocations.length < locations.length) {
      setPage(prev => prev + 1);
    }
  }

  return <ScrollView contentContainerStyle={{ padding: 16 }}>
    <View style={{ display: 'flex', alignItems: 'center' }}>
      <SearchBar
        placeholder="Search for trails, parks, and more"
        value={searchText}
        onChangeText={handleSearchChange}
        onSubmit={() => {
          (navigation as any).navigate("Results", {
            results: locations.filter(loc =>
              fuzzyMatch(loc.name || '', searchText) ||
              fuzzyMatch(loc.city || '', searchText) ||
              (loc.activityTags || []).some((t: string) => fuzzyMatch(t, searchText)) ||
              fuzzyMatch(loc.type || '', searchText)
            ),
            title: `Results for "${searchText}"`
          });
          setSuggestions([]);
        }}
      />

      {suggestions.length > 0 && (
        <View style={{
          width: '80%',
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc',
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          marginTop: -8,
          zIndex: 10
        }}>
          {suggestions.map((s: any, idx: number) => {
            if (s.kind === 'location') {
              const loc = s.item;
              return (
                <Text key={`loc-${loc.id}-${idx}`} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {
                  (navigation as any).navigate('Results', { results: [loc], title: loc.name });
                  setSearchText(loc.name);
                  setSuggestions([]);
                }}>{loc.name}</Text>
              );
            }
            if (s.kind === 'category') {
              const cat = s.item;
              return (
                <Text key={`cat-${cat}-${idx}`} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {
                  (navigation as any).navigate('Results', { results: locations.filter(l => l.type === cat || (l.activityTags || []).includes(cat)), title: cat });
                  setSearchText(cat);
                  setSuggestions([]);
                }}>{`Category: ${cat}`}</Text>
              );
            }
            if (s.kind === 'city') {
              const city = s.item;
              return (
                <Text key={`city-${city}-${idx}`} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => {
                  (navigation as any).navigate('Results', { results: locations.filter(l => (l.city || '').toLowerCase() === city.toLowerCase()), title: city });
                  setSearchText(city);
                  setSuggestions([]);
                }}>{`City: ${city}`}</Text>
              );
            }
            return null;
          })}
        </View>
      )}



    </View>
    <Text style={{ textAlign: "left", fontSize: 24, marginBottom: 8, paddingTop: 16, paddingBottom: 8, fontWeight: 500 }}>Categories</Text>
    <View style={{ display: 'flex', alignItems: 'center' }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }} horizontal={true}>
        <CategoryTile title="Hiking" icon="hiking" onPress={() => { (navigation as any).navigate('Results', { results: locations.filter(loc => loc.type === 'Hike' || (loc.activityTags || []).includes('Hiking') || loc.type === 'Park'), title: 'Hiking' }) }} />
        <CategoryTile title="Biking" icon="biking" onPress={() => { (navigation as any).navigate('Results', { results: locations.filter(loc => loc.type === 'Bike' || (loc.activityTags || []).includes('Biking')), title: 'Biking' }) }} />
        <CategoryTile title="Water" icon="water" onPress={() => { (navigation as any).navigate('Results', { results: locations.filter(loc => loc.type === 'Water' || (loc.activityTags || []).includes('Boating') || (loc.activityTags || []).includes('Fishing')), title: 'Water Access' }) }} />
        <CategoryTile title="Shop" icon="business" onPress={() => { (navigation as any).navigate('Results', { results: locations.filter(loc => loc.type === 'Business' || loc.type === 'Shop'), title: 'Shops' }) }} />
      </ScrollView>
    </View>

    <Text style={{ textAlign: "left", fontSize: 24, marginTop: 16, marginBottom: 8 }}>Cities</Text>
    <View style={{ display: 'flex', alignItems: 'center' }}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }} horizontal={true}>
        {cities.slice(0, 8).map((c) => (
          <TouchableOpacity key={`city-tile-${c}`} onPress={() => (navigation as any).navigate('Results', { results: locations.filter(l => (l.city || '').toLowerCase() === (c || '').toLowerCase()), title: c })}>
            <CategoryTile title={c} icon="location" onPress={() => (navigation as any).navigate('Results', { results: locations.filter(l => (l.city || '').toLowerCase() === (c || '').toLowerCase()), title: c })} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>

    <Text style={{ textAlign: "left", fontSize: 24, marginBottom: 16 }}>Featured</Text>
    <ScrollView contentContainerStyle={{ alignItems: 'center' }} horizontal={true}>
          {paginatedLocations.map((loc) => (
        <LocationTile
          key={loc.id}
          locationId={loc.id}
          title={loc.name}
          category={loc.type}
          subtitle={loc.city}
          description={loc.description}
              backgroundImg={loc.image || ''}
              onPress={() => { (navigation as any).navigate('Details', { locationId: loc.id }) }}
        />
      ))}
    </ScrollView>

    {paginatedLocations.length < locations.length && (
      <Button title="Load More" onPress={handleLoadMore} />
    )}

  </ScrollView>
}