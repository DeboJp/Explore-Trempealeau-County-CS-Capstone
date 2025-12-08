// scripts/testNearby.ts
import { getNearbyGlobalIds, getNearbyByGlobalId } from "../nearby";

const TEST_GLOBAL_ID = "{4A683797-8126-4001-A401-21B99FB46FE3}"; // pick one from your JSON

const nearby = getNearbyByGlobalId(TEST_GLOBAL_ID, 5); // 5 miles radius
console.log("Nearby count:", nearby.length);
console.log(nearby.slice(0, 20));

// run with: 
// npx ts-node --compiler-options '{"module":"CommonJS"}' lib/scriptsForTesting/testNearby.ts

// getNearbyGlobalIds() -> returns only objects with global_ids, first ID only
// Example output:
// [
//   '{DD0D23A9-B65A-47E7-80F5-74E90EAC2E5C}',
//   '{2356B5C0-8962-4706-BE3C-2B72128C8DF4}',
//   '{C9EF7108-33E4-4CE4-A1D6-311550422740}',
//   '{35BADA21-CAD1-4304-881D-B230B7A37BB0}',
//   '{272499E3-C173-41B7-A40B-731D549650EB}',...

// getNearbyByGlobalId() -> full place objects, sorted by distance
// Example output:
// [{
//     label: 'Great River Trail',
//     lat: 44.027429,
//     lon: -91.462698,
//     type: 'feature',
//     source: 'Trails',
//     ref_index: 20,
//     ref_indices: [ 20 ],
//     bbox: [ -91.549857, 43.984207, -91.375099, 44.069556 ],
//     global_ids: [ '{DD0D23A9-B65A-47E7-80F5-74E90EAC2E5C}' ]
//   },
//   {
//     label: 'West Prairie Rd',
//     lat: 44.027353,
//     lon: -91.460957,...