# Explore Trempealeau County Project

This project is contained in our GitHub Repository, which you can go to by clicking [here.](https://github.com/DeboJp/Explore-Trempealeau-County-CS-Capstone) We also have a Figma prototype, which you can find by clicking [here](https://www.figma.com/design/qKMzYSPFY1C1umlb6THRan/Trempealeau-County-Trails?node-id=861-825&p=f&t=5kf9rDxKM3zBwcNs-0).

This repository contains 3 separate apps under the apps folder. Each app covers different functionalities and are built for different users of this project, those being:

- backend: Stores the data used by the mobile application. You should not need to access this part, as the web application should allow you to update this backend. Contains the API and database for the app.

- mobile: The user-facing mobile application and main app for this project. Allows everyday users to search for trails and get details for it, access a map to show the way.

- web: Admin-facing web application used to manage the data of the application. Allows admins to insert, update, and delete data without having to go into the codebase.

For more detailed writeups on each of these applications, go to the README files located in those folders.

For the overall techstack, we are currently using:
- Coding Languages/Frameworks:
    - React Native, with Typescript as our coding language for the mobile and web applications
    - Python for our backend
- Third Party Services:
    - FastAPI to build our backend API
    - AWS (Amazon Web Service) as our server to host data, which includes:
        - S3 for storage
        - DynamoDB for our database
        - Cognito for adding user sign-up, sign-in, and access control
        - EC2 as our virtual server
    - OSRM (Open Source Routing Machine)

These are the general next steps for this project:
- Finish setup of AWS: We have started up the basic setup and services of AWS, but there are still some steps to streamline the process and integrate the service fully.
- Optimizing map service: The map service on the app is already functional but is still quite slow when loading up some of the filter options.
- Streamlining search functionality: Similar to the map service, this function already works, but has a few things that can be streamlined, such as getting rid of the "in between" screen.