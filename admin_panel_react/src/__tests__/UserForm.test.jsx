import { render, screen, fireEvent } from "@testing-library/react";
import UserForm from "../components/UserForm";

test("renderiza inputs y permite envío", () => {
    const mockSubmit = jest.fn();

    render(<UserForm onSubmit={mockSubmit} />);

    fireEvent.change(screen.getByPlaceholderText("Nombre"), { target: { value: "Daniel" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "daniel@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByDisplayValue("usuario"), { target: { value: "admin" } });

    fireEvent.click(screen.getByText("Crear"));

    expect(mockSubmit).toHaveBeenCalledWith({
        nombre: "Daniel",
        email: "daniel@test.com",
        password: "12345678",
        rol: "admin"
    });
});