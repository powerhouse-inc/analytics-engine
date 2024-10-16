export type SqlQueryLogger = (index: number, query: string) => void;
export type SqlResultsLogger = (index: number, results: any) => void;

export const defaultQueryLogger =
  (tag: string): SqlQueryLogger =>
  (index: number, query: string) => {
    console.log(`[${tag}][Q:${index}]: ${query}\n`);
  };

export const defaultResultsLogger =
  (tag: string): SqlResultsLogger =>
  (index: number, results: any) => {
    if (Array.isArray(results)) {
      console.log(`[${tag}][R:${index}]: ${results.length} results\n`);
    } else {
      console.log(`[${tag}][R:${index}]: Received ${typeof results}.\n`);
    }
  };
