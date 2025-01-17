export const typedefs = `
type AnalyticsQuery {
  series(filter: AnalyticsFilter): [AnalyticsPeriod]
  multiCurrencySeries(filter: MultiCurrencyConversions): [AnalyticsPeriod]
  metrics: [String]
  dimensions: [Dimension]
  currencies: [String]
}

type AnalyticsPeriod {
  period: String
  start: DateTime
  end: DateTime
  rows: [AnalyticsSeries]
}

type AnalyticsSeries {
  dimensions: [AnalyticsSeriesDimension]
  metric: String
  unit: String
  value: Float
  sum: Float
}

type AnalyticsSeriesDimension {
  name: String
  path: String
  label: String
  description: String
  icon: String
}

type Dimension {
  name: String
  values: [Value]
}

type Value {
  path: String
  label: String
  description: String
  icon: String
}

enum AnalyticsGranularity {
  hourly
  daily
  weekly
  monthly
  quarterly
  semiAnnual
  annual
  total
}

input AnalyticsFilterDimension {
  name: String!
  select: String!
  lod: Int!
}

input MultiCurrencyConversions {
  start: String
  end: String
  "Period to group by"
  granularity: AnalyticsGranularity
  "List of metrics to filter by, such as 'budget' or 'actuals'"
  metrics: [String]
  "List of dimensions to filter by, such as 'budget' or 'project'"
  dimensions: [AnalyticsFilterDimension]
  currency: String
  conversions: [CurrencyConversion]!
}

input CurrencyConversion {
  metric: String!
  sourceCurrency: String!
}

input AnalyticsFilter {
  start: String
  end: String
  "Period to group by"
  granularity: AnalyticsGranularity
  "List of metrics to filter by, such as 'budget' or 'actuals'"
  metrics: [String]
  "List of dimensions to filter by, such as 'budget' or 'project'"
  dimensions: [AnalyticsFilterDimension]
  currency: String
}

extend type Query {
  analytics: AnalyticsQuery
}
`;
