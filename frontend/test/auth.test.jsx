import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext";
import Signup from "../src/pages/Signup";
import Login from "../src/pages/Login";
import Profile from "../src/pages/Profile";
import * as api from "../src/services/api";

jest.mock("../src/services/api");

function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  jest.clearAllMocks();
  api.getMe.mockRejectedValue(new Error("no session"));
});

describe("Signup page", () => {
  it("renders the signup form", () => {
    renderWithProviders(<Signup />);
    expect(
      screen.getByRole("heading", { name: /create your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows a validation error when fields are missing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Signup />);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /all fields are required/i,
    );
    expect(api.signup).not.toHaveBeenCalled();
  });

  it("calls the signup API with form values", async () => {
    api.signup.mockResolvedValue({
      success: true,
      data: { id: "1", name: "Test User", email: "test@example.com" },
      token: "fake-token",
    });

    const user = userEvent.setup();
    renderWithProviders(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), "Test User");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});

describe("Login page", () => {
  it("renders the login form", () => {
    renderWithProviders(<Login />);
    expect(
      screen.getByRole("heading", { name: /log in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows a validation error when fields are missing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /email and password are required/i,
    );
    expect(api.login).not.toHaveBeenCalled();
  });

  it("shows the API error message on failed login", async () => {
    api.login.mockRejectedValue(new Error("Invalid email or password"));

    const user = userEvent.setup();
    renderWithProviders(<Login />);

    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /invalid email or password/i,
    );
  });
});

describe("Profile page", () => {
  const mockUser = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  it("shows the logged-in user's details", async () => {
    api.getMe.mockResolvedValue({ success: true, data: mockUser });
    window.localStorage.setItem("inkwell_token", "fake-token");

    renderWithProviders(<Profile />);

    expect(
      await screen.findByRole("heading", { name: /test user/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("lets the user edit their name only", async () => {
    api.getMe.mockResolvedValue({ success: true, data: mockUser });
    api.updateMe.mockResolvedValue({
      success: true,
      data: { ...mockUser, name: "Updated Name" },
    });
    window.localStorage.setItem("inkwell_token", "fake-token");

    const user = userEvent.setup();
    renderWithProviders(<Profile />);

    await screen.findByRole("heading", { name: /test user/i });
    await user.click(screen.getByRole("button", { name: /edit profile/i }));

    const nameInput = screen.getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(api.updateMe).toHaveBeenCalledWith({ name: "Updated Name" });
    });
  });

  it("does not render an editable email field", async () => {
    api.getMe.mockResolvedValue({ success: true, data: mockUser });
    window.localStorage.setItem("inkwell_token", "fake-token");

    const user = userEvent.setup();
    renderWithProviders(<Profile />);

    await screen.findByRole("heading", { name: /test user/i });
    await user.click(screen.getByRole("button", { name: /edit profile/i }));

    expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
    expect(screen.getAllByText("test@example.com").length).toBeGreaterThan(0);
  });

  it("logs the user out", async () => {
    api.getMe.mockResolvedValue({ success: true, data: mockUser });
    api.logout.mockResolvedValue({ success: true });
    window.localStorage.setItem("inkwell_token", "fake-token");

    const user = userEvent.setup();
    renderWithProviders(<Profile />);

    await screen.findByRole("heading", { name: /test user/i });
    await user.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => {
      expect(api.logout).toHaveBeenCalled();
    });
  });
});
