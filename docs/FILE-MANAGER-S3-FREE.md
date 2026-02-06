# File manager integrado ao S3 – opções free

Resumo do que **já existe** no projeto e de **opções gratuitas** para file manager com S3.

---

## O que você já tem (free, integrado ao S3)

### Backend: alexusmai/laravel-file-manager

- **Onde:** jobb-api-v2 (Laravel)
- **Pacote:** [alexusmai/laravel-file-manager](https://github.com/alexusmai/laravel-file-manager)
- **Licença:** MIT (gratuito)
- **S3:** suportado (disco `s3` em `config/file-manager.php`)
- **Rotas API (JWT):** `/api/file-manager/content`, `/api/file-manager/url`, `/api/file-manager/thumbnails`, `/api/file-manager/upload`
- **Rota web:** `GET /file-manager` → view Blade que carrega o file manager (JS/CSS do pacote)

Ou seja: **o file manager integrado ao S3 já está no backend**, free.

---

## Opções para o frontend (Vue 3 / jobbvue3)

### 1. Vue component oficial do alexusmai (recomendado para integrar no app)

- **Nome:** [vue-laravel-file-manager](https://github.com/alexusmai/vue-laravel-file-manager) (publicado no npm como **`laravel-file-manager`**)
- **Versão 3:** Vue 3 + Bootstrap 5.3
- **Licença:** MIT (free)
- **Uso:** componente Vue que consome a **mesma API** que o jobb-api-v2 já expõe (`/api/file-manager/...`).
- **Requisitos:** Vuex (o jobbvue3 já usa Vuex).

**Instalação (exemplo):**

```bash
npm install laravel-file-manager --save
```

**Uso (exemplo):** registrar o plugin com Vuex e configurar `baseUrl` para a API do jobb-api-v2 e headers com JWT (token do usuário). O componente então lista pastas/arquivos, upload, etc., usando o S3 já configurado no Laravel.

**Resumo:** sim, tem file manager **free** integrado ao S3: o backend já é o alexusmai (S3); o frontend pode ser o **laravel-file-manager** (Vue 3) no jobbvue3, apontando para essa API.

---

### 2. Abrir o file manager do Laravel em nova janela / iframe

- O jobb-api-v2 já tem a rota **`GET /file-manager`** que renderiza a view com o file manager (JS do alexusmai).
- Você pode abrir essa URL em **nova janela** ou **iframe** (ex.: ao clicar em “Do servidor” ou “Inserir imagem do servidor”).
- **Limitação:** precisa de autenticação (sessão Laravel ou token) no mesmo domínio/subdomínio; se o app Vue rodar em outro domínio, pode ser preciso passar token ou usar a opção 1 (API + componente Vue).

---

### 3. Filestash (alternativa standalone, open source)

- **Site:** [filestash.app](https://www.filestash.app/)
- **Repositório:** [github.com/mickael-kerjean/filestash](https://github.com/mickael-kerjean/filestash)
- **Licença:** AGPL-3.0 (free, open source)
- **S3:** suportado (e S3-compatible, ex.: MinIO)
- **Uso:** aplicação **separada** (self-hosted ou demo). Não é um componente Vue dentro do jobbvue3; você sobe o Filestash e conecta ao mesmo bucket S3 (ou outro) para gerenciar arquivos em uma interface própria.
- **Quando faz sentido:** se quiser um “file manager genérico” para S3 fora do fluxo do app (admin, suporte, etc.), sem integrar dentro do Vue.

---

## Resumo

| Solução                         | Integrado ao seu backend? | S3        | Free | Onde usar                          |
|---------------------------------|---------------------------|-----------|------|------------------------------------|
| **alexusmai (backend)**         | Sim (jobb-api-v2)         | Sim       | Sim (MIT) | Já em uso – API file-manager       |
| **laravel-file-manager (Vue 3)**| Sim (usa a API acima)     | Via API   | Sim (MIT) | Dentro do jobbvue3 (componente)   |
| **Laravel /file-manager (view)**| Sim (mesma app Laravel)   | Sim       | Sim  | Nova janela / iframe               |
| **Filestash**                   | Não (app separado)        | Sim       | Sim (AGPL) | Standalone, outro serviço         |

Conclusão: **sim, existe file manager free integrado ao S3.** O backend já é o alexusmai (S3). Para ter a UI de file manager **dentro** do app Vue 3, a opção free e integrada é o **laravel-file-manager** (Vue 3) no npm, configurado com a `baseUrl` da API do jobb-api-v2 e autenticação (ex.: JWT).

Se quiser, no próximo passo podemos descrever como instalar e configurar o `laravel-file-manager` no jobbvue3 (Vuex, baseUrl, headers JWT e rota da API).
