# TipTap no envio de e-mail (teste) – free + file manager

Este doc resume o que existe **pronto e gratuito** na internet para usar **TipTap** em vez do CKEditor na parte de enviar e-mail, **sem excluir o CKEditor**.

## O que existe na internet (free)

### TipTap oficial (MIT, gratuito)

- **Site:** [tiptap.dev](https://tiptap.dev)
- **Pacotes:** `@tiptap/vue-3`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-file-handler`
- **Imagens:**
  - **Image extension:** exibe `<img>`; não faz upload sozinho.
  - **FileHandler extension:** trata **paste** e **drag-and-drop** de arquivos; você implementa o upload no callback (`onPaste` / `onDrop`).
- **Upload:** não há “file manager” pronto no TipTap. O fluxo é: você envia o arquivo para seu backend e insere a URL da imagem no editor (igual ao adapter customizado do CKEditor).

### Exemplos prontos (Vue 3 + Laravel)

- **Gist:** [TipTap + VueJS3 + Laravel + InertiaJS](https://gist.github.com/murdercode/e57217145c605dcb9859b20eeddcd9d9)  
  Modal com input file → POST para endpoint Laravel → `editor.chain().focus().setImage({ src: url }).run()`.  
  Adaptável para usar os endpoints do **Laravel File Manager** que o projeto já usa (`/file-manager/upload`, `/file-manager/url`).

- **Docs TipTap:** [Image Upload Node](https://tiptap.dev/docs/ui-components/node-components/image-upload-node) (exemplo em React) com progresso e validação; a lógica de upload é sua.

### “File manager” (browse server)

- O TipTap **não** traz um file manager / “browse server” embutido.
- No projeto já existe:
  - **Laravel File Manager** (alexusmai): `content`, `upload`, `url`, `thumbnails`.
  - No CKEditor 5: botão “Inserir imagem do servidor” que abre modal, chama `fetchFileManagerContent` e `getFileManagerFileUrl` do composable `useCKEditor5EnviarOrcamento`.
- Para o TipTap: usamos o **mesmo backend** (file-manager) e um **modal próprio** no componente TipTap (lista de imagens via `content`, escolha, depois `getFileManagerFileUrl` e `setImage`).

## O que foi implementado neste projeto (teste)

1. **Upload de imagem (reuso)**  
   - Função `uploadImageToFileManager` no composable do CKEditor; TipTap usa o **mesmo** Laravel File Manager (upload + url ou S3).

2. **Componente `TipTapEnviarOrcamento.vue`**  
   - **Source (HTML real):** botão "Source" abre diálogo com o HTML atual. Edite o código-fonte e clique em **Aplicar**; o HTML aplicado é o valor emitido (`v-model`), preservando o HTML real ao enviar.
   - **Upload:** botão “Inserir imagem” (input file) → upload via file-manager → inserir imagem.
   - **File manager (servidor):** botão “Do servidor” que abre modal com lista de imagens do file-manager (S3) e insere a URL escolhida.
   - Paste/drop de imagens: se estiver disponível `@tiptap/extension-file-handler`, usa o mesmo upload; senão, só botão + “Do servidor”.

3. **Página Enviar Orçamento**  
   - Opção **“Usar TipTap (teste)”** apenas no campo **Texto do e-mail**.
   - CKEditor permanece como padrão e continua em uso no modelo de carta e onde não estiver em modo “teste TipTap”.

## Resumo

| Recurso              | TipTap (internet)     | Este projeto (teste)                    |
|----------------------|------------------------|------------------------------------------|
| Editor rich text     | Sim (oficial, MIT)    | Sim (`TipTapEnviarOrcamento.vue`)        |
| Upload de imagem     | Você implementa       | Sim (Laravel File Manager)              |
| File manager (servidor) | Não incluso        | Sim (modal + content/url do file-manager)|
| CKEditor             | —                     | Mantido; não excluído                    |

Referências úteis:

- [TipTap – Vue 3](https://tiptap.dev/docs/editor/getting-started/install/vue3)
- [TipTap – Image](https://tiptap.dev/docs/editor/extensions/nodes/image)
- [TipTap – FileHandler](https://tiptap.dev/docs/editor/extensions/functionality/filehandler)
- [Gist TipTap + Vue3 + Laravel](https://gist.github.com/murdercode/e57217145c605dcb9859b20eeddcd9d9)
