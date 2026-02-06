# Rotas S3 e File Manager – API V1 e V2

Resumo das rotas já existentes nos backends para upload/listagem S3 e como o frontend (jobbvue3) as utiliza.

---

## API V2 (Laravel – jobb-api-v2)

### 1. Laravel File Manager (alexusmai) – S3

Pacote `alexusmai/laravel-file-manager` já instalado. Rotas são registradas como **rotas web** (não `api`), com prefixo `file-manager` em `config/file-manager.php`:

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/file-manager/initialize` | Inicialização do FM |
| GET | `/file-manager/content` | Lista arquivos/pastas (query: `disk`, `path`) |
| GET | `/file-manager/tree` | Árvore de pastas |
| GET | `/file-manager/select-disk` | Seleção de disco |
| POST | `/file-manager/upload` | Upload de arquivo |
| POST | `/file-manager/delete` | Excluir |
| POST | `/file-manager/paste` | Colar |
| POST | `/file-manager/rename` | Renomear |
| GET | `/file-manager/download` | Download |
| GET | `/file-manager/thumbnails` | Thumbnails (query: `disk`, `path`) |
| GET | `/file-manager/preview` | Preview |
| GET | `/file-manager/url` | URL pública do arquivo (query: `disk`, `path`) |
| POST | `/file-manager/create-directory` | Criar pasta |
| … | (outras no pacote) | |

- **Disco padrão:** `s3` (`config/file-manager.php`: `diskList`, `leftDisk`).
- **Middleware:** `['web']` – sessão/cookies; se precisar de JWT, o backend pode adicionar middleware nas rotas do pacote (ou publicar e alterar).
- **Importante:** essas rotas ficam em **`/file-manager/...`** (sem `/api`). Se `VITE_API_V2` for `http://localhost:8000/api`, o frontend deve usar para o file-manager uma base **sem** `/api` (ex.: `http://localhost:8000`), senão as chamadas vão para `/api/file-manager/...` e retornam 404.

### 2. Outras rotas web (web.php)

| Método | Rota | Controller | Uso |
|--------|------|-------------|-----|
| GET | `/file-manager` | closure | View do File Manager (página) |
| POST | `/upload-file` | ModelLinkController@uploadFile | Upload (fluxo modelo proposta/link) |
| POST | `/delete-file` | ModelLinkController@deleteFile | Excluir (fluxo modelo proposta/link) |

### 3. Rotas API (api.php) – autenticação JWT

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/api/file/temporary-url` | FileTemporaryUrlController – URL temporária (S3) |
| POST | `/api/sign/upload-file` | D4SignController – upload para D4Sign |

---

## API V1 (Zend – jobb-api-v1)

### Upload para S3

- **Controller:** `UploadController::saveServerAction`
- **Rota (convenção Zend):** algo como `POST /upload/save-server` (depende do roteamento do módulo API).
- **Uso:** envia arquivo para S3.
- **Parâmetros:** `param` (contexto/permissão), `pastaDestino`: `anexos` ou `images` (default `anexos`).
- **Resposta:** `localizacaoArquivo` (URL), `nomeArquivo`, `msg`, etc.

Não há na V1 endpoints de **listagem** (content) ou **thumbnails** do S3; só upload. O TinyMCE/CKEditor no jobbvue3 usam o File Manager da **V2** (content, upload, url, thumbnails).

---

## Frontend (jobbvue3)

- **TinyMCE** (Enviar Orçamento):
  - **"Inserir imagem do servidor":** abre o File Manager em **popup** (igual ao antigo CKEditor com `filebrowserImageBrowseUrl`). URL: `base/file-manager/tinymce5?leftPath=arquivos/{dbname}/images`. O Laravel envia a URL selecionada via `postMessage({ mceAction: 'insert', content: URL })`.
  - **Upload (colar/arrastar imagem):** `uploadImageToFileManager()` → POST para `/file-manager/upload` (mesma API V2).
- **Evitar CORS em dev:** no `vite.config.ts` há proxy de `/api` e `/file-manager` para o backend. Para usar o proxy, em `.env.development` defina `VITE_API_V2=` (vazio). Assim as requisições vão para o mesmo origin (ex.: localhost:5173) e o Vite encaminha para o backend (ex.: localhost:8000). O popup do file manager também usa URL relativa `/file-manager/tinymce5?...` e é atendido pelo proxy.
- **Variáveis:** `VITE_API_V2` (base da API V2; vazio em dev = usar proxy), `VITE_APP_BUCKET_S3` (opcional), `VITE_PROXY_TARGET` (opcional, default `http://localhost:8000`).
