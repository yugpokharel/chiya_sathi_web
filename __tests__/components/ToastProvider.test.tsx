/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "@/components/ToastProvider";

function TestConsumer() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast("Info toast")}>Info</button>
      <button onClick={() => toast("Success toast", "success")}>Success</button>
      <button onClick={() => toast("Error toast", "error")}>Error</button>
    </div>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe("ToastProvider", () => {
  it("renders children", () => {
    render(
      <ToastProvider>
        <p>child</p>
      </ToastProvider>
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("shows an info toast", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await user.click(screen.getByText("Info"));
    expect(screen.getByText("Info toast")).toBeInTheDocument();
  });

  it("shows a success toast with green styling", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await user.click(screen.getByText("Success"));
    const toast = screen.getByText("Success toast");
    expect(toast.closest("div")).toHaveClass("bg-green-600");
  });

  it("shows an error toast with red styling", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await user.click(screen.getByText("Error"));
    const toast = screen.getByText("Error toast");
    expect(toast.closest("div")).toHaveClass("bg-red-600");
  });

  it("auto-dismisses after 4 seconds", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await user.click(screen.getByText("Info"));
    expect(screen.getByText("Info toast")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4100);
    });

    expect(screen.queryByText("Info toast")).not.toBeInTheDocument();
  });

  it("dismisses when clicking the × button", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    await user.click(screen.getByText("Info"));
    expect(screen.getByText("Info toast")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Dismiss"));
    expect(screen.queryByText("Info toast")).not.toBeInTheDocument();
  });
});

describe("useToast outside provider", () => {
  it("returns noop toast function", () => {
    function Naked() {
      const { toast } = useToast();
      toast("test");
      return <p>ok</p>;
    }
    render(<Naked />);
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});
