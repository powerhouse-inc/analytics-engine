import { IAnalyticsProfiler } from "@powerhouse/analytics-engine-core";
import {
  IKnexQueryExecutor,
  SqlQueryLogger,
  SqlResultsLogger,
} from "@powerhouse/analytics-engine-knex";
import { Knex } from "knex";

export class SQLiteQueryExecutor implements IKnexQueryExecutor {
  private _index: number = 0;
  private _sql: SQLiteAPI | null = null;
  private _db: number | null = null;

  constructor(
    private readonly _profiler: IAnalyticsProfiler,
    private readonly _queryLogger?: SqlQueryLogger,
    private readonly _resultsLogger?: SqlResultsLogger
  ) {
    //
  }

  init(sql: SQLiteAPI, db: number) {
    this._sql = sql;
    this._db = db;
  }

  async execute<T extends {}, U>(query: Knex.QueryBuilder<T, U>) {
    if (!this._sql || !this._db) {
      throw new Error("SQLiteQueryExecutor not initialized");
    }

    const raw = query.toString();
    const index = this._index++;

    if (this._queryLogger) {
      this._queryLogger(index, raw);
    }

    const results: any = [];
    await this._profiler.record(
      "Query",
      async () =>
        await this._sql!.exec(this._db!, raw, (row, col) => {
          const value: any = {};

          for (let i = 0; i < col.length; i++) {
            // todo: "reviver"
            const prop = col[i];
            let val: any = row[i];
            if (prop === "start" || prop === "end") {
              val = val ? new Date(val) : null;
            } else if (prop === "params") {
              val = JSON.parse(val);
            }

            value[prop] = val;
          }

          results.push(value);
        })
    );

    if (this._resultsLogger) {
      this._resultsLogger(index, results);
    }

    return results;
  }
}
