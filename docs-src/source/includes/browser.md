# BrowserAnalyticsStore

The `BrowserAnalyticsStore` is an `IAnalyticsStore` implementation that sits on top of [`MemoryAnalyticsStore`](#memoryanalyticsstore) but adds an `IndexedDB` plugin for persistence.

<aside class="notice">
See the <a href="#compatibility">Compatibility</a> section for details on which stores are intended to be used in different execution environments.
</aside>

## Construction

The `BrowserAnalyticsStore` requires a database name but may also be created with optional contructor arguments that may be helpful for debugging or metrics collection.

> Create with database name.

```typescript
const store = new BrowserAnalyticsStore("analytics");
```

> It may also be created with optional contructor arguments that may be helpful for debugging or metrics collection.

```typescript
const store = new BrowserAnalyticsStore(
  "analytics",
  defaultQueryLogger("browser"),
  defaultResultsLogger("browser"),
  new PassthroughAnalyticsProfiler()
);
```

For more details on these optional constructor parameters, see the [Utilities](#utilities) section.

## Initialization

Similar to the [`MemoryAnalyticsStore`](#memoryanalyticsstore), this implementation requires an asynchronous initialization step.

> Note that this method is not available on the `IAnalyticsStore` interface, but only on the concrete type.

```typescript
// create the store
const store = new BrowserAnalyticsStore("analytics");

// initialize it
await store.init();
```

## Persistence

The `databaseName` constructor argument essentially namespaces the database. This allows users to create multiple stores, if needed, which will not conflict with each other. You can use your browser's developer tools to see these databases, usually through the "Storage" tab.

<aside class="notice">
While manipulating the data manually is not recommended, this allows you to easily delete and recreate databases if needed.
</aside>

![dev-tools](./images/indexeddb.png)

The store interface is intended to be immutable, meaning that it does not provide a general method of wiping a DB. However, an IDB database may be deleted via the standard [IDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API).

```typescript
// creates the database
const store = new BrowserAnalyticsStore("my-analytics");
await store.init();

// deletes the database
window.indexedDB.deleteDatabase("my-analytics");
```
