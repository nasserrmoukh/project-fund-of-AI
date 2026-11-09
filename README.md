## Project Idea
A maze-solving project that finds a path from the start point to the goal while avoiding walls.

## Algorithms Used
- **BFS (Breadth-First Search):** explores the maze level by level and finds the shortest path when all moves have the same cost.
- **A* Search:** uses the Manhattan distance heuristic to guide the search toward the goal and find an efficient shortest path.
- A* uses:

\[
f(n) = g(n) + h(n)
\]

`g(n)` is the cost from Start to `n`. The Manhattan heuristic is:

\[
h(n) = |r_n-r_{goal}| + |c_n-c_{goal}|
\]

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


## How to Run

### Web Version
1. Open the `web` folder.
2. Open `index.html` in a web browser.

### Python Version
1. Make sure Python 3 is installed.
2. Open a terminal in the folder containing `main.py`.
3. Run:
   ```bash
   python main.py
   ```

