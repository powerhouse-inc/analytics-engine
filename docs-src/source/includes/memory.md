# Memory

The `MemoryAnalyticsStore` is an `IAnalyticsStore` implementation that uses a an in-memory database as its storage mechanism. Under the hood, we load a WASM build of SQLite3.

<aside class="notice">
See the <a href="#compatibility">Compatibility</a> section for details on which stores are intended to be used in different execution environments.
</aside>

## Construction

The `MemoryAnalyticsStore` is simple to create.

> Create with no arguments.

```typescript
const store = new MemoryAnalyticsStore();
```

> The `MemoryAnalyticsStore` may also be created with optional contructor arguments that may be helpful for debugging or metrics collection.

```typescript
const store = new MemoryAnalyticsStore(
  defaultQueryLogger("memory"),
  defaultResultsLogger("memory"),
  new PassthroughAnalyticsProfiler()
);
```

For more details on these optional constructor parameters, see the [Utilities](#utilities) section.

## Initialization

While easy to use, the `MemoryAnalyticsStore` requires an asynchronous initialization step. This is for two reasons. For one, it needs time to download and initialize the WASM build of SQLite. This download is fairly small (~1 MB). Additionally, it also needs to initialize the database schema of the in-memory database. This is distinct from the <a href="#postgres">Postgres implementation</a>, which assumes a fully-initialized Postgres database already exists.

> Note that this method is not available on the `IAnalyticsStore` interface, but only on the `MemoryAnalyticsStore` type.

```typescript
// create the store
const store = new MemoryAnalyticsStore();

// initialize it
await store.init();
```
