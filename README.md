# Price Drop Alerter

An API that determines if a price drop alert needs to be triggered for a product.

## Approach

The service essentially is responsible for calculating if a price drop alert is required.

**Scenario Example**

```
// For productId "01"

lowest price: 100
lowest price: 120
lowest price: 130
lowest price: 100 **PRICE DROP ALERT**
lowest price: 110
lowest price: 130
lowest price: 110
lowest price: 90  **PRICE DROP ALERT**
```

To achieve this, every time the service gets a valid request that contains retailers, it:

- Calculates the lowest price for that productId (taking retailPrice as well as discountPrice)
- Gets the previous lowest price for that productId
- Checks if the latest lowest price for that productId is lower than the previous lowest price by at least £10 (NOTE: this threshold is an environment variable that can be modified without making changes to the service)
- Once it finds if the latest lowest price is lower than the previous, it generates a payload to indicate whether an alert is required
- Upserts the latest lowest price in the database 

Note: As this service is only responsible for the lowest price for a given productId, it only ever stores (and upserts) a single record for a given productId. I decided to use this approach over storing historic prices for a given service following the single responsibility principle. 

## Setup

### For development

**To get the app running locally using Docker:**

```
npm run app:docker
```
The application will run on the client's localhost port 8080 (http://localhost:8080)

**To get the app running locally:**

```
git clone git@github.com:nkhil/price-drop-alerter.git
cd price-drop-alerter
npm install
npm run develop
```
**NOTE**: You will node version 14.0.0 or above (at least) to get the service running locally as the service likely uses features only available in Node 14 and up (for eg: optional chaining).

## Technologies / Frameworks used

### At a glance:

- Express
- MongoDB
- Swagger 3.0
- openapi-express-validator
- Docker
- docker-compose

### Swagger 3.0 & openapi-express-validator

I'm using the Open API spec (v 3.0) to define the API (see `./swagger/swagger.yml`) and the `openapi-express-validator` module to validate requests and responses. This package also allows me to route the request (once validated) to the right controller (see `./src/controllers`). I've followed the provided schema for the request and response payloads, and have made the decision to make certain properties (for eg: `retailPrice` & `isInStock`) mandatory while leaving certain properties (eg: `/discountPrice`) as optional.

### Docker & Docker-compose

Docker & Docker-Compose have been used to package up the application for testing purposes, as well as for deployment. This will ensure a predictable, repeatable application when scaling up the service horizontally (i.e. multiple instances).

## Endpoints

### GET /liveness

This endpoint returns a 200 status code with `{ status: 'OK' }`. This can be used by kubernetes to determine if the service is up and ready. 

### POST /price-drop-check

This is the endpoint used to determine if a price drop alert is required.

- If an alert is required, it returns a 200 response with the following payload:

```
{
  "alertRequired": true,
  "newPrice": 90
  "productId": "ABC123",
  "retailerId": "offspring"
}
```

- If an alert is not required, it returns a 200 response with the following payload:

```
{
  "alertRequired": false,
}
```

If the request payload is invalid (i.e. it's missing required properties mentioned in the swagger.yml definitions), it returns a 400 status code.

If an error occurs (for eg: a database error), it returns a 500 status code.
## Testing

### Run tests in Docker
You can run all automated tests (unit & integration) using the following command 

```
npm run test:docker
```

## Currently tested scenarios

The following scenarios are currently tested and passing at the API level (i.e. hitting the API from the outside)
```
price-drop-alerter API test
  /liveness
    ✓ can successfully check the liveness of the service (158 ms)

  /price-drop-check
    ✓ returns an expected response when a price drop alert is required (76 ms)
    ✓ returns a 401 status code when productId is missing in payload (38 ms)
    ✓ returns a 401 status code when retailers are missing in payload (7 ms)
    ✓ returns a 401 status code when retailers are missing required properties in payload (6 ms)
```

## Scenarios that need to be tested

The following scenarios have been identified as ones that need to be tested, but have not yet been tested/implemented due to a lack of time.

```
/price-drop-check
  ✗ processes a request where none of the retailers have valid stock
  ✗ returns a correct response when a database error occurs

```

## Errors

I've extended Node's Error class to create custom errors that can be thrown (and caught) when errors occur (for eg: during a database operation). The errors can then be caught and an appropriate HTTP response can be returned (see `./src/errors/errors.js`). Due to the lack of time, I have not fleshed out all the errors that might occur (for eg: a mongo duplicate error).

## Logging

I've used pino as its a low overhead logger to log when requests are received and they finish processing to help debug issues in production.
## Conventional commits

This service uses conventional commits to be able to automatically create documentation / changelogs.

## Authorisation / Security

The `POST /price-drop-check` endpoint is insecure currently. I'd recommend securing it using a client credentials flow by using scoped auth tokens generated by an authorisation server that exchanges a client id and a secret for a scoped jwt auth token that can be used to authorise the service, ensuring that unauthorised agents are not able to access this service.

## Deployment 

Requirements for the operations of this service are: 

> The API will be expected to handle a large number of requests coming from other micro-services hosted within AWS. The volume of this traffic will fluctuate heavily throughout the day.

Firstly, I'd recommend a comprehensive CI/CD pipeline (eg: Github actions) be added to ensure changes made can be integrated and deployed regularly.

As the API gets a highly variable number of requests, it's important that we're able to scale the service up and down based on the number of requests.

I'd recomment the services use Helm along with Amazon EKS (AWS's managed kubernetes service) with a service mesh (eg: Istio) in the clusters. Kubernetes will allow us to declaratively set a threshold, as well as a minimum, maximum and threshold for the service.

For eg: Initially, price-drop-alerter can be deployed with a minimum of 3 pods / instances. We can defer to EKS to load balance and distribute the incoming requests between the pods. We can now set a CPU usage threshold (for instance, 70%) that will auto-scale the services, with maximum pods configured (for eg: initially this can be set to 5 pods). This will ensure that we can scale horizontally, and be able to scale down during less-busy periods. 

Note: Before being deployed to prod, we will need to load test the service (for eg: using Locust) to ensure that our k8s config (min 3 pods / max 5 pods) is capable of handling the number of requests we're expecting.

