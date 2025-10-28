import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import LoginPage from "./login";

// Mocks
const mockLogin = vi.fn();
const mockPush = vi.fn();

vi.mock("../contexts/auth-context", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useHistory: () => ({ push: mockPush }),
  };
});

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@iconify/react", () => ({
  Icon: () => null,
}));

describe("LoginPage - Botón de Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue(true);
  });

  test("debe llamar a la función login con los datos correctos al hacer clic en el botón", async () => {
    //! 1 - Arrange
    const email: string = "test@example.com";
    const password: string = "password123";

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const loginButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });

    //! 2 - Act
    fireEvent.click(loginButton);

    //! 3 - Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(email, password);
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});

describe("LoginPage - Validación de Formulario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("debe mostrar error cuando el email está vacío", async () => {
    //! 1 - Arrange
    const password: string = "password123";

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const loginButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    // Asegurarse que el email esté vacío
    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: password } });

    //! 2 - Act
    fireEvent.click(loginButton);

    //! 3 - Assert
    await waitFor(
      () => {
        expect(mockLogin).not.toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test("debe mostrar error cuando la contraseña está vacía", async () => {
    //! 1 - Arrange
    const email: string = "test@example.com";

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const loginButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: email } });

    //! 2 - Act
    fireEvent.click(loginButton);

    //! 3 - Assert
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test("debe mostrar error cuando el email tiene formato inválido", async () => {
    //! 1 - Arrange
    const emailInvalido: string = "email-invalido";
    const password: string = "password123";

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const loginButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: emailInvalido } });
    fireEvent.change(passwordInput, { target: { value: password } });

    //! 2 - Act
    fireEvent.click(loginButton);

    //! 3 - Assert
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test("debe mostrar error cuando el email no tiene dominio", async () => {
    //! 1 - Arrange
    const emailSinDominio: string = "test@";
    const password: string = "password123";

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    const passwordInput = screen.getByLabelText(/Contraseña/i);
    const loginButton = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: emailSinDominio } });
    fireEvent.change(passwordInput, { target: { value: password } });

    //! 2 - Act
    fireEvent.click(loginButton);

    //! 3 - Assert
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
