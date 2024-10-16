# Matcha

This our take to the Matcha project from 42 school. The goal of this project is to create a dating website. 
The website will allow users to register, connect, fill their profile, search and look at the profile of other users, 
like them, chat with those that liked them, and unliked them. Users will be suggested potential partners based on their
preferences. They will also be able to report fake accounts.

## Deployment

The project features a compose file that will allow you to deploy the project on a local machine with a single command:
```bash
docker compose up
```

### SMTP server

For assessment purposes, we shipped the project with a fake SMTP server, Mailhog, that will allow you to see the emails
sent by the application. You can access the Mailhog interface at `http://localhost:8025`.

Obviously, Mailhog is to be replaced by a real SMTP server in a production environment. You can do so by setting the 
`SMTP_HOST` environment variable to the address of your SMTP server (which for instance could be provided by your hosting
provider).

### Fake data

The project features many seed scripts that will allow you to populate the database with fake data. those scripts are
located under `src/api/dev-tools`. They can be run using an ide or by running tsx/ts-node directly.

### GeoIP

With regard to the GeoIP feature, we used a free API, which allowed us to get the location of a user with medium accuracy. 
We are aware that this API is not suitable for production, and we recommend using a paid service such as ones shipped 
with a CDN.

As the project is being assessed with a local deployment, we couldn't rely on the IP address of the user to get their
location. So we opted for mocking their ip address with a random one. This mocking feature is enabled by setting the
`APP_IS_ASSESSMENT` environment variable to `true`.

Where other team chose to call geoip service from the client side to address this problem, we found mocking the ip address
to be a more elegant solution, as it allowed us to keep the same codebase for both assessment and production (for users
shouldn't be aware that we are tracking their location).

## Architectural choices

Per subject requirements, we used Node.js with Express.js as the backend framework. As we could use any frontend framework
we wanted, we chose to use Angular, and its Angular Material library for we were already familiar with it.

We wrote the entire project in TypeScript, and implemented a custom router on top of express which enabled end to end
type safety throughout the project. Hence, we could define functional procedures on the backend and call them on the
frontend hiding http requests and responses. This allowed us to write less code and to have a more maintainable codebase,
as we could refactor the backend without having to change the frontend, or at least with type checked errors.

On the frontend we leveraged the @tanstack/angular-query library to handle almost all the state of the application. This
library allowed us to write less code and to have a more maintainable codebase, as it permitted us to define declaratively
the state of the application and to react to changes in the state.

Regarding data querying, we handle all the pagination, filtering, sorting, and searching on the backend following the
best practices of API design. This allowed us to perform complex queries with a single request, and to have a more
performant application. In details, we used a postgres database with custom functions to handle some complex queries,
and more conventional queries for the rest. We used the postgres npm package to interact with the database. It shipped
a template tag function that allowed us to write queries in a more secure way as it automatically replaced the variables
in the tag with SQL parameters.

To add up on maintainability, we implemented a unit testing suite for the api validators we used on the backend. We used
vitest to run those tests.

## Design

As mentioned before, we used Angular Material components to design the frontend. But not only that, we chose to follow
closely the M3 material design guidelines. This allowed us to have a more consistent design and user experience throughout
the application.

c.f. https://m3.material.io/

## Development environment

We set up a development environment that will allow you to develop the project with ease. The development environment
features a hot reload for both the frontend and the backend. It can be operated with IntelliJ IDEA run configurations.
It also features a dedicated docker compose file that ships a postgres database and a mailhog server (no need to ship 
the app in a container as development serve run on host machine).


## Contributors

- kramjatt (api and database design, query implementation, backend development, testing)
- tdubois (frontend development, ui/ux design, database/query design, architectural choices, deployment)


## Keywords

Node.js, Express.js, TypeScript, Angular, Angular Material, PostgreSQL, Docker, SMTP, Mailhog, GeoIP, M3, vitest, TailwindCSS,
@tanstack/angular-query, remote procedure call, custom router, type safety, end to end type safety, declarative state,
pagination, filtering, sorting, searching.

