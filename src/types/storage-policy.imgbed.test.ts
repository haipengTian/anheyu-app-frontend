import { expect, it } from "vitest";
import {
  STORAGE_TYPES,
  STORAGE_TYPE_LABELS,
  isStoragePolicyConfigured,
} from "./storage-policy";

it("offers our image bed in the storage selector", () => {
  expect(STORAGE_TYPES).toContain("imgbed");
  expect(STORAGE_TYPE_LABELS).toHaveProperty("imgbed", "我们的图床");
});

it("counts an image bed with a masked API token as configured", () => {
  expect(
    isStoragePolicyConfigured({
      type: "imgbed",
      secret_key: "********",
      access_key: "",
    }),
  ).toBe(true);
  expect(isStoragePolicyConfigured({ type: "imgbed", secret_key: "" })).toBe(
    false,
  );
  expect(isStoragePolicyConfigured({ type: "local" })).toBe(true);
  expect(
    isStoragePolicyConfigured({ type: "onedrive", access_key: "authorized" }),
  ).toBe(true);
  expect(isStoragePolicyConfigured({ type: "aws_s3", access_key: "key" })).toBe(
    false,
  );
});
