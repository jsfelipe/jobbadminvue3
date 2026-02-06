# Testar envio de e-mail no modal Aprovar pagamento

## Onde o e-mail é enviado

O envio de e-mail é feito pelo **backend** (API Laravel, ex.: jobb-api-v2). O frontend apenas:

1. Exibe a opção "Enviar e-mail?" e os campos (modelo de e-mail, e-mail do fornecedor, anexar pedido, etc.).
2. Valida antes de enviar: se "Enviar e-mail" = Sim, exige **e-mail do fornecedor** e **modelo de e-mail** preenchidos.
3. Envia no payload da aprovação (`/budget/payment-approve-save`) os campos: `email_enviar`, `email_fornecedor`, `selectedModelId`, `obs_email`, `anexo_email`, etc.

Quem dispara o e-mail é a API ao processar o `payment-approve-save`.

---

## Como testar localmente

### 1. Configurar o backend para não enviar e-mail de verdade

No projeto da API Laravel (jobb-api-v2), no `.env`:

**Opção A – Gravar e-mails em log (mais simples)**  
Assim você vê o conteúdo do e-mail no arquivo de log, sem SMTP:

```env
MAIL_MAILER=log
```

Os e-mails aparecem em `storage/logs/laravel.log` (ou no canal de log configurado).

**Opção B – Mailtrap (ver e-mail “enviado” na interface)**  
Crie uma conta em [mailtrap.io](https://mailtrap.io), crie uma inbox e use as credenciais no `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=seu_username
MAIL_PASSWORD=sua_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@seudominio.local
MAIL_FROM_NAME="${APP_NAME}"
```

Assim os e-mails ficam na inbox do Mailtrap e você pode abrir e conferir corpo e anexos.

**Opção C – Mailhog (Docker)**  
Se usar Docker, suba o Mailhog e aponte o Laravel para ele:

```env
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
```

Acesse a interface do Mailhog (ex.: `http://localhost:8025`) para ver os e-mails.

---

### 2. Garantir que a API retorna modelos de e-mail

O modal carrega os modelos de e-mail de duas formas:

- Pelo retorno de `getItensAprovacao` (campo `models_email`), ou  
- Pela chamada `GET /models/email` (serviço `listModelsEmail`).

Se a lista de modelos estiver vazia, o select "Modelo E-mail" não terá opções. Confirme no backend que:

- O endpoint `/budget/payment-approve` (getItensAprovacao) pode retornar `models_email`, ou  
- O endpoint `GET /models/email` está implementado e retornando modelos.

---

### 3. Fluxo para testar no frontend

1. Abrir um orçamento que permita **Aprovar pagamento**.
2. Clicar em **Aprovar pagamento** e aguardar o modal abrir com os itens.
3. Para um item:
   - Ativar **Enviar e-mail?** = **Sim**.
   - Preencher **E-mail** (ex.: seu e-mail ou um do Mailtrap).
   - Selecionar um **Modelo E-mail**.
   - (Opcional) Marcar "Anexar o pedido de produção no e-mail" e escolher "Dados de Faturamento para" (Cliente ou Unidade).
4. Clicar em **Aprovar** (ou **Solicitar**, conforme o fluxo).

Se a validação estiver correta, ao marcar "Enviar e-mail" e deixar e-mail ou modelo em branco, o frontend exibe aviso e não envia.  
Se tudo estiver preenchido, o frontend chama a API; o envio do e-mail ocorre no backend. Confira:

- Com **MAIL_MAILER=log**: em `storage/logs/laravel.log`.
- Com **Mailtrap**: na inbox do projeto.
- Com **Mailhog**: na UI (ex.: `http://localhost:8025`).

---

## Resumo

| O que | Onde |
|-------|------|
| Validação (e-mail e modelo obrigatórios) | Frontend (ModalAprovarPagamento.vue) |
| Payload com dados de e-mail | Frontend → POST `/budget/payment-approve-save` |
| Envio real do e-mail | Backend Laravel (jobb-api-v2) |
| Testar sem SMTP real | Backend: `MAIL_MAILER=log` ou Mailtrap/Mailhog no `.env` |
