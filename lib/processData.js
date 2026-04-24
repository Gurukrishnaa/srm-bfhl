/**
 * Validates that an entry follows the format: uppercase letter -> uppercase letter.
 * Rejects entries that don't match the pattern or are self-loops (A->A).
 */
function validateEntry(raw) {
  const entry = raw.trim();
  const pattern = /^([A-Z])->([A-Z])$/;
  const match = entry.match(pattern);

  if (!match) {
    return { valid: false, entry };
  }

  // Self-loops are not allowed
  if (match[1] === match[2]) {
    return { valid: false, entry };
  }

  return { valid: true, parent: match[1], child: match[2], entry };
}

/**
 * Builds hierarchy structures from a set of edges.
 * Groups connected nodes into components and identifies cycles within each.
 */
function buildHierarchies(edges) {
  const children = {};      // parent -> array of children
  const parentOf = {};      // child -> its parent (first one wins)
  const allNodes = new Set();

  // Build the parent-child relationships
  for (const { parent, child } of edges) {
    allNodes.add(parent);
    allNodes.add(child);

    if (!children[parent]) {
      children[parent] = [];
    }

    // Only allow one parent per child (no diamonds)
    if (parentOf[child] !== undefined) {
      continue;
    }

    parentOf[child] = parent;
    children[parent].push(child);
  }

  // Build undirected adjacency for finding connected components
  const undirected = {};
  for (const node of allNodes) {
    undirected[node] = new Set();
  }
  for (const { parent, child } of edges) {
    undirected[parent].add(child);
    undirected[child].add(parent);
  }

  // Find all connected components using BFS
  const visited = new Set();
  const components = [];

  function bfsComponent(start) {
    const queue = [start];
    const group = new Set();
    visited.add(start);

    while (queue.length > 0) {
      const node = queue.shift();
      group.add(node);

      for (const neighbor of (undirected[node] || [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return group;
  }

  for (const node of allNodes) {
    if (!visited.has(node)) {
      components.push(bfsComponent(node));
    }
  }

  // Analyze each component for cycles and structure
  const hierarchies = [];

  for (const group of components) {
    const groupRoots = [...group].filter(n => parentOf[n] === undefined);

    // Determine root: use existing root if present, otherwise use smallest node
    const rootNode = groupRoots.length > 0
      ? groupRoots[0]
      : [...group].sort()[0];

    const hasCycle = detectCycle(group, children);

    if (hasCycle) {
      hierarchies.push({ root: rootNode, tree: {}, has_cycle: true });
    } else {
      const tree = { [rootNode]: buildTree(rootNode, children) };
      const depth = calcDepth(rootNode, children);
      hierarchies.push({ root: rootNode, tree, depth });
    }
  }

  // Sort: non-cyclic hierarchies first, then alphabetically by root
  hierarchies.sort((a, b) => {
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root.localeCompare(b.root);
  });

  return hierarchies;
}

/**
 * Detects cycles in a component using depth-first search.
 * Uses color coding: white (unvisited), gray (visiting), black (done).
 */
function detectCycle(group, children) {
  const UNVISITED = 0;
  const VISITING = 1;
  const VISITED = 2;

  const color = {};
  for (const node of group) {
    color[node] = UNVISITED;
  }

  function dfs(node) {
    color[node] = VISITING;

    for (const child of (children[node] || [])) {
      // Skip if child is not in this component
      if (!group.has(child)) {
        continue;
      }

      // Back edge detected = cycle found
      if (color[child] === VISITING) {
        return true;
      }

      // Recursively check unvisited children
      if (color[child] === UNVISITED && dfs(child)) {
        return true;
      }
    }

    color[node] = VISITED;
    return false;
  }

  // Check each node in the component
  for (const node of group) {
    if (color[node] === UNVISITED) {
      if (dfs(node)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Recursively builds a tree structure from a node.
 * Returns the children object without wrapping the node itself.
 */
function buildTree(node, children) {
  const subtree = {};

  for (const child of (children[node] || [])) {
    subtree[child] = buildTree(child, children);
  }

  return subtree;
}

/**
 * Calculates the depth (height) of a tree:
 * the number of nodes on the longest path from root to leaf.
 */
function calcDepth(node, children) {
  const childNodes = children[node] || [];

  if (childNodes.length === 0) {
    return 1;
  }

  return 1 + Math.max(...childNodes.map(child => calcDepth(child, children)));
}

/**
 * Creates a summary of the hierarchies:
 * counts total trees and cycles, and finds the largest tree.
 */
function buildSummary(hierarchies) {
  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);

  let largestRoot = null;
  let maxDepth = -1;

  // Find the tree with maximum depth (largest root if tied)
  for (const hierarchy of nonCyclic) {
    if (
      hierarchy.depth > maxDepth ||
      (hierarchy.depth === maxDepth && hierarchy.root < largestRoot)
    ) {
      maxDepth = hierarchy.depth;
      largestRoot = hierarchy.root;
    }
  }

  return {
    total_trees: nonCyclic.length,
    total_cycles: cyclic.length,
    largest_tree_root: largestRoot,
  };
}

/**
 * Main processing function: validates entries, filters duplicates,
 * and builds hierarchy structures from the input data.
 */
function processData(data) {
  const validEdges = [];
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();

  for (const entry of data) {
    const validation = validateEntry(entry);

    if (!validation.valid) {
      invalidEntries.push(validation.entry);
      continue;
    }

    const edgeKey = `${validation.parent}->${validation.child}`;

    if (seenEdges.has(edgeKey)) {
      // Track duplicate (only once)
      if (!duplicateEdges.includes(edgeKey)) {
        duplicateEdges.push(edgeKey);
      }
      continue;
    }

    seenEdges.add(edgeKey);
    validEdges.push({ parent: validation.parent, child: validation.child });
  }

  // Build hierarchies from valid edges
  const hierarchies = validEdges.length > 0 ? buildHierarchies(validEdges) : [];
  const summary = buildSummary(hierarchies);

  return { hierarchies, invalidEntries, duplicateEdges, summary };
}

module.exports = { processData };