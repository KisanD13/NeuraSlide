import { describe, test, expect } from "@jest/globals";

describe("Example Test Suite", () => {
  test("should pass a simple test", () => {
    expect(1 + 1).toBe(2);
  });

  test("should handle string operations", () => {
    expect("hello" + " world").toBe("hello world");
  });

  test("should work with arrays", () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
