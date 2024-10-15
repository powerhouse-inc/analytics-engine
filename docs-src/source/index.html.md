---
title: Powerhouse Analytics Engine

language_tabs: # must be one of https://github.com/rouge-ruby/rouge/wiki/List-of-supported-languages-and-lexers
  - typescript
  - graphql

toc_footers:
  - Part of the <a href='https://powerhouse.inc' target='_blank'>Powerhouse</a> toolkit.
  - Find us on <a href='https://x.com/PowerhouseDAO' target='_blank'>X</a>!

includes:
  - pg
  - memory
  - compatibility

search: true

code_clipboard: true

meta:
  - name: description
    content: Documentation for the Powerhouse Analytics Engine.
---

# Introduction

Welcome to the Powerhouse Analytics Engine API. This engine is a powerful, distributed, time-series analytics system, written in Typescript. It is designed to run anywhere: from browsers, to server environments, or even in embedded systems.

This documentation serves as a guide for API usage, not library development. For documentation on how to contribute to this project, see our [README](https://github.com/powerhouse-inc/analytics-engine/blob/main/README.md).

# Quickstart

While this analytics engine is highly flexible, it is also extremely simple to get started.

## Insert Data

The `IAnalyticsStore` object is the primary entry point for inserting and deleting metrics data. Multiple storage implementations are provided, but for simplicity we can get up and running quickly with the [`MemoryAnalyticsStore`](#memoryanalyticsstore).

```typescript
import { MemoryStorageEngine } from "@powerhouse/analytics-engine-memory";

const store = new MemoryStorageEngine();
```

Data can be added using the `addSeriesValue` method.

> Note that we use the [`luxon` library](https://moment.github.io/luxon/#/) in our API for immutable, time-zone aware data types.

```typescript
import { DateTime } from "luxon";
import { AnalyticsPath } from "@powerhouse/analytics-engine-core";

const source = AnalyticsPath.fromString("example/insert");
await store.addSeriesValue([
  {
    start: DateTime.utc(2021, 1, 1),
    source,
    value: 10000,
    unit: "DAI",
    metric: "budget",
    dimensions: {
      budget: AnalyticsPath.fromString("atlas/legacy/core-units/PE-001"),
      category: AnalyticsPath.fromString(
        "atlas/headcount/CompensationAndBenefits/FrontEndEngineering"
      ),
      project: source,
    },
  },
]);
```

## AnalyticsQueryEngine

The entry point into the analytics engine is the `AnalyticsQueryEngine`. This object exposes an interface for inserting, querying, and deleting metric data.

### Create

This object should be created on top of a storage engine. In this example, we create a simple in-memory storage engine which is compatible with all platforms.

```typescript
import { AnalyticsQueryEngine } from "@powerhouse/analytics-core";
import { MemoryStorageEngine } from "@powerhouse/analytics-memory";

const engine = new AnalyticsQueryEngine(new MemoryStorageEngine());
```

### Add Data

Metric data can be added
