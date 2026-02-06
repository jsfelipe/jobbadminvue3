# Patch API v1: evitar Duplicate entry na tabela usuario_empresa

**Arquivo:** na API v1 (ex.: `/var/www/jobb-api-v1` ou `/var/www/jobb`), em  
`application/controllers/OrcamentoController.php`, método `inserirAlterarEmpresa`.

**Problema:** ao salvar projeto incentivado (jobb_vue ou jobbvue3), ocorria  
`Duplicate entry '1-75' for key 'PRIMARY'` porque o usuário 1 (suporte) era inserido duas vezes.

**Solução:** não inserir o usuário 1 de novo no loop e usar `array_unique` nos IDs,  
para funcionar tanto no jobb_vue quanto no jobbvue3.

---

## Substituir este bloco:

```php
            if (isset($arrData['arrUsuariosPermitidos'])) {
                $usuarioEmpresaModel->delete('id_empresa = ' . $id_empresa);
                // inserindo para o suporte
                $usuarioEmpresaModel->insert(array(
                    'id_usuario' => 1,
                    'id_empresa' => $id_empresa
                ));
                // inserindo vinculo da empresa
                foreach ($arrData['arrUsuariosPermitidos'] as $id_usuario) {
                    try {
                        $usuarioEmpresaModel->insert(array(
                            'id_usuario' => $id_usuario,
                            'id_empresa' => $id_empresa
                        ));
                    } catch (Exception $ex) {
                    }
                }
            }
```

## Por este:

```php
            if (isset($arrData['arrUsuariosPermitidos'])) {
                $usuarioEmpresaModel->delete('id_empresa = ' . $id_empresa);
                // inserindo para o suporte (usuário 1)
                $usuarioEmpresaModel->insert(array(
                    'id_usuario' => 1,
                    'id_empresa' => $id_empresa
                ));
                // inserindo vínculo da empresa (jobb_vue e jobbvue3): evita duplicata do usuário 1 e ids repetidos
                $arrIds = array_unique(array_map('intval', (array) $arrData['arrUsuariosPermitidos']));
                foreach ($arrIds as $id_usuario) {
                    if ($id_usuario === 1) {
                        continue; // já inserido acima como suporte
                    }
                    try {
                        $usuarioEmpresaModel->insert(array(
                            'id_usuario' => $id_usuario,
                            'id_empresa' => $id_empresa
                        ));
                    } catch (Exception $ex) {
                    }
                }
            }
```

---

**Resumo das mudanças:**

1. `(array) $arrData['arrUsuariosPermitidos']` — garante array (jobb_vue pode enviar de formas diferentes).
2. `array_map('intval', ...)` — normaliza IDs para inteiro (jobbvue3 envia strings).
3. `array_unique(...)` — remove IDs duplicados.
4. `if ($id_usuario === 1) continue;` — não insere o usuário 1 de novo (já inserido como suporte).

Após aplicar no controller da API v1, o salvar projeto incentivado deve funcionar nos dois frontends.
