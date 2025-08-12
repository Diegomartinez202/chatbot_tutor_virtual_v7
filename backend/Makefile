helpdesk-test:
	@echo "🔎 Probando creación de ticket en Helpdesk..."
	curl -X POST "$(HELPDESK_WEBHOOK)" \
		-H "Content-Type: application/json" \
		$(if $(HELPDESK_TOKEN),-H "Authorization: Bearer $(HELPDESK_TOKEN)",) \
		-d '{"name":"Test desde Makefile","email":"demo@example.com","subject":"Prueba rápida","message":"Esto es un ticket de prueba","conversation_id":"makefile-test"}'