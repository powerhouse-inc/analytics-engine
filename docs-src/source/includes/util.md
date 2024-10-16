# Utilities

This section describes various utility objects.

## SqlQueryLogger and SqlResultsLogger

The `SqlQueryLogger` type defines a synchronous interface for logging out SQL queries, while `SqlResultsLogger` provides the same for raw results. These can be very useful for debugging or understanding what queries are actually generated from top level Typescript objects.

These types are used frequently in multiple `IAnalyticsStore` implementations, such as `KnexAnalyticsStore`, `PostgresAnalyticStore`, `MemoryAnalyticsStore`, and `BrowserAnalyticsStore`. Generally, they are optional inputs into the constructor.

> Create your own query logger.

```typescript
const queryLogger = (index, query) => console.log(`[Q:${index}] ${query}`);

const store = new MemoryAnalyticsStore(queryLogger);
```

> You may also create a results logger. Since queries are asynchronous operations, indices match between query and results functions.

```typescript
const queryLogger = (index, query) => console.log(`[Q:${index}] ${query}`);
const resultsLogger = (index, results) =>
  console.log(`[R:${index}] ${JSON.stringify(results)}`);

const store = new MemoryAnalyticsStore(queryLogger, resultsLogger);
```

More commonly, you can use the included utility functions, `defaultQueryLogger` and `defaultResultsLogger`. These functions append a tag to each log.

```typescript
const store = new MemoryAnalyticsStore(
  defaultQueryLogger("memory"),
  defaultResultsLogger("memory")
);
```

## AnalyticsProfiler
