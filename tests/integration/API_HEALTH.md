# Health Module API Documentation

## Overview
Health check endpoints for monitoring server and database status.

## Base URL
`/api/v1/health`

---

## Endpoints

### 1. Basic Health Check

**GET** `/api/v1/health`

Check if the server is running and database is connected.

**Authentication:** None

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-14T10:30:00.000Z",
    "uptime": 3600.5,
    "environment": "development"
  }
}
```

**Response (503 Service Unavailable)**:
```json
{
  "success": false,
  "statusCode": 503,
  "data": {
    "status": "unhealthy",
    "timestamp": "2026-04-14T10:30:00.000Z",
    "uptime": 3600.5,
    "environment": "production"
  }
}
```

**Fields**:
- `status`: `healthy` | `unhealthy`
- `timestamp`: ISO 8601 timestamp
- `uptime`: Server uptime in seconds
- `environment`: `development` | `production` | `test`

---

### 2. Detailed Health Check

**GET** `/api/v1/health/detailed`

Get comprehensive health information including database and memory metrics.

**Authentication:** None

**Response (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-14T10:30:00.000Z",
    "uptime": 3600.5,
    "environment": "development",
    "database": {
      "connected": true,
      "responseTime": 15
    },
    "memory": {
      "used": 128,
      "total": 256,
      "percentage": 50
    },
    "version": "1.0.0"
  }
}
```

**Response (503 Service Unavailable - Database Down)**:
```json
{
  "success": false,
  "statusCode": 503,
  "data": {
    "status": "unhealthy",
    "timestamp": "2026-04-14T10:30:00.000Z",
    "uptime": 3600.5,
    "environment": "production",
    "database": {
      "connected": false,
      "responseTime": 5000,
      "error": "Connection timeout"
    },
    "memory": {
      "used": 128,
      "total": 256,
      "percentage": 50
    },
    "version": "1.0.0"
  }
}
```

**Fields**:
- `status`: `healthy` | `degraded` | `unhealthy`
  - `healthy`: All systems operational
  - `degraded`: Systems operational but slow (DB response > 1000ms)
  - `unhealthy`: Critical systems down
- `database.connected`: Boolean indicating database connection status
- `database.responseTime`: Database query response time in milliseconds
- `database.error`: Error message if connection failed (optional)
- `memory.used`: Heap memory used in MB
- `memory.total`: Total heap memory in MB
- `memory.percentage`: Memory usage percentage (0-100)
- `version`: API version

---

## Testing

### cURL Examples

```bash
# Basic health check
curl http://localhost:4000/api/v1/health

# Detailed health check
curl http://localhost:4000/api/v1/health/detailed

# Pretty print with jq
curl -s http://localhost:4000/api/v1/health/detailed | jq
```

### Expected Response Times
- Basic health check: < 50ms
- Detailed health check: < 100ms
- Database query: < 50ms (healthy), > 1000ms (degraded)

---

## Use Cases

1. **Load Balancer Health Checks**: Use basic endpoint
2. **Monitoring & Alerting**: Use detailed endpoint
3. **CI/CD Pipeline**: Verify deployment success
4. **Docker Health Check**: Add to docker-compose.yml
5. **Kubernetes Probes**: Liveness and readiness probes
