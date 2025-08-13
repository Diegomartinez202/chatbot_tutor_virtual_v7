# 1. Usuario pide soporte
curl -sS -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"tester-001","message":"necesito soporte técnico"}'

# 2. Responder slot 'nombre'
curl -sS -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"tester-001","message":"Mi nombre es Daniel Martinez"}'

# 3. Responder slot 'email'
curl -sS -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"tester-001","message":"daniel.martinez010201@gmail.com"}'

# 4. Responder slot 'mensaje'
curl -sS -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"tester-001","message":"Pantalla blanca al abrir el curso de IA."}'
  # 1. Usuario llega por "ingreso_zajuna" → bot pregunta si quiere recuperar
curl -sS -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"tester-002","message":"quiero ingresar a zajuna"}'

# 2. Usuario confirma recuperación
curl -sS -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"tester-002","message":"recuperar contraseña"}'

# 3. Entrega el email (valida regex)
curl -sS -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"tester-002","message":"usuario+test@domain.io"}'