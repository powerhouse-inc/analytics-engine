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

it("it should ignore trailing slashes in both subscription and notification paths", () => {
  const subscriptions = new AnalyticsSubscriptionManager();

  // Test that a subscription to /a/ matches /a
  let aCalled = 0;
  subscriptions.subscribeToPath(AnalyticsPath.fromString("/a/"), (source) => {
    aCalled++;
  });

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a")]);

  expect(aCalled).toBe(1);

  // Test that a subscription to /b matches /b/
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

it("unsubscribing should remove only the relevant subscription", () => {
  const subscriptions = new AnalyticsSubscriptionManager();

  let firstCalled = 0;
  let secondCalled = 0;

  const firstUnsub = subscriptions.subscribeToPath(
    AnalyticsPath.fromString("/a"),
    () => {
      firstCalled++;
    }
  );

  subscriptions.subscribeToPath(AnalyticsPath.fromString("/a"), () => {
    secondCalled++;
  });

  firstUnsub();

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a")]);

  expect(firstCalled).toBe(0);
  expect(secondCalled).toBe(1);
});

it("notifying a child path should notify parent paths", () => {
  const subscriptions = new AnalyticsSubscriptionManager();

  let called = 0;
  subscriptions.subscribeToPath(AnalyticsPath.fromString("/a/b"), () => {
    called++;
  });

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a/b/c/d")]);

  expect(called).toBe(1);

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a/b/c")]);

  expect(called).toBe(2);

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a/b")]);

  expect(called).toBe(3);
});

it("notifying a parent path should not notify child paths", () => {
  const subscriptions = new AnalyticsSubscriptionManager();

  let called = 0;
  subscriptions.subscribeToPath(AnalyticsPath.fromString("/a/b/c"), () => {
    called++;
  });

  subscriptions.notifySubscribers([AnalyticsPath.fromString("/a/b")]);

  expect(called).toBe(0);
});
