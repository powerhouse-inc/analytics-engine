# MemoryAnalyticsStore

The `MemoryAnalyticsStore` is an `IAnalyticsStore` implementation that uses a an in-memory database as its storage mechanism. Under the hood, we load a WASM build of SQLite3. There is also an option to use an `IndexedDB` plugin for persistence.

<aside class="notice">
Please note that while the in-memory database may be used in server environments, the IndexedDB plugin is intended for browsers. See the <a href="#compatibility">Compatibility</a> section for details on which stores are intended for different environments.
</aside>

## Construction

The `MemoryAnalyticsStore` may be created with optional contructor arguments that may be helpful for debugging or metrics collection.

> Create with no arguments.

```typescript
const store = new MemoryAnalyticsStore();
```

> Optionally, you may provide a function executed for every query. This is typically a logger.

```typescript
const queryLogger = (index, query) => console.log(`[Q:${index}] ${query}`);
const store = new MemoryAnalyticsStore(queryLogger);
```

> You may also provide a function executed for every result. Since these are asynchronous operations, indices match between query and results functions.

```typescript
const queryLogger = (index, query) => console.log(`[Q:${index}] ${query}`);
const resultsLogger = (index, results) =>
  console.log(`[R:${index}] ${JSON.stringify(results)}`);

const store = new MemoryAnalyticsStore(queryLogger, resultsLogger);
```

## Initialization

While easy to use, the `MemoryAnalyticsStore` requires an asynchronous initialization step. This is for two reasons. For one, it needs time to download and initialize the WASM build of SQLite. This download is fairly small (~1 MB). Additionally, it also needs to initialize the database schema of the in-memory database. This is distinct from the <a href="#postgresanalyticsstore">Postgres implementation</a>, which assumes a fully-initialized Postgres database already exists.

> Note that this method is not available on the `IAnalyticsStore` interface, but only on the `MemoryAnalyticsStore` type.

```typescript
// create the store
const store = new MemoryAnalyticsStore();

// initialize it
await store.init();
```

## Browser Persistence

For implementation simplicity, the "memory" store also provides a plugin for browser persistence via `IndexedDB`. This can be switched on via the initialization options.

```typescript
await store.init({
  type: MemoryStoreType.IDB,
  idbName: "my-analytics",
});
```

The `idbName` essentially namespaces the database. This allows users to create multiple stores, if needed, which will not conflict with each other. You can use your browser's developer tools to see these databases, usually through the "Storage" tab..

<aside class="notice">
While manipulating the data manually is not recommended, this allows you to easily delete and recreate databases if needed.
</aside>

![dev-tools](./images/indexeddb.png)

The store interface is intended to be immutable, meaning that it does not provide a general method of wiping a DB. However, an IDB database may be deleted via the standard [IDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

```typescript
// creates the database
await store.init({
  type: MemoryStoreType.IDB,
  idbName: "my-analytics",
});

// deletes the database
window.indexedDB.deleteDatabase("my-analytics");
```
