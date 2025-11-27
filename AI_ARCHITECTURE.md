# Lean AI Engine - Architecture Documentation

## Overview

The Lean AI Engine is a lightweight student analytics system built entirely in TypeScript/Node.js. It provides intelligent insights about student performance using statistical analysis rather than heavy machine learning frameworks.

## Architecture

### Core Services

#### 1. **MetricsCollector** (`src/services/ai/MetricsCollector.ts`)

Responsible for collecting and aggregating raw data from the database.

**Key Methods**:
- `collectUserProgressData(userId)`: Fetches all progress records for a user
- `aggregateLessonStats(userId)`: Aggregates lesson statistics (total, completed, average scores/time)
- `getRecentActivity(userId, days)`: Gets activity data for the last N days
- `getCompletedLessonsChronologically(userId)`: Returns completed lessons in order

**Data Source**: `UserProgress` model

---

#### 2. **StudentAnalyzer** (`src/services/ai/StudentAnalyzer.ts`)

Main analytics engine that calculates performance metrics and insights.

**Key Methods**:
- `getStudentMetrics(userId)`: Returns comprehensive student metrics
- `calculateCompletionRate(userId)`: Calculates % of started lessons completed
- `analyzeConsistency(userId)`: Analyzes study patterns and streaks
- `detectTrends(userId)`: Uses linear regression to detect performance trends

**Statistical Techniques**:
- **Streak Calculation**: Detects consecutive study days
- **Linear Regression**: Identifies improving/declining trends
- **Weighted Scoring**: Combines multiple factors for consistency score

---

### Data Flow

```
UserProgress (Database)
    ↓
MetricsCollector (Data Aggregation)
    ↓
StudentAnalyzer (Analytics)
    ↓
AI Controller (API Layer)
    ↓
REST API Response
```

---

## API Endpoints

Base URL: `/api/ai`

### 1. **GET /metrics/:userId**

Returns comprehensive student metrics.

**Response**:
```json
{
  "userId": 1,
  "completionRate": 75.5,
  "averageTimePerLesson": 12.3,
  "consistencyScore": 82,
  "currentStreak": 5,
  "totalLessonsCompleted": 15,
  "totalLessonsStarted": 20,
  "trend": "improving",
  "lastActivityDate": "2024-01-15T10:30:00Z"
}
```

---

### 2. **GET /consistency/:userId**

Returns detailed consistency analysis.

**Response**:
```json
{
  "score": 82,
  "currentStreak": 5,
  "longestStreak": 12,
  "averageGapDays": 1.2,
  "studyFrequency": 4.5
}
```

---

### 3. **GET /trends/:userId**

Returns trend analysis with linear regression.

**Response**:
```json
{
  "direction": "improving",
  "confidence": 0.75,
  "recentPerformance": [75, 78, 82, 85, 88],
  "slope": 3.2
}
```

---

### 4. **GET /activity/:userId?days=30**

Returns recent activity grouped by day.

**Query Parameters**:
- `days` (optional): Number of days to include (default: 30, max: 365)

**Response**:
```json
[
  {
    "date": "2024-01-15",
    "lessonsCompleted": 3,
    "timeSpent": 45,
    "averageScore": 85.3
  }
]
```

---

### 5. **GET /stats/:userId**

Returns aggregated lesson statistics.

**Response**:
```json
{
  "totalLessons": 20,
  "completedLessons": 15,
  "inProgressLessons": 5,
  "averageScore": 82.5,
  "averageTime": 12.3,
  "totalTimeSpent": 185
}
```

---

## Metrics Formulas

### Completion Rate
```
completionRate = (lessonsCompleted / totalLessonsStarted) * 100
```

### Consistency Score
```
consistencyScore = (
  0.3 * normalizedCurrentStreak +
  0.2 * normalizedLongestStreak +
  0.3 * (1 - normalizedGapDays) +
  0.2 * normalizedFrequency
) * 100
```

**Normalization**:
- Current Streak: 30 days = 1.0
- Longest Streak: 60 days = 1.0
- Gap Days: 7 days = 0.0
- Frequency: 7 sessions/week = 1.0

### Trend Detection
Uses linear regression on recent scores (last 10 lessons):

```
slope > 2  → improving
slope < -2 → declining
otherwise  → stable
```

**Confidence**: R-squared value from linear regression (0-1)

---

## Technology Stack

- **Runtime**: Node.js (TypeScript)
- **Data Analysis**: `danfojs-node` (currently unused, reserved for future phases)
- **Statistics**: `simple-statistics` (linear regression, R-squared)
- **Rules Engine**: `json-rules-engine` (reserved for Phase 2)
- **Database**: PostgreSQL via Sequelize ORM

---

## Future Phases

### Phase 2: Intelligence (Planned)
- Implement rule-based recommendation system
- Create pedagogical rules for content progression
- Build `/api/ai/recommend` endpoint

### Phase 3: Analytics (Planned)
- Dashboard of student insights
- Lesson effectiveness analysis
- Cohort analytics

---

## Performance Considerations

- All metrics are calculated on-demand (no caching yet)
- Database queries optimized with Sequelize indexes
- For future: Consider implementing Redis cache for frequently accessed metrics
- For scale: Consider cron jobs for pre-calculating metrics overnight

---

## Error Handling

All API endpoints return:
- **400**: Invalid userId parameter
- **500**: Internal server error (logged to console)

---

## Testing

Current testing is manual via curl:

```bash
# Test metrics endpoint
curl http://localhost:3002/api/ai/metrics/1

# Test with query parameter
curl "http://localhost:3002/api/ai/activity/1?days=7"
```

Future: Add automated tests with Jest
