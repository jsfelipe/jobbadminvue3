# TinyMCE no envio de e-mail

**TinyMCE é o editor padrão** na página Enviar Orçamento (modelo carta e texto do e-mail). CKEditor e TipTap continuam disponíveis na escolha "Editor".

## O que foi feito

1. **Dependências**
   - `tinymce` (core)
   - `@tinymce/tinymce-vue` (componente Vue 3)

2. **Componente `TinyMCEEnviarOrcamento.vue`**
   - Editor TinyMCE com toolbar: undo/redo, blocos, formatação, listas, link, imagem, tabela, **código-fonte (Source)**.
   - **Upload de imagem:** usa o mesmo Laravel File Manager (função `uploadImageToFileManager` do composable do CKEditor). Imagens coladas ou inseridas são enviadas para o file-manager e a URL é usada no conteúdo.
   - **Carregamento:** TinyMCE **self-hosted** (sem CDN, sem API key). O script `postinstall` do `package.json` copia `node_modules/tinymce` para `public/tinymce`; o editor carrega `/tinymce/tinymce.min.js` e usa `license_key: 'gpl'`. Após `npm install`, a pasta `public/tinymce` é criada automaticamente.
   - `v-model` em HTML e `setContent(html)` expostos para o pai (compatível com CKEditor/TipTap).

3. **Página Enviar Orçamento**
   - **Editor (teste):** escolha entre **CKEditor**, **TipTap** e **TinyMCE** para:
     - Modelo carta
     - Texto do e-mail

## Como testar

1. Rode `npm install` (para instalar `tinymce` e `@tinymce/tinymce-vue`).
2. Abra **Enviar Orçamento** (orçamento com envio de e-mail).
3. Em **Modelo carta** ou **Texto do e-mail**, selecione **TinyMCE** no grupo de opções "Editor (teste)".
4. Use o editor: formatação, listas, link, imagem (upload/cola), tabela, botão **code** para ver/editar o HTML.

## Observações

- **Self-hosted:** O editor usa TinyMCE copiado para `public/tinymce` (script `postinstall`). Se a pasta não existir, rode `npm install` de novo. A pasta `public/tinymce` está no `.gitignore` (não é commitada).
- **Licença:** `license_key: 'gpl'` é usado para uso self-hosted sob GPL; não há validação online e o editor não fica read-only.
- **File manager “Do servidor”:** O TinyMCE não traz file manager embutido, mas tem **`file_picker_callback`**. Foi configurado para abrir um modal “Inserir imagem do servidor (S3)” que usa a **mesma API** do Laravel (content, url, thumbnails). Ao clicar em “Browse” no diálogo de imagem do TinyMCE, abre o modal com a lista de imagens do S3; ao escolher uma, a URL é inserida no editor.
