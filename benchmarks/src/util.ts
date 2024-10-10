export const queryLogger = (tag: string) => (index: number, query: string) => {
  console.log(`[${tag}][Q:${index}]: ${query}\n`);
};

export const resultsLogger = (tag: string) => (index: number, results: any) => {
  if (Array.isArray(results)) {
    console.log(`[${tag}][R:${index}]: ${results.length} results\n`);
  } else {
    console.log(`[${tag}][R:${index}]: Received ${typeof results}.\n`);
  }
};

interface FnOptions {
  beforeAll?: () => void | Promise<void>;
  beforeEach?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
}

export const logs = (name: string, opts?: FnOptions) => ({
  beforeEach: () => {
    console.log(`Starting run of ${name}...`);

    if (opts?.beforeEach) {
      return opts.beforeEach();
    }
  },
  afterAll: () => {
    console.log(`Finished all runs of ${name}.`);

    if (opts?.afterAll) {
      return opts.afterAll();
    }
  },
});
