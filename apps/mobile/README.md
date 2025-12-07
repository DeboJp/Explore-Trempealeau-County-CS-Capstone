# Mobile App

To run this app simply run these lines in your terminal/command prompt:
```
npm install
npm start
```

There should be a QR code that shows up in your terminal, which you can scan to take you to the app (you will need to have Expo Go installed on your phone to do this).

This is the folder structure and what each file does:

mobile/
├── assets/ - Icons used inside the app.
├── components/ - Folder that contains various components of the app.
    ├── BottomUpModal.tsx - Makes a modal for search bar results.
    ├── CategoryTile.tsx - Tile to show list of categories to filter by.
    ├── LocationTile.tsx - Tile to show list of locations, used in ExploreScreen.
    ├── SavedCards.tsx - Saved cards functionality.
    ├── SavedFolder.tsx - Makes folder for every saved location.
    ├── SearchBar.tsx - Search bar component, used to search through the app.
    ├── TileTag.tsx - Tags that can be attached to group locations together.
├── lib/
    ├── geojson/ - Folder that contains data on various trails, all saved in JSON format.
    ├── markers.json - Example markers used for testing.
    ├── savedStore.js - Script to save locations in the app.
    ├── searchLocIndex.json - Store of location coordinates.
├── pages/ - Folder with the various pages included in the app.
    ├── DetailScreen.tsx - Shows the basic details of a location.
    ├── ExploreScreen.tsx - Default landing page, shows a list of locations the user can explore.
    ├── MapScreen.tsx - Shows an interactible map of the Trempealeau area.
    ├── ProfileScreen.tsx
    ├── ResultsScreen.tsx - Shows all the results of a search.
    ├── SavedScreen.tsx - Shows all trails saved by a user.
├── .gitignore - List of files not pushed to git when updating the app.
├── app.json - JSON file that stores properties of the app.
├── App.tsx - Main app file, stores the main template and routing of the app.
├── package-lock.json - List of packages for the app.
├── package.json - List of dependencies for the app.
└── README.md - The file you are in right now!

Every folder and file not included here is something generated when running/installing the dependencies for this app.

For next steps, go to the master README at the very top of the folder hierarchy.