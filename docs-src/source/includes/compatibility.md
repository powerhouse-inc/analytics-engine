# Compatibility

<aside class="notice">
This guide is intended for making high level decisions about which storage systems to use in which contexts. These stores have not been tested across thousands of browser or serverside runtime versions.
</aside>

| Store                             | Browser | Node | Bun |
| --------------------------------- | ------- | ---- | --- |
| `MemoryAnalyticsStore`            | X       | X    | X   |
| `MemoryAnalyticsStore` with `idb` | X       |      |     |
| `KnexAnalyticsStore`              | X       | X    | X   |
| `PostgresAnalyticsStore`          |         | X    | X   |