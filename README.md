# The Bargaining Shaft

The Bargaining Shaft is a two-player browser game about negotiation, incentives, and cooperation. Each round begins at the bargaining table and ends in a shared gold mine, where the agreement—or failure to agree—determines how the players are paid.

**Play online:** https://halilozt.github.io/gold-miner-bargaining-game/

## What is included

- Five bargaining mechanisms: alternating offers, ultimatum, simultaneous claims, deadline bargaining, and meet-halfway bargaining
- Four-round local multiplayer matches
- Keyboard and touch controls
- A searchable catalog of bargaining research
- Responsive, dependency-free HTML, CSS, and JavaScript

## Rules

Before each mining round, the players negotiate how to divide the shared portion of their revenue.

When they agree, each player keeps 30% of their own haul. The remaining 70% is pooled, receives a cooperation bonus, and is divided according to the contract. When talks fail, there is no shared pool and each player loses 15% of their individual haul to conflict costs.

The richest player after four rounds wins the match.

## Controls

| Player | Drop hook | Dynamite |
| --- | --- | --- |
| Player 1 | `S` | `W` |
| Player 2 | `Arrow Down` | `Arrow Up` |

Touch controls appear automatically on smaller screens.

## Run locally

The project has no build step or external dependencies. Start any static file server from the repository root, for example:

```sh
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Project files

- `index.html` contains the page structure and game interface.
- `styles.css` defines the layout, visual system, and responsive behavior.
- `app.js` handles navigation and the research catalog.
- `game.js` contains the bargaining mechanisms, canvas game, scoring, and controls.
