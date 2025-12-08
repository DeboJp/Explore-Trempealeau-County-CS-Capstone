// scripts/testNearbyPages.ts

import { fetchNearbyPagesForGisId } from "../fetchNearbyPages";

const TEST_GIS_ID = "{4A683797-8126-4001-A401-21B99FB46FE3}"; // center GIS ID

async function main() {
  console.log("Center GIS ID:", TEST_GIS_ID);

  const result = await fetchNearbyPagesForGisId(TEST_GIS_ID, 5, 3);
  // result: { [gisId]: page }

  const keys = Object.keys(result);
  console.log("Matched pages count:", keys.length);

  for (const gisId of keys) {
    const page = result[gisId];
    console.log("----");
    console.log("gisId:", gisId);
    console.log("title:", page.title);
    console.log("city:", page.city);
    console.log("type:", page.type);
  }

  console.log("Raw object:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Error in testNearbyPages:", err);
  process.exit(1);
});

// to test API for grabbing one page from just one GIS ID if exists is, notice the %7B and %7D are { and }:
// curl -X GET \
//   "http://localhost:8000/api/v1/pages/exists?gis_id=%7B05A6B2A8-1EE1-4905-875B-D2116FC63F0D%7D"

// {"gisID":"{05A6B2A8-1EE1-4905-875B-D2116FC63F0D}","exists":true,"page":{"type":"park","id":13,"city":"osseo","pageContent":"{\"title\": \"Osseo Golf And Rec Center\", \"gisId\": \"{05A6B2A8-1EE1-4905-875B-D2116FC63F0D}\", \"type\": \"park\"}","gisId":"{05A6B2A8-1EE1-4905-875B-D2116FC63F0D}","title":"Osseo Golf And Rec Center"}}%                                                                      
// run with: 
// npx ts-node --compiler-options '{"module":"CommonJS"}' lib/scriptsForTesting/testNearbyPages.ts

// Example output:
// {
//   "{DD0D23A9-B65A-47E7-80F5-74E90EAC2E5C}": {
//     "city": null,
//     "id": 21,
//     "pageContent": "{\"title\": \"Great River Trail\", \"gisId\": \"{DD0D23A9-B65A-47E7-80F5-74E90EAC2E5C}\", \"type\": \"trail\"}",
//     "gisId": "{DD0D23A9-B65A-47E7-80F5-74E90EAC2E5C}",
//     "type": "trail",
//     "title": "Great River Trail"
//   },
//   "{82231107-5770-49C8-B7CD-6123A72A8712}": {
//     "type": "park",
//     "gisId": "{82231107-5770-49C8-B7CD-6123A72A8712}",
//     "pageContent": "{\"title\": \"Trempealeau Recreation Park\", \"gisId\": \"{82231107-5770-49C8-B7CD-6123A72A8712}\", \"type\": \"park\"}",
//     "id": 38,
//     "city": "trempealeau",
//     "title": "Trempealeau Recreation Park"
//   },
//   "{179C5E9D-7181-46E1-8865-5D43F96FA241}": {
//     "gisId": "{179C5E9D-7181-46E1-8865-5D43F96FA241}",
//     "title": "Trempealeau Sportsman Club/Duck Pond",
//     "city": "trempealeau",
//     "id": 26,
//     "pageContent": "{\"title\": \"Trempealeau Sportsman Club/Duck Pond\", \"gisId\": \"{179C5E9D-7181-46E1-8865-5D43F96FA241}\", \"type\": \"park\"}",
//     "type": "park"
//   }
// }