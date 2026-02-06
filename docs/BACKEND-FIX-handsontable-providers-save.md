# Correção no backend: "Undefined array key 0" em handsontable-providers-save

## Problema

O frontend envia para `POST /api/budget/handsontable-providers-save` um **array JSON na raiz** (igual ao projeto antigo jobb_vue):

```json
[
  {
    "col": "id_unidade",
    "id_orca_item": 89145,
    "newValue": 1,
    "id_orcamento": "690",
    "id_orca_grupo": 10399,
    "id_orca_item_sup": 89144
  }
]
```

No Laravel, quando o body é um **array** (e não um objeto), `$request->all()` **não** preenche os parâmetros com esse array. Por isso `$request->all()[0]` gera **"Undefined array key 0"**.

## Solução no backend (Laravel)

No controller que trata a rota `budget/handsontable-providers-save`, ler o body como JSON e usar o array decodificado:

```php
// Em vez de:
// $data = $request->all();
// $item = $data[0];

// Use:
$data = json_decode($request->getContent(), true);
if (!is_array($data)) {
    return response()->json(['msg' => 'Payload inválido'], 400);
}
$first = $data[0] ?? null;
if ($first === null) {
    return response()->json(['msg' => 'Nenhum item enviado'], 400);
}

// A partir daqui use $data (array de itens) ou $first (primeiro item)
// Ex.: foreach ($data as $item) { ... }
```

Se o controller já percorre os itens, basta trocar a origem dos dados:

```php
$data = json_decode($request->getContent(), true) ?? [];
foreach ($data as $item) {
    $col = $item['col'] ?? null;
    $id_orca_item = $item['id_orca_item'] ?? null;
    $newValue = $item['newValue'] ?? null;
    // ...
}
```

## Mapeamento de colunas no frontend (jobbvue3)

O nome da coluna enviado em `col` deve corresponder à coluna que o usuário editou. No Vue 2 isso é feito com `state.budgetExec.columnsExec[colRow.col]` (ordem vinda da API). No Vue 3, `HandsOnTableExec.vue` foi ajustado para:

1. Usar `state.budgetExec.columnsExec[colRow.col]` quando a API enviar `columnsExec`.
2. Normalizar `unidade` → `id_unidade` quando vier da API.
3. Manter fallback com mapeamento fixo por índice quando `columnsExec` não existir.

Assim, ao editar "Qtd Exec", o payload envia `"col": "qtd_unidade_exec"` (e não `id_unidade`), evitando erro no backend ao acessar `Unity::where(...)->pluck('id_unidade')[0]` para a coluna errada.

## Referência

- Projeto antigo (jobb_vue): `HandsOntableExec.vue` → `saveDataItem(dataOrca)` envia `dataOrca` (array) direto no POST; `colExec` usa `state.budgetExec.columnsExec[colRow.col]`.
- Frontend jobbvue3 está alinhado: envia o mesmo array no body e usa `columnsExec` quando disponível.
