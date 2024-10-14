import knexFactory, { Knex } from "knex";
import pkg from "pg";
import { reviver } from "./AnalyticsSerializer.js";
import { KnexAnalyticsStore, IKnexQueryExecutor } from "@powerhouse/analytics-engine-knex";
import { IAnalyticsProfiler } from "@powerhouse/analytics-engine-core";

const { types } = pkg;
types.setTypeParser(types.builtins.DATE, (value: string) => value);
types.setTypeParser(types.builtins.JSON, (value: string) => {
  return JSON.parse(value, reviver);
});

export class KnexQueryExecutor implements IKnexQueryExecutor {
  private _index: number = 0;

  constructor(
    private readonly _profiler: IAnalyticsProfiler,
    private readonly _queryLogger?: (index: number, query: string) => void,
    private readonly _resultsLogger?: (index: number, results: any) => void
  ) {
    //
  }

  async execute<T extends {}, U>(
    query: knexFactory.Knex.QueryBuilder<T, U>
  ): Promise<any> {
    const index = this._index++;

    // profile the query
    return await this._profiler.record("AnalyticsQuery", async () => {
      if (this._queryLogger) {
        this._queryLogger(index, query.toString());
      }

      const results = await query;

      if (this._resultsLogger) {
        this._resultsLogger(index, results);
      }

      return results;
    });
  }
}

export class PostgresAnalyticsStore extends KnexAnalyticsStore {
  private readonly _postgres: Knex;

  constructor(connectionString: string, executor: IKnexQueryExecutor) {
    const knex = knexFactory({
      client: "pg",
      connection: connectionString,
    });

    super(executor, knex);

    this._postgres = knex;
  }

  async raw(sql: string) {
    return await this._postgres.raw(sql);
  }
}
