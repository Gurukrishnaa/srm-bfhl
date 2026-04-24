# BFHL Tree Analyzer

A high-performance API for analyzing graph structures, detecting hierarchies, and identifying cycles in edge-based data.

## Features

- **Hierarchy Detection** - Identifies tree structures from edge lists
- **Cycle Detection** - Finds cycles using DFS algorithm
- **Graph Analysis** - Analyzes connected components and tree depths
- **Sub-3 Second Response** - O(N) algorithm optimized for performance
- **CORS Enabled** - Cross-origin requests supported
- **Modern UI** - Professional dark theme frontend

## API Endpoint

### POST `/bfhl`

**Request:**
```json
{
  "data": ["A->B", "B->C", "C->D"]
}
```

**Response:**
```json
{
  "user_id": "Guru_Krishnaa_K",
  "email_id": "gk2666@srmist.edu.in",
  "college_roll_number": "RA2311050010014",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": { "C": { "D": {} } } } },
      "depth": 4
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

## Input Format

Each edge must follow the pattern: `X->Y` where X and Y are uppercase letters (A-Z).

**Examples:**
- Valid: `A->B`, `X->Y`, `Z->A`
- Invalid: `A->a`, `AB->C`, `A->B->C`, `A->A` (self-loop)

## Algorithm

### 1. Validation
- Check each edge matches `[A-Z]->[A-Z]` pattern
- Reject self-loops (A->A)
- Track invalid entries

### 2. Duplicate Detection
- Use Set to detect duplicate edges
- Track all duplicates

### 3. Component Finding
- BFS to find connected components using undirected edges
- Groups nodes into separate hierarchies

### 4. Cycle Detection
- DFS with color coding (white/gray/black)
- Detects back edges indicating cycles

### 5. Tree Construction
- Build nested tree structure for acyclic components
- Calculate depth for each tree

### 6. Summary Generation
- Count total trees and cycles
- Find largest tree (max depth)

**Time Complexity:** O(V + E) - Linear in nodes and edges  
**Space Complexity:** O(V + E) - For adjacency structures

## Project Structure

```
srm-bhfl/
|-- server.js                    # Express API server
|-- package.json                 # Dependencies & scripts
|-- lib/
|   `-- processData.js           # Core algorithm
|-- public/
|   |-- index.html               # Frontend HTML
|   |-- styles.css               # Styling
|   `-- script.js                # Frontend JavaScript
|-- .gitignore                   # Git ignore rules
`-- DEPLOYMENT_CHECKLIST.md      # Deployment guide
```

## Installation & Setup

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server runs at http://localhost:3000
```

### Production

```bash
# Install dependencies
npm install

# Start server
npm start
```

## Environment Variables

No environment variables required for this project.

## Deployment

Deployed on **Render.com**:

- **API**: `https://srm-bfhl-srp8.onrender.com/bfhl`
- **Frontend**: `https://srm-bfhl-srp8.onrender.com/`
- **Repository**: `https://github.com/Gurukrishnaa/srm-bfhl`

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment steps.

## Testing

### Test Cases

1. **Basic Chain**: `A->B, B->C, C->D`
2. **Multiple Trees**: `A->B, C->D, E->F`
3. **Diamond**: `A->B, A->C, B->D, C->D`
4. **Cycle**: `A->B, B->C, C->A`
5. **Edge Cases**: Invalid entries, duplicates, self-loops

### Performance

- Response time: < 100ms
- Supports up to 50+ nodes efficiently
- Sub-3 second response guarantee

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Deployment**: Render
- **Version Control**: Git, GitHub

## Credentials

- **User ID**: Guru_Krishnaa_K
- **Email**: gk2666@srmist.edu.in
- **Roll Number**: RA2311050010014

## Author

**Guru Krishnaa K**

## License

MIT
