# Pathfinder Studio — AI Maze Search

A professional browser maze visualizer for a Fundamentals of AI assignment. The project keeps the academic Python algorithms separate from the browser game.

## Project structure

```text
pathfinder_web_project/
├── algorithms/
│   └── search_algorithms.py
├── web/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── README.md
```

## Run the website

1. Download and extract the project.
2. Open `web/index.html` in a modern browser.
3. Use Draw/Erase and click or drag over the grid to build a maze.
4. Choose Start or Goal to move either endpoint.
5. Run BFS or A* and compare the metrics.

No web server, `pip install`, or external GUI library is required. Google Fonts are used for typography when internet access is available; system fonts are fallbacks.

## Run the Python algorithms

```bash
python algorithms/search_algorithms.py
```

On Windows, use `py algorithms/search_algorithms.py` if needed. The program prints the explored-node count, path cost, and path for BFS and A* on a small sample maze.

## Features

- Responsive dark interface.
- Interactive wall drawing and erasing.
- Movable start and goal.
- Animated explored states and final path.
- BFS and A* with adjustable animation speed.
- Random maze and reset controls.
- Explored-node comparison after both algorithms have been run.

## Formal problem formulation

| Component | Definition |
|---|---|
| State | A traversable `(row, column)` coordinate. |
| Initial state | The cell marked Start. |
| Goal state | The cell marked Goal. |
| Actions | Move one cell up, down, left, or right. Diagonal moves are not allowed. |
| Transition model | The agent moves to an adjacent cell only if it is inside the grid and not a wall. |
| Step cost | Every move costs 1; path cost counts moves/edges. |
| Solution | A legal action sequence from Start to Goal, or a no-path result. |

### BFS

Breadth-First Search uses a FIFO queue and expands nodes by increasing depth. With equal step costs it finds a shortest path. Its graph-search time and space complexity are `O(V + E)`.

### A*

A* uses:

\[
f(n) = g(n) + h(n)
\]

`g(n)` is the cost from Start to `n`. The Manhattan heuristic is:

\[
h(n) = |r_n-r_{goal}| + |c_n-c_{goal}|
\]

For four-direction movement with unit costs, Manhattan distance is admissible and consistent. A* therefore finds an optimal shortest path when a solution exists.

## Comparing performance

Run both algorithms without changing the maze. Compare **Nodes explored** and **Path cost**. BFS explores by depth; A* prioritizes nodes by estimated total cost. A* often explores fewer nodes, but that depends on maze layout. Both should return the same optimal path cost if a route exists.

The Python implementations and browser implementations use the same algorithmic ideas but are separate implementations. The website is static and works without a Python server. If the assignment specifically requires the website to invoke Python at runtime, add a small Python API layer as a separate enhancement.

## GitHub Pages

Push the repository to GitHub, then enable Pages in **Settings → Pages**. Publish the `web` folder using a Pages workflow, or place the three web files at the repository root if that is simpler for your repository configuration.
