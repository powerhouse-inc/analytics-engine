import { GroupedPeriodResults } from "./AnalyticsDiscretizer";
import { AnalyticsQuery } from "./AnalyticsQuery";

export interface IAnalyticsCache {
  get(query: AnalyticsQuery): Promise<GroupedPeriodResults | null>;
  set(query: AnalyticsQuery, expirySecs?: number): void;
}
