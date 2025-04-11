import { AnalyticsPath } from "./AnalyticsPath";
import { AnalyticsUpdateCallback } from "./IAnalyticsStore";

export class AnalyticsSubscriptionManager {
  private _subscriptions: Map<string, Set<AnalyticsUpdateCallback>> = new Map();

  /**
   * Normalizes a path string to ensure consistent comparison
   * Removes any trailing slashes and ensures it starts with a slash
   */
  private normalizePath(path: string): string {
    // Handle potential double slashes by first splitting on slashes and rejoining
    const parts = path.split("/").filter((p) => p.length > 0);
    let normalized = "/" + parts.join("/");
    return normalized;
  }

  /**
   * Subscribe to updates for an analytics path.
   *
   * @param path The analytics path to subscribe to
   * @param callback Function to be called when the path is updated
   * @returns A function that, when called, unsubscribes from the updates
   */
  public subscribeToPath(
    path: AnalyticsPath,
    callback: AnalyticsUpdateCallback
  ): () => void {
    const pathString = this.normalizePath(path.toString("/"));

    if (!this._subscriptions.has(pathString)) {
      this._subscriptions.set(pathString, new Set());
    }

    this._subscriptions.get(pathString)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this._subscriptions.get(pathString);
      if (callbacks) {
        callbacks.delete(callback);
        // Remove the path entry if there are no more callbacks
        if (callbacks.size === 0) {
          this._subscriptions.delete(pathString);
        }
      }
    };
  }

  /**
   * Notifies subscribers about updates to paths
   * @param paths The paths that were updated
   */
  public notifySubscribers(paths: AnalyticsPath[]): void {
    if (paths.length === 0 || this._subscriptions.size === 0) {
      return;
    }

    // Process each source
    for (const path of paths) {
      const pathString = this.normalizePath(path.toString("/"));

      // Find all source prefixes that should receive notifications
      // For a source '/a/b/c', we need to notify subscribers of '/a', '/a/b', and '/a/b/c'
      const pathPrefixes = this.getPathPrefixes(pathString);

      // Get relevant subscribers for this source
      const relevantSubscriptions = pathPrefixes
        .filter((prefix) => this._subscriptions.has(prefix))
        .map((prefix) => ({
          prefix,
          callbacks: this._subscriptions.get(prefix)!,
        }));

      if (relevantSubscriptions.length === 0) continue;

      // Notify all relevant subscribers
      for (const { callbacks } of relevantSubscriptions) {
        for (const callback of callbacks) {
          callback(path);
        }
      }
    }
  }

  /**
   * Gets all path prefixes for a given path.
   *
   * For example, for '/a/b/c' it returns ['/a', '/a/b', '/a/b/c'].
   */
  private getPathPrefixes(path: string): string[] {
    const segments = path.split("/").filter((s) => s.length > 0);
    const prefixes: string[] = [];

    let currentPath = "";
    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : `/${segment}`;
      prefixes.push(currentPath);
    }

    // Handle the root case if needed
    if (prefixes.length === 0 && path === "/") {
      prefixes.push("/");
    }

    return prefixes;
  }
}
