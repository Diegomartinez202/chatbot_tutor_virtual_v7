ort smtplib
from email.mime.text import MIMEText
from config import SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, EMAIL_TO

def enviar_correo(asunto, cuerpo, destinatario=EMAIL_TO):
    try:
        mensaje = MIMEText(cuerpo, "plain")
        mensaje["Subject"] = asunto
        mensaje["From"] = EMAIL_FROM
        mensaje["To"] = destinatario

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(EMAIL_FROM, destinatario, mensaje.as_string())

        print("✅ Correo enviado correctamente.")
        return True

    except Exception as e:
        print(f"❌ Error al enviar el correo: {e}")
        return False