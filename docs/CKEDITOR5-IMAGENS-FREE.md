# CKEditor 5 + imagens (gratuito) – opções compatíveis

Você **não precisa pagar** para usar CKEditor 5 com suporte bom a imagens. Abaixo estão opções **100% gratuitas** (GPL/open source) que funcionam bem com imagens.

---

## Opção 1: Build clássico com Base64 (mais simples)

**Pacote npm:** [`ckeditor5-build-classic-base64-upload`](https://github.com/techshowsolutions/ckeditor5-build-classic-base64-upload)

- **O que é:** Build “classic” do CKEditor 5 já com **Base64UploadAdapter**.
- **Imagens:** Colar ou arrastar imagem → vira Base64 dentro do HTML (não usa servidor).
- **Vantagens:** Zero configuração de backend, instalável via npm, licença GPL.
- **Desvantagem:** Conteúdo HTML fica maior; não usa o file-manager do Laravel.

**Instalação:**
```bash
npm install ckeditor5-build-classic-base64-upload @ckeditor/ckeditor5-vue
```

**Uso com Vue 3:** Use o componente oficial `@ckeditor/ckeditor5-vue` apontando para esse build em vez do build padrão. Documentação Vue 3: [CKEditor 5 – Vue.js 3+ (npm)](https://ckeditor.com/docs/ckeditor5/latest/getting-started/installation/self-hosted/vuejs-v3.html).

---

## Opção 2: CKEditor 5 oficial + Custom Upload Adapter (recomendado para seu caso)

**Repositório oficial:** [ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5) (pacote `ckeditor5-upload`).

- **O que é:** CKEditor 5 instalado via npm ou CDN com **licenseKey: 'GPL'** + um **custom upload adapter** que você implementa.
- **Imagens:** Upload vai para **seu servidor** (por exemplo o endpoint do file-manager do Laravel que você já usa no CKEditor 4).
- **Vantagens:** Reaproveita o mesmo backend (file-manager/upload), imagens ficam no servidor, UX melhor para muitas imagens.
- **Custo:** Gratuito (CKEditor 5 GPL + seu código do adapter).

Documentação oficial:
- [Custom upload adapter](https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/custom-upload-adapter.html)
- [Deep dive – Upload adapter](https://ckeditor.com/docs/ckeditor5/latest/framework/deep-dive/upload-adapter.html)

O adapter faz um `POST` para a URL que você definir (ex.: `VITE_API_V2/file-manager/upload`) e espera uma resposta JSON com `{ "url": "https://..." }`. Você pode adaptar o que o Laravel já retorna para esse formato.

---

## Opção 3: Outro build Base64 no GitHub

**Repositório:** [thijssmudde/ckeditor5-build-classic-base64](https://github.com/thijssmudde/ckeditor5-build-classic-base64)

- Build clássico com **Base64UploadAdapter**.
- Alternativa à Opção 1; mesma ideia (imagens em Base64, sem servidor).

---

## Resumo

| Opção | Imagens | Backend | Dificuldade |
|-------|---------|---------|-------------|
| **1 – Base64 build** | Embutidas no HTML (Base64) | Não precisa | Fácil |
| **2 – Oficial + custom adapter** | Upload para seu Laravel | Usa file-manager atual | Média |
| **3 – Outro Base64** | Embutidas no HTML | Não precisa | Fácil |

- Para **mínimo de trabalho** e “só quero imagens no editor”: use **Opção 1** (ou 3).
- Para **continuar usando o file-manager do Laravel** e armazenar imagens no servidor: use **Opção 2** (custom upload adapter).

Todos os links acima são para projetos **gratuitos** no GitHub / documentação oficial; nenhum exige licença paga para uso com GPL.
