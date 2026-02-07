# Variáveis de ambiente no AWS Amplify

Se o build passar mas a **tela ficar em branco** ou nada carregar, confira as variáveis de ambiente no Amplify.

## Onde configurar

**Amplify Console** → seu app → **Build settings** → **Environment variables** (ou **App settings** → **Environment variables**).

As variáveis precisam existir **no momento do build**, pois o Vite embute `VITE_*` no bundle.

## Variáveis usadas pelo front (jobbadminvue3)

| Variável | Obrigatória | Exemplo | Uso |
|----------|-------------|---------|-----|
| `VITE_API` | **Sim** (recomendado) | `https://sua-api.com/api` | URL base da API jobbadmin. Se não definida em produção, o app usa `/api` (mesma origem). |
| `VITE_APP_HOST` | Não | `https://seu-dominio.com` | Host do front (ex.: link no menu). |
| `VITE_APP_BUCKET_S3` | Não* | `https://seu-bucket.s3.region.amazonaws.com` | Base URL do bucket S3 (imagens/file-manager). *Obrigatória só se usar upload de imagens no CKEditor/File Manager. |
| `VITE_API_V2` | Não | `https://api-v2.exemplo.com` | API V2 (file-manager), se diferente da principal. |

## Aviso do log "Failed to set up process.env.secrets"

Esse aviso aparece quando o Amplify não consegue carregar **secrets** do SSM (Parameter Store). Não impede o build se as variáveis estiverem definidas como **Environment variables** normais (não como secrets).

- Use **Environment variables** no Amplify para `VITE_API`, `VITE_APP_HOST`, etc.
- Se usar **Secrets** (SSM), confira o caminho e as permissões do serviço no CodeBuild.

## Redirect SPA (tela em branco ao acessar rotas)

Use **apenas** a regra **404 (Rewrite)** — assim o Amplify só reescreve quando o arquivo **não existe** (ex.: `/dashboard`). Arquivos que existem (ex.: `/assets/index-xxx.js`) são servidos normalmente.

**No Amplify Console** → **Hosting** → **Redirects and rewrites** → **Manage redirects**:

1. **Remova todas as regras** (incluindo a de 200 com regex).
2. **Adicione só esta:**
   - **Source:** `/<*>`
   - **Target:** `/index.html`
   - **Type:** **404 (Rewrite)**

Assim: pedido a `/assets/xxx.js` → arquivo existe → retorna o JS. Pedido a `/signin` → não existe → 404 → reescreve para `index.html`.

## Depois de alterar variáveis

Fazer um **novo build** (Re-run build ou novo deploy) para que os valores sejam aplicados ao bundle.
