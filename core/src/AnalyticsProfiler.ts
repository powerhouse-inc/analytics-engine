export interface IAnalyticsProfiler {
  get prefix(): string;

  push: (system: string) => void;
  pop: () => void;

  record: (metric: string, fn: () => Promise<any>) => Promise<any>;
}

export class AnalyticsProfiler implements IAnalyticsProfiler {
  private readonly _stack: string[] = [];
  private _prefix: string = "";

  constructor(
    private readonly _ns: string,
    private readonly _logger: (metricName: string, ms: number) => void
  ) {
    this._prefix = _ns;
  }

  get prefix(): string {
    return this._prefix;
  }

  push(system: string): void {
    this._stack.push(system);

    this.updatePrefix();
  }

  pop(): void {
    if (this._stack.pop()) {
      this.updatePrefix();
    }
  }

  async record(metric: string, fn: () => Promise<any>): Promise<any> {
    const start = Date.now();
    const fullMetric = `${this.prefix}.${metric}`;

    try {
      return await fn();
    } finally {
      this._logger(fullMetric, Date.now() - start);
    }
  }

  updatePrefix(): void {
    if (this._stack.length > 0) {
      this._prefix = `${this._ns}.${this._stack.join(".")}`;
    } else {
      this._prefix = this._ns;
    }
  }
}
