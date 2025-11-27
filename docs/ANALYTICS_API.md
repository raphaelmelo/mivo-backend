# Analytics API Documentation

## Overview

The Analytics API provides comprehensive insights about students and lessons, helping identify performance trends and areas needing improvement.

## Endpoints

### 1. Student Insights Dashboard

**Endpoint**: `GET /api/ai/insights/:userId`

**Description**: Returns a comprehensive dashboard with all student metrics, performance trends, consistency analysis, personalized recommendations, and recent activity.

**Parameters**:
- `userId` (path parameter): ID of the student

**Response**:
```json
{
  "userId": 1,
  "metrics": {
    "userId": 1,
    "completionRate": 75.5,
    "averageTimePerLesson": 12.3,
    "consistencyScore": 82,
    "currentStreak": 7,
    "totalLessonsCompleted": 45,
    "totalLessonsStarted": 60,
    "trend": "improving",
    "lastActivityDate": "2024-11-20T..."
  },
  "consistency": {
    "score": 82,
    "currentStreak": 7,
    "longestStreak": 15,
    "averageGapDays": 1.2,
    "studyFrequency": 4.5
  },
  "trends": {
    "direction": "improving",
    "confidence": 0.85,
    "recentPerformance": [75, 78, 82, 85, 88],
    "slope": 3.2
  },
  "recommendations": [
    {
      "type": "progression",
      "priority": "high",
      "title": "Ready for Advanced Content! 🚀",
      "description": "Your performance is excellent..."
    }
  ],
  "recentActivity": [
    {
      "date": "2024-11-20T...",
      "lessonsCompleted": 3,
      "timeSpent": 45,
      "averageScore": 85
    }
  ],
  "generatedAt": "2024-11-20T..."
}
```

**Usage Example**:
```bash
curl http://localhost:3002/api/ai/insights/1
```

---

### 2. Lesson Effectiveness Analysis

**Endpoint**: `GET /api/ai/lesson-effectiveness`

**Description**: Analyzes all published lessons to identify which ones have high dropout rates, difficulty mismatches, or need review. This helps educators understand which content is working well and which needs improvement.

**Parameters**: None

**Response**:
```json
{
  "totalLessons": 50,
  "analyzedLessons": 45,
  "lessonsNeedingReview": [
    {
      "lessonId": 12,
      "lessonTitle": "Advanced Financial Concepts",
      "difficulty": "advanced",
      "estimatedMinutes": 15,
      "totalStudents": 120,
      "completionRate": 42.5,
      "dropoutRate": 57.5,
      "averageAttempts": 3.8,
      "averageTimeSpent": 28.5,
      "averageScore": 58.3,
      "timeEfficiencyRatio": 1.9,
      "difficultyRating": "harder_than_expected",
      "needsReview": true
    }
  ],
  "allLessons": [ /* all lessons data */ ],
  "generatedAt": "2024-11-20T..."
}
```

**Fields Explanation**:
- `totalLessons`: Total number of published lessons
- `analyzedLessons`: Lessons with student data available
- `lessonsNeedingReview`: Lessons flagged for review (dropout rate > 30% OR completion rate < 50% OR average attempts > 3)
- `completionRate`: Percentage of students who completed the lesson
- `dropoutRate`: Percentage of students who started but didn't complete (100 - completionRate)
- `timeEfficiencyRatio`: Actual time spent / estimated time (values > 1.5 indicate lesson takes longer than expected)
- `difficultyRating`: 
  - `easier_than_expected`: Completion rate ≥ 80% AND average score ≥ 80%
  - `harder_than_expected`: Completion rate < 60% OR average score < 60%
  - `as_expected`: Between the two ranges above

**Usage Example**:
```bash
curl http://localhost:3002/api/ai/lesson-effectiveness
```

---

## Integration Examples

### React/TypeScript Frontend

```typescript
// Fetch student insights
const fetchStudentInsights = async (userId: number) => {
  const response = await fetch(`/api/ai/insights/${userId}`);
  const insights = await response.json();
  
  // Display in dashboard
  console.log('Completion Rate:', insights.metrics.completionRate);
  console.log('Current Streak:', insights.consistency.currentStreak);
  console.log('Recommendations:', insights.recommendations);
};

// Fetch lesson effectiveness
const fetchLessonEffectiveness = async () => {
  const response = await fetch('/api/ai/lesson-effectiveness');
  const report = await response.json();
  
  // Show lessons needing attention
  console.log('Lessons Needing Review:', report.lessonsNeedingReview);
};
```

### Python/Data Analysis

```python
import requests
import pandas as pd

# Analyze lesson effectiveness
response = requests.get('http://localhost:3002/api/ai/lesson-effectiveness')
data = response.json()

# Convert to DataFrame for analysis
df = pd.DataFrame(data['allLessons'])
print(df[['lessonTitle', 'completionRate', 'averageScore', 'needsReview']])

# Find most problematic lessons
problematic = df[df['needsReview'] == True].sort_values('dropoutRate', ascending=False)
print(problematic[['lessonTitle', 'dropoutRate', 'difficultyRating']])
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful request
- `400 Bad Request`: Invalid parameters (e.g., non-numeric userId)
- `500 Internal Server Error`: Server error

**Error Response Format**:
```json
{
  "error": "Invalid userId parameter"
}
```

---

## Performance Notes

- **Student Insights**: Fetches data from multiple services concurrently for optimal performance
- **Lesson Effectiveness**: Analyzes all published lessons, may take longer with large datasets (recommend caching for production)
- Both endpoints use read-only database queries and don't modify any data
