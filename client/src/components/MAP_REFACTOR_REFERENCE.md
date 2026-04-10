# Map Refactor - Quick Reference

## Component Tree

```
MapContainer (Main Orchestrator)
├── LocationSearch (at top)
├── Left Side (conditional):
│   └── FilterPanel (ONLY if userRole === "student")
├── Right Side:
│   ├── MapMarkers (Leaflet Map)
│   │   ├── TileLayer
│   │   ├── Circle (radius visualization)
│   │   └── Markers (colored by type)
│   └── ResultsList (scrollable)
│       ├── Result Items
│       └── "View More" Button (with navigation)
```

## Data Flow Diagram

```
User Actions
    ↓
┌─────────────────────────────┐
│ MapContainer State:         │
│ - selectedLocation          │
│ - filters                   │
│ - center                    │
│ - highlightedMarkerId       │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ useMapData Hook:            │
│ - Visibility rules          │
│ - KM radius filter          │
│ - Student filters           │
│ - Distance calculation      │
│ - Sorting                   │
└─────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│ Result: Filtered Markers Array       │
└──────────────────────────────────────┘
    ↓↓
┌──────────────┐  ┌────────────────┐
│ MapMarkers   │  │ ResultsList    │
│ - Renders    │  │ - Renders      │
│   Leaflet    │  │   scrollable   │
│ - Shows map  │  │   list         │
│ - Popups     │  │ - Navigation   │
└──────────────┘  └────────────────┘
    ↓↓
┌──────────────────────────────────────┐
│ User Interaction                     │
│ - Click marker → navigate            │
│ - Hover result → highlight           │
│ - Adjust filters → re-render         │
└──────────────────────────────────────┘
```

## Role-Based Visibility Rules

### STUDENT ✅
Can see:
- Teachers (blue markers)
- Institutions/Jobs (amber markers)
- Books (green markers)
- **Has**: Filters (subject, class, fee, mode, radius, sort)

### TEACHER ✅
Can see:
- Students (purple markers)
- Institutions/Jobs (amber markers)
- Books (green markers)
- **No**: Filters

### INSTITUTION ✅
Can see:
- Teachers (blue markers)
- Books (green markers)
- **No**: Students
- **No**: Filters

## Component Props

### MapContainer
```tsx
{
  userRole: "student" | "teacher" | "institution"
  tutors: Tutor[]
  books: Book[]
  jobs: Job[]
  students: Student[]
  center?: [lat, lon]
  onMarkerClick?: (marker) => void
  loading?: boolean
}
```

### useMapData
```tsx
(userRole, selectedLocation, rawData, filters) => {
  markers: MapMarker[]
  isLoading: boolean
}
```

### FilterPanel
```tsx
{
  filters: { subject, class, feeMin, feeMax, mode, searchRadius, sortBy }
  onFilterChange: (updatedFilters) => void
}
```

### MapMarkers
```tsx
{
  center: [lat, lon]
  markers: MapMarker[]
  searchRadius: number
  onMarkerClick: (marker) => void
  highlightedMarkerId?: string
}
```

### ResultsList
```tsx
{
  markers: MapMarker[]
  isLoading: boolean
  onItemHover?: (markerId) => void
  userRole: string
}
```

## Navigation Paths

From ResultsList "View More" button:
- **Teacher**: `/tutors/{id}`
- **Institution**: `/jobs/{id - 2000}`
- **Book**: `/books`
- **Student**: `/profile?id={id - 3000}`

## Marker ID Scheme

Ensures unique IDs across types:
- Teacher: `id` (0-999)
- Book: `1000 + id`
- Institution/Job: `2000 + id`
- Student: `3000 + id`

## Filter Defaults

```tsx
{
  subject: "",
  class: "",
  feeMin: 0,
  feeMax: 100000,
  mode: "any",
  searchRadius: 10,  // km
  sortBy: "distance"
}
```

## Responsive Breakpoints

**Desktop (lg and above)**:
- Filter panel left (w-64)
- Map + Results right (flex-1)
- Side-by-side layout

**Mobile (below lg)**:
- Stacked vertically
- Filter panel above map
- Full width

## Testing Map Feature

### Setup:
1. Create test data with tutors, books, jobs, students in different locations
2. Login as each role (student, teacher, institution)

### Verify Student:
1. Search location → see tutors, jobs, books
2. Toggle filters → results update
3. Adjust radius → marker circle changes
4. Click "View More" → navigate to profile
5. Hover result → appears in list

### Verify Teacher:
1. Search location → see students, jobs, books
2. No filter panel appears
3. Click student marker → navigate to profile

### Verify Institution:
1. Search location → see tutors, books
2. No filters
3. Students not visible
4. Jobs not shown

## Performance Notes

- Distance calculations use Haversine formula
- Marker filtering happens once per location/filter change
- 300ms debounce on marker generation
- React Query caches raw data
- Lazy rendering with overflow: auto for ResultsList
