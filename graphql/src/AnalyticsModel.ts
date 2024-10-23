import {
  AnalyticsQueryEngine,
  AnalyticsGranularity,
  AnalyticsQuery,
  AnalyticsPath,
} from "@powerhouse/analytics-engine-core";
import { DateTime } from "luxon";

export type queryFilter = {
  start?: Date;
  end?: Date;
  granularity?: string;
  metrics: string[];
  dimensions: [Record<string, string>];
  currency?: string;
};

type CurrencyConversion = {
  metric: string;
  sourceCurrency: string;
};

type MultiCurrencyFilter = queryFilter & {
  conversions: CurrencyConversion[];
};

export class AnalyticsModel {
  constructor(public readonly engine: AnalyticsQueryEngine) {
    //
  }

  public async query(filter: queryFilter) {
    if (!filter) {
      return [];
    }

    const query: AnalyticsQuery = {
      start: filter.start ? DateTime.fromJSDate(filter.start) : null,
      end: filter.end ? DateTime.fromJSDate(filter.end) : null,
      granularity: getGranularity(filter.granularity),
      metrics: filter.metrics,
      currency: getCurrency(filter.currency),
      select: {},
      lod: {},
    };

    if (filter.dimensions.length < 1) {
      throw new Error("No dimensions provided");
    } else {
      filter.dimensions.forEach((dimension) => {
        query.select[dimension.name] = [
          AnalyticsPath.fromString(dimension.select),
        ];
        query.lod[dimension.name] = Number(dimension.lod);
      });
    }
    return this.engine.execute(query);
  }

  public async multiCurrencyQuery(filter: MultiCurrencyFilter) {
    if (!filter) {
      return [];
    }

    const query: AnalyticsQuery = {
      start: filter.start ? DateTime.fromJSDate(filter.start) : null,
      end: filter.end ? DateTime.fromJSDate(filter.end) : null,
      granularity: getGranularity(filter.granularity),
      metrics: filter.metrics,
      currency: getCurrency(filter.currency),
      select: {},
      lod: {},
    };

    if (filter.dimensions.length < 1) {
      throw new Error("No dimensions provided");
    } else {
      filter.dimensions.forEach((dimension) => {
        query.select[dimension.name] = [
          AnalyticsPath.fromString(dimension.select),
        ];
        query.lod[dimension.name] = Number(dimension.lod);
      });
    }
    return this.engine.executeMultiCurrency(query, {
      targetCurrency: query.currency,
      conversions: filter.conversions.map((c) => {
        return {
          metric: c.metric,
          currency: getCurrency(c.sourceCurrency),
        };
      }),
    });
  }

  public async getDimensions() {
    return await this.engine.getDimensions();
  }
}

export default (engine: AnalyticsQueryEngine) => new AnalyticsModel(engine);

const getGranularity = (
  granularity: string | undefined
): AnalyticsGranularity => {
  switch (granularity) {
    case "hourly": {
      return AnalyticsGranularity.Hourly;
    }
    case "daily": {
      return AnalyticsGranularity.Daily;
    }
    case "weekly": {
      return AnalyticsGranularity.Weekly;
    }
    case "monthly": {
      return AnalyticsGranularity.Monthly;
    }
    case "quarterly": {
      return AnalyticsGranularity.Quarterly;
    }
    case "semiAnnual": {
      return AnalyticsGranularity.SemiAnnual;
    }
    case "annual": {
      return AnalyticsGranularity.Annual;
    }
    case "total": {
      return AnalyticsGranularity.Total;
    }
    default: {
      return AnalyticsGranularity.Total;
    }
  }
};

const getCurrency = (currency: string | undefined) => {
  return currency
    ? AnalyticsPath.fromString(currency)
    : AnalyticsPath.fromString("");
};
