import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ImgBedForm } from "./ImgBedForm";

vi.mock("@heroui/react", () => ({
  Input: ({
    label,
    value,
    onValueChange,
    type,
  }: {
    label: string;
    value: string;
    onValueChange: (v: string) => void;
    type?: string;
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        value={value}
        type={type}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </label>
  ),
  Select: ({
    label,
    children,
    onSelectionChange,
  }: {
    label: string;
    children: React.ReactNode;
    onSelectionChange: (s: Set<string>) => void;
  }) => (
    <label>
      {label}
      <select
        aria-label={label}
        onChange={(e) => onSelectionChange(new Set([e.target.value]))}
      >
        {children}
      </select>
    </label>
  ),
  SelectItem: ({
    children,
    textValue,
  }: {
    children: React.ReactNode;
    textValue: string;
  }) => <option value={textValue}>{children}</option>,
}));
vi.mock("./StorageSecretField", () => ({
  StorageSecretField: ({
    label,
    value,
    onValueChange,
  }: {
    label: string;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <label>
      {label}
      <input
        type="password"
        aria-label={label}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </label>
  ),
}));

it("configures the endpoint and masked server-side token", () => {
  const change = vi.fn();
  render(
    <ImgBedForm
      form={{
        type: "imgbed",
        server: "https://img.thpvip.xyz",
        secret_key: "********",
        settings: { upload_method: "server", upload_channel: "s3" },
      }}
      onChange={change}
    />,
  );
  expect(screen.getByLabelText("API Token")).toHaveAttribute(
    "type",
    "password",
  );
  fireEvent.change(screen.getByLabelText("图床地址"), {
    target: { value: "https://images.example.com" },
  });
  expect(change).toHaveBeenLastCalledWith(
    expect.objectContaining({
      server: "https://images.example.com",
      secret_key: "********",
    }),
  );
  fireEvent.change(screen.getByLabelText("渠道名称（可选）"), {
    target: { value: "blog-bucket" },
  });
  expect(change).toHaveBeenLastCalledWith(
    expect.objectContaining({
      settings: expect.objectContaining({
        upload_method: "server",
        upload_channel: "s3",
        channel_name: "blog-bucket",
      }),
    }),
  );
});
