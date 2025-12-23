# Explore Trempealeau County
## Cross-Platform Mobile Application and Web-Based Content Management System
<div style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 1;">
    <img style="width: 45%;" src="https://github.com/user-attachments/assets/4d1dcd18-0b36-4f9e-9854-5e4f03e972b6" />
    <img style="width: 45%;" src="https://github.com/user-attachments/assets/051f702f-7414-4ba9-a73a-ad4a9cd552ff" />
</div>
This is the project directory for our UW-Madison CS 620 Capstone project in collaboration with Trempealeau County, to create a full-stack software solution, including a cross-platform mobile app and a web-based content management platform.

This repository contains 3 separate apps under the apps folder. Each app covers a different functionality, those being:

- [*backend/*](https://github.com/DeboJp/Explore-Trempealeau-County-CS-Capstone/tree/main/apps/backend/): Data processing, user authentication, and various endpoints for the flow of data from and to AWS-based and local platforms.
    - [*backend/api*](https://github.com/DeboJp/Explore-Trempealeau-County-CS-Capstone/tree/main/apps/backend/api): FastAPI app with README detailing setup and execution.
    - [*backend/routingSpecificapi*](https://github.com/DeboJp/Explore-Trempealeau-County-CS-Capstone/tree/main/apps/backend/routingSpecificApi): FastAPI app + OSRM routing files with README detailing setup and execution.

- [*mobile/*](https://github.com/DeboJp/Explore-Trempealeau-County-CS-Capstone/tree/main/apps/mobile/): User-facing, cross-platform mobile application built with Expo Go, React Native, and TypeScript.

- [*web/*](https://github.com/DeboJp/Explore-Trempealeau-County-CS-Capstone/tree/main/apps/web/): Admin-facing web application used to manage content, like trails and app pages, and track relevant analytics.
    - [*web/AdminWedpage*](https://github.com/DeboJp/Explore-Trempealeau-County-CS-Capstone/tree/main/apps/web/AdminWebpage): React + Vite web app with various components and pages for content creation and manipulation.

**For more detailed write-ups on each of these applications, go to the README files located in those folders.**

### Tech-stack
- Coding Languages/Frameworks:
    - TypeScript, React Native (Expo Go)
    - Python, FastAPI
- Third Party Services:
    - AWS (Amazon Web Services) as our cloud-hosting provider for various services, including:
        - S3 for asset storage (page images)
        - DynamoDB for our database
        - Cognito for user authorization/authentication
        - EC2 as our virtual server for hosting our API
    - OSRM (Open Source Routing Machine)
 
### Prerequisites and Required Software
In order to properly run the various projects included in this repository, several CLI tools are assumed to already be installed. These include the following, which may not cover the entirety of the software necessary for this project.
- Mobile app
    - `npm`, `nvm`, `npx`
        - Expo Go
    - XCode, CocoaPods for iOS emulation
    - Android Studio for Android emulation
- Web application
     - `npm`
- Backend (API)
    - AWS ClI tools for configuration
    - `.env` file for API config   

## Next Steps
- Finish setup of AWS: While initialization and integration into our app and API are roughly finished, we still need to deploy and configure them via hosting services like EC2.
- UI + feature refinement: At the end of the semester, there was still some outstanding work that wasn't finished, yet it didn't necessarily take away from the functionality of the final product. This includes adding a splash screen and refining user journeys for saving trail and park information for offline use.     
- Robust UAT: performing rigorous user testing and continuing iterative development based on testing results.
