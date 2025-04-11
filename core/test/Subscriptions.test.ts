import { it, expect } from "vitest";
import { AnalyticsPath } from "../src/AnalyticsPath";
import { AnalyticsSubscriptionManager } from "../src/AnalyticsSubscriptionManager";

it("it should allow subscribing to a source with an explicit match", () => {
  const subscriptions = new AnalyticsSubscriptionManager();

  let called = 0;
  const unsubscribe = subscriptions.subscribeToPath(
    AnalyticsPath.fromString("/a"),
    (source) => {
      called++;
    }
  );

  expect(unsubscribe).toBeDefined();
  expect(called).toBe(0);

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a")]);

  expect(called).toBe(1);
});

it("it should remove trailing slashes from the source path", () => {
  const subscriptions = new AnalyticsSubscriptionManager();

  let called = 0;
  subscriptions.subscribeToPath(AnalyticsPath.fromString("/a/"), (source) => {
    called++;
  });

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a")]);

  expect(called).toBe(1);

  let bCalled = 0;
  subscriptions.subscribeToPath(AnalyticsPath.fromString("/b"), (source) => {
    bCalled++;
  });

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/b/")]);

  expect(bCalled).toBe(1);
});

it("unsubscribing should remove the subscription", () => {
  const subscriptions = new AnalyticsSubscriptionManager();

  let called = 0;
  const unsubscribe = subscriptions.subscribeToPath(
    AnalyticsPath.fromString("/a"),
    () => {
      called++;
    }
  );

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a")]);

  expect(called).toBe(1);

  unsubscribe();

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a")]);

  expect(called).toBe(1);
});
