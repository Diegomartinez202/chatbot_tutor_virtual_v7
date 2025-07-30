// ✅ Test: Componente UserForm
// 🧪 Verifica que los inputs funcionen y se pueda enviar el formulario

import { render, screen, fireEvent } from "@testing-library/react";
import UserForm from "../components/UserForm";

test("🧾 Renderiza inputs y permite envío de datos correctamente", () => {
    const mockSubmit = jest.fn();

    // 🧱 Render del componente con la función simulada
    render(<UserForm onSubmit={mockSubmit} />);

    // ✍️ Simula escritura en los campos
    fireEvent.change(screen.getByPlaceholderText("Nombre"), {
        target: { value: "Daniel" },
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "daniel@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
        target: { value: "12345678" },
    });

    fireEvent.change(screen.getByDisplayValue("usuario"), {
        target: { value: "admin" },
    });

    // ✅ Simula clic en "Crear"
    fireEvent.click(screen.getByText("Crear"));

    // 🧾 Asegura que los datos hayan sido enviados correctamente
    expect(mockSubmit).toHaveBeenCalledWith({
        nombre: "Daniel",
        email: "daniel@test.com",
        password: "12345678",
        rol: "admin",
    });
});