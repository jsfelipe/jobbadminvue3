# Widget Notícias do Blog na Dashboard

O card **Tweets** na dashboard foi substituído por **Notícias do blog**, que exibe as últimas postagens do blog em WordPress (hospedado no HostGator).

## Onde configurar os dados do blog (API v2)

No projeto **jobb-api-v2**, adicione as variáveis abaixo no arquivo **`.env`** (ou copie do `.env.example` e preencha):

```env
# Blog WordPress (HostGator) - widget "Notícias" na dashboard
DB_WP_HOST=127.0.0.1
DB_WP_PORT=3306
DB_WP_DATABASE=nome_do_banco_wordpress
DB_WP_USERNAME=usuario_do_banco
DB_WP_PASSWORD=senha_do_banco
DB_WP_PREFIX=wp_
DB_WP_BLOG_URL=https://blog.seudominio.com.br
DB_WP_POSTS_LIMIT=5
```

### Onde pegar cada valor (HostGator / cPanel)

| Variável | Onde achar |
|----------|------------|
| **DB_WP_HOST** | Geralmente `localhost` ou o host MySQL que o cPanel mostra (ex: `mysql.seudominio.com.br`) |
| **DB_WP_PORT** | 3306 (padrão MySQL) |
| **DB_WP_DATABASE** | Nome do banco do WordPress (cPanel > MySQL Databases ou phpMyAdmin) |
| **DB_WP_USERNAME** | Usuário MySQL do blog (cPanel > MySQL Databases) |
| **DB_WP_PASSWORD** | Senha do usuário MySQL |
| **DB_WP_PREFIX** | Prefixo das tabelas do WordPress; na maioria é `wp_`. Se mudou na instalação, use o prefixo correto (ex: `wp_`, `wpx_`) |
| **DB_WP_BLOG_URL** | URL pública do blog (ex: `https://blog.sistemajobb.com.br`) – usada nos links “Leia mais” |
| **DB_WP_POSTS_LIMIT** | Quantidade de notícias no card (padrão: 5) |

Depois de salvar o `.env`, reinicie o PHP/Laravel (ou o serviço da API) para carregar as novas variáveis.

## Comportamento

- A API v2 lê direto da tabela de posts do WordPress (ex: `wp_posts`).
- São listados apenas posts publicados (`post_status = publish`, `post_type = post`).
- No card são exibidos: **título**, **trecho da descrição** (excerpt ou início do conteúdo) e **data**.
- O título e o trecho são clicáveis e abrem o post no blog (nova aba), usando a **DB_WP_BLOG_URL** ou o `guid` do post.

## Rotas e arquivos

- **API v2**: `GET /blog/latest-posts` (protegida pelo mesmo middleware JWT da API).
- **Backend**: `config/database.php` (conexão `wordpress`), `config/wordpress.php`, `app/Http/Controllers/Api/BlogController.php`.
- **Frontend**: o widget que antes era “Tweets” passou a consumir essa rota e exibir “Notícias do blog” (arquivo `src/views/Dashboard/widgets/Tweets.vue`).
