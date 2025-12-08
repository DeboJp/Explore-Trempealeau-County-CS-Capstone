## Local Development

To start the FastAPI app, run the following lines in your terminal. This will create a virtualenv *venv*, activate it, download all necessary libraries, and start up FastAPI.

```
python -m venv venv
source ./venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API also needs a *.env* file located in the project's root, **api/.env**, to correctly configure the necessary settings. **.env** is only provided to authorized users, and **should not be pushed to the project directory**.

To view Swagger docs, navigate to localhost:8000/docs. Any routes requiring authorization need an access token, which is only accessible to AWS users. Routes available without authorization include */api/v1/pages/published* and */api/v1/pages/count*

### Running via CLI
The quickest way to determine if the API is running correctly is by using a *curl* command in another shell environment running on your machine. Below gives an example of a GET request to the *pages/count* endpoint.

```
curl -X GET -H "Content-Type: application/json" http://localhost:8000/api/v1/pages/count
```

With a correctly running instance, the API should return a JSON object in the form:
```
{"count": X}
```

This can be verified by executing the same endpoint in the Swagger documentation.

Any endpoint requiring authorization needs a signed-in AWS user, verified by Cognito, to retrieve an access token. This access token can then be passed into a "Authorization" header "Bearer {ACCESS_TOKEN}" using *curl* to retrieve the protected data.

## Project Overview
The following defines the structure of the API, with its root at the *app* folder:
- app
    - main.py
    - config.py
    - routes
        - routes.py
        - api.py
        - analytics.py
        - pages.py
    - models
        - schemas.py
    - database
        - dynamodb.py
        - repository.py
    - auth
        - cognito.py
        - dependencies.py



