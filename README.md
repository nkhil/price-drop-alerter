# Price Drop Alerter

An API that determines if a price drop alert needs to be triggered for a product.

## Setup

### For development

To get the app running locally:

```
git clone git@github.com:nkhil/price-drop-alerter.git
cd price-drop-alerter
npm install
npm run develop
```
### To get the app running in Docker:

To get the app running on localhost port 8080
```
npm run app:docker
```

## Technology

- Express
- Swagger
- openapi-express-validator
- Docker / docker-compose
## Tests

### Run tests in Docker
You can run all automated tests (unit & integration) using the following command 

```
npm run test:docker
```

### Unit tests

```
npm run test:unit
```

