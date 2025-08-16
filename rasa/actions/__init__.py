# rasa/actions/__init__.py

try:
    from .actions import (
        ActionEnviarCorreo,
        ActionConectarHumano,
        ActionEnviarSoporte,
        ValidateSoporteForm,
        ValidateRecoveryForm,
    )
except Exception:
    # Si aún no existen esas clases/archivo, no romper el import del paquete.
    pass