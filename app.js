(() => {
  "use strict";

  const ROWS = 15;
  const COLS = 20;
  const $ = id => document.getElementById(id);
  const key = cell => cell.join(",");
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];

  let start = [7, 2];
  let goal = [7, 17];
  let walls = new Set();
  let explored = new Set();
  let path = new Set();
  let mode = "wall";
  let drag = false;
  let dragAction = "wall";
  let running = false;
  let timers = [];
  let speed = 2;
  const results = { BFS: null, "A*": null };
  const maze = $("maze");

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function drawMaze() {
    maze.innerHTML = "";
    const cells = document.createDocumentFragment();

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = [row, col];
        const cellKey = key(cell);
        const button = document.createElement("button");
        let type = "";

        if (same(cell, start)) type = "start";
        else if (same(cell, goal)) type = "goal";
        else if (walls.has(cellKey)) type = "wall";
        else if (path.has(cellKey)) type = "path";
        else if (explored.has(cellKey)) type = "explored";

        button.className = "cell " + type;
        button.dataset.row = row;
        button.dataset.col = col;
        button.setAttribute("aria-label", (type || "empty") + ` cell row ${row + 1} column ${col + 1}`);
        button.addEventListener("pointerdown", editCell);
        button.addEventListener("pointerenter", dragOverCell);
        cells.appendChild(button);
      }
    }

    maze.appendChild(cells);
    $("wall-count").textContent = walls.size + " WALLS";
  }

  function setBusy(value) {
    running = value;
    document.querySelectorAll(".tool, .algorithm, #reset, #random, #clear")
      .forEach(button => button.disabled = value);
  }

  function changeCell(cell, action) {
    const cellKey = key(cell);

    if (mode === "start") {
      if (!walls.has(cellKey) && !same(cell, goal)) start = cell;
    } else if (mode === "goal") {
      if (!walls.has(cellKey) && !same(cell, start)) goal = cell;
    } else if (!same(cell, start) && !same(cell, goal)) {
      if (action === "erase") walls.delete(cellKey);
      else walls.add(cellKey);
    }

    explored.clear();
    path.clear();
    $("explored").textContent = "—";
    $("cost").textContent = "—";
    $("status").textContent = "Maze updated";
    $("status-dot").className = "";
    $("active").textContent = "None selected";
    drawMaze();
  }

  function editCell(event) {
    if (running) return;
    event.preventDefault();
    drag = true;

    const cell = [+this.dataset.row, +this.dataset.col];
    dragAction = mode === "wall" && walls.has(key(cell)) ? "erase" : mode;
    changeCell(cell, dragAction);
  }

  function dragOverCell() {
    if (!drag || running || (mode !== "wall" && mode !== "erase")) return;
    changeCell([+this.dataset.row, +this.dataset.col], dragAction);
  }

  document.addEventListener("pointerup", () => drag = false);

  document.querySelectorAll(".tool").forEach(button => {
    button.addEventListener("click", () => {
      if (running) return;
      mode = button.dataset.mode;
      document.querySelectorAll(".tool").forEach(tool => {
        tool.classList.toggle("active", tool === button);
      });
    });
  });

  function neighbors(cell) {
    const row = cell[0];
    const col = cell[1];
    const options = [[row - 1, col], [row, col - 1], [row + 1, col], [row, col + 1]];

    return options.filter(next =>
      next[0] >= 0 && next[0] < ROWS &&
      next[1] >= 0 && next[1] < COLS &&
      !walls.has(key(next))
    );
  }

  function makePath(parent, startKey, goalKey) {
    if (startKey !== goalKey && !parent.has(goalKey)) return [];

    const result = [goalKey];
    while (result[result.length - 1] !== startKey) {
      result.push(parent.get(result[result.length - 1]));
    }

    return result.reverse().map(item => item.split(",").map(Number));
  }

  // BFS uses a queue and visits nearby cells first.
  function bfs() {
    const startKey = key(start);
    const goalKey = key(goal);
    const queue = [start];
    const visited = new Set([startKey]);
    const parent = new Map();
    const order = [];
    let index = 0;

    while (index < queue.length) {
      const current = queue[index++];
      const currentKey = key(current);
      order.push(current);
      if (currentKey === goalKey) break;

      for (const next of neighbors(current)) {
        const nextKey = key(next);
        if (!visited.has(nextKey)) {
          visited.add(nextKey);
          parent.set(nextKey, currentKey);
          queue.push(next);
        }
      }
    }

    const route = makePath(parent, startKey, goalKey);
    return { algorithm: "BFS", order, path: route, cost: route.length ? route.length - 1 : null };
  }

  function heuristic(cell) {
    return Math.abs(cell[0] - goal[0]) + Math.abs(cell[1] - goal[1]);
  }

  // A* chooses the cell with the lowest cost + estimated distance.
  function astar() {
    const startKey = key(start);
    const goalKey = key(goal);
    const open = [{ cell: start, cost: 0 }];
    const parent = new Map();
    const costs = new Map([[startKey, 0]]);
    const visited = new Set();
    const order = [];

    while (open.length) {
      open.sort((a, b) =>
        (a.cost + heuristic(a.cell)) - (b.cost + heuristic(b.cell))
      );

      const current = open.shift().cell;
      const currentKey = key(current);
      if (visited.has(currentKey)) continue;

      visited.add(currentKey);
      order.push(current);
      if (currentKey === goalKey) break;

      for (const next of neighbors(current)) {
        const nextKey = key(next);
        const newCost = costs.get(currentKey) + 1;

        if (newCost < (costs.get(nextKey) ?? Infinity)) {
          costs.set(nextKey, newCost);
          parent.set(nextKey, currentKey);
          open.push({ cell: next, cost: newCost });
        }
      }
    }

    const route = makePath(parent, startKey, goalKey);
    return { algorithm: "A*", order, path: route, cost: route.length ? route.length - 1 : null };
  }

  function resetSearch() {
    clearTimers();
    setBusy(false);
    explored.clear();
    path.clear();
    $("explored").textContent = "—";
    $("cost").textContent = "—";
    $("status").textContent = "Ready to run";
    $("status-dot").className = "";
    $("active").textContent = "None selected";
    drawMaze();
  }

  function updateComparison() {
    const bfsResult = results.BFS;
    const aStarResult = results["A*"];
    const max = Math.max(bfsResult?.nodes || 0, aStarResult?.nodes || 0, 1);

    $("bfsval").textContent = bfsResult ? bfsResult.nodes : "—";
    $("astarval").textContent = aStarResult ? aStarResult.nodes : "—";
    $("bfsbar").style.width = bfsResult ? (bfsResult.nodes / max * 100) + "%" : "0%";
    $("astarbar").style.width = aStarResult ? (aStarResult.nodes / max * 100) + "%" : "0%";
  }

  function animate(result) {
    clearTimers();
    explored.clear();
    path.clear();
    setBusy(true);
    $("active").textContent = result.algorithm === "BFS" ? "Breadth-First Search" : "A* Search";
    $("status").textContent = "Searching…";
    $("status-dot").className = "";
    $("explored").textContent = "0";
    $("cost").textContent = "—";

    let index = 0;
    const delay = speed === 1 ? 55 : speed === 2 ? 23 : 7;

    function showNextCell() {
      if (index < result.order.length) {
        const cell = result.order[index++];
        if (!same(cell, start) && !same(cell, goal)) explored.add(key(cell));
        $("explored").textContent = index;
        drawMaze();
        timers.push(setTimeout(showNextCell, delay));
        return;
      }
      showPath();
    }

    let pathIndex = 0;
    function showPath() {
      if (pathIndex < result.path.length) {
        const cell = result.path[pathIndex++];
        if (!same(cell, start) && !same(cell, goal)) path.add(key(cell));
        drawMaze();
        timers.push(setTimeout(showPath, Math.max(12, delay * 1.5)));
        return;
      }

      setBusy(false);
      $("explored").textContent = result.order.length;
      $("cost").textContent = result.cost ?? "—";
      $("status").textContent = result.path.length ? "Path found" : "No path found";
      $("status-dot").className = result.path.length ? "success" : "fail";
      results[result.algorithm] = { nodes: result.order.length };
      updateComparison();
    }

    showNextCell();
  }

  $("bfs").addEventListener("click", () => {
    if (!running) animate(bfs());
  });
  $("astar").addEventListener("click", () => {
    if (!running) animate(astar());
  });
  $("reset").addEventListener("click", resetSearch);
  $("clear").addEventListener("click", () => {
    if (running) return;
    walls.clear();
    results.BFS = results["A*"] = null;
    updateComparison();
    resetSearch();
  });
  $("random").addEventListener("click", () => {
    if (running) return;
    walls.clear();
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = [row, col];
        if (!same(cell, start) && !same(cell, goal) && Math.random() < 0.22) {
          walls.add(key(cell));
        }
      }
    }
    results.BFS = results["A*"] = null;
    updateComparison();
    resetSearch();
  });
  $("speed").addEventListener("input", event => {
    speed = Number(event.target.value);
    $("speed-label").textContent = ["Slow", "Medium", "Fast"][speed - 1];
  });

  drawMaze();
})();
