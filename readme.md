# _Oh, Hell!_ Frontend Web App
This repo contains the frontend code for the _Oh, Hell!_ AI project. The backend code can be found in [this repo](https://github.com/jackjamend/OhHellCardGame)

# Outline
`game` folder contains the main body of the page.
`card-images` is a list of .png images for every card in the deck.
`card-pile` is a component used to draw the pile of cards in the middle of the table.
`player-hand` is a component used to draw each player's hand and provide interaction with the cards in it.

# App structure
When loading the page, the app attempts to connect the backend. By default it attempts to connect to `ws://localhost:5000`, but this can be changed by setting the `SERVER` environment variable. In the production version of the app, this variable must be set. To run the app in a dev environment, use `npm run dev` or `yarn run dev`.
