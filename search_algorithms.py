"""BFS and A* search algorithms for the maze project."""
from collections import deque
from heapq import heappush, heappop
from itertools import count


def neighbors(cell, rows, cols, walls):
    """Return the cells directly above, left, below and right."""
    row, col = cell
    options = [(row - 1, col), (row, col - 1),
               (row + 1, col), (row, col + 1)]

    for next_cell in options:
        r, c = next_cell
        if 0 <= r < rows and 0 <= c < cols and next_cell not in walls:
            yield next_cell


def build_path(parent, start, goal):
    """Build the path by following each cell's parent."""
    if start != goal and goal not in parent:
        return []

    path = [goal]
    while path[-1] != start:
        path.append(parent[path[-1]])

    return path[::-1]


def manhattan(cell, goal):
    """Estimate the distance between two cells."""
    return abs(cell[0] - goal[0]) + abs(cell[1] - goal[1])


def bfs(start, goal, walls, rows, cols):
    """Breadth-First Search: explore cells using a queue."""
    queue = deque([start])
    visited = {start}
    parent = {}
    order = []

    while queue:
        current = queue.popleft()
        order.append(current)

        if current == goal:
            break

        for next_cell in neighbors(current, rows, cols, walls):
            if next_cell not in visited:
                visited.add(next_cell)
                parent[next_cell] = current
                queue.append(next_cell)

    path = build_path(parent, start, goal)
    return {
        "algorithm": "BFS",
        "path": path,
        "explored_order": order,
        "explored_count": len(order),
        "cost": len(path) - 1 if path else None,
        "found": bool(path),
    }


def astar(start, goal, walls, rows, cols):
    """A*: choose the cell with the lowest cost plus heuristic."""
    tie_breaker = count()
    open_list = [(manhattan(start, goal), next(tie_breaker), start)]
    parent = {}
    cost = {start: 0}
    visited = set()
    order = []

    while open_list:
        _, _, current = heappop(open_list)

        if current in visited:
            continue

        visited.add(current)
        order.append(current)

        if current == goal:
            break

        for next_cell in neighbors(current, rows, cols, walls):
            new_cost = cost[current] + 1

            if new_cost < cost.get(next_cell, float("inf")):
                cost[next_cell] = new_cost
                parent[next_cell] = current
                priority = new_cost + manhattan(next_cell, goal)
                heappush(open_list, (priority, next(tie_breaker), next_cell))

    path = build_path(parent, start, goal)
    return {
        "algorithm": "A*",
        "path": path,
        "explored_order": order,
        "explored_count": len(order),
        "cost": len(path) - 1 if path else None,
        "found": bool(path),
    }


if __name__ == "__main__":
    rows, cols = 8, 12
    start, goal = (1, 1), (6, 10)
    walls = {
        (1, 4), (2, 4), (3, 4), (4, 4), (4, 5),
        (4, 6), (4, 7), (2, 8), (3, 8),
    }

    for search in (bfs, astar):
        result = search(start, goal, walls, rows, cols)
        print(f"\n{result['algorithm']}: found={result['found']}, "
              f"explored={result['explored_count']}, cost={result['cost']}")
        print("Path:", result["path"])
