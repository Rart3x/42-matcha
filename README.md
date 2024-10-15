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

With regard to the GeoIP feature, we used the free to use ip-api.com API, which allowed us to get the location of a user
with medium accuracy. We are aware that this API is not suitable for production, and we recommend using a paid service
such as ones shipped with a CDN.

As the project is being assessed with a local deployment, we couldn't rely on the IP address of the user to get their
location. So we opted for mocking their ip address with a random one. This mocking feature is enabled by setting the
`APP_IS_ASSESSMENT` environment variable to `true`.

Where other team chose to call geoip service from the client side to address this problem, we found mocking the ip address
to be a more elegant solution, as it allowed us to keep the same codebase for both assessment and production (for users
shouldn't be aware that we are tracking their location).

## Architectural choices

Per subject requirements, we used Node.js with Express.js as the backend framework. As we could use any frontend framework
we wanted, we chose to use Angular, as it is a framework with its Angular Material library as we were already familiar with
it.

We wrote the entire project in TypeScript, and implemented a custom router on top of express 
