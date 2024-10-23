import {
  IAnalyticsProfiler,
  PassthroughAnalyticsProfiler,
} from "@powerhousedao/analytics-engine-core";
import {
  KnexAnalyticsStore,
  KnexQueryExecutor,
  SqlQueryLogger,
  SqlResultsLogger,
} from "@powerhousedao/analytics-engine-knex";
import knexFactory, { Knex } from "knex";
import pkg from "pg";
import { reviver } from "./AnalyticsSerializer.js";

const { types } = pkg;
types.setTypeParser(types.builtins.DATE, (value: string) => value);
types.setTypeParser(types.builtins.JSON, (value: string) => {
  return JSON.parse(value, reviver);
});

export class PostgresAnalyticsStore extends KnexAnalyticsStore {
  private readonly _postgres: Knex;
  private readonly _profiler: IAnalyticsProfiler;

  constructor(
    connectionString: string,
    queryLogger?: SqlQueryLogger,
    resultsLogger?: SqlResultsLogger,
    profiler?: IAnalyticsProfiler
  ) {
    const knex = knexFactory({
      client: "pg",
      connection: connectionString,
    });

    if (!profiler) {
      profiler = new PassthroughAnalyticsProfiler();
    }

    profiler.push("Pg");

    super(new KnexQueryExecutor(queryLogger, resultsLogger, profiler), knex);

    this._postgres = knex;
    this._profiler = profiler;
  }

  async raw(sql: string) {
    if (this._profiler) {
      return await this._profiler.record("QueryRaw", async () => {
        return await this._postgres.raw(sql);
      });
    }

    return await this._postgres.raw(sql);
  }
}
