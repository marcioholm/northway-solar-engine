# Proposta comercial — modelo Moderno (referência)

Esta pasta é a **referência visual e funcional aprovada** do modelo Moderno. Ela **não é código de produção**: serve de gabarito para portar o layout para `backend/src/modules/proposals/templates`.

O PDF esperado está em `referencia/proposta-moderno-exemplo.pdf`. A empresa do exemplo é fictícia.

Para gerar o PDF localmente: `npm install && node build.js`. Você precisa de Playwright com Chromium; a saída vai para `out/`.

| Arquivo | O que é |
|---|---|
| `moderno.js` | Layout: CSS e HTML das 5 páginas. **Portar 1:1.** |
| `map.js` + `geo/brazil-states.json` | Mapa dos estados desenhado em SVG, com a projeção já calibrada para lat/lon. |
| `geo/municipios.csv` | 5.570 municípios do IBGE com lat/lon. Fonte: kelvins/municipios-brasileiros, licença MIT. |
| `qr-target.js` | Destinos do QR code e validação de URL. |
| `shared.js` | Formatação, contraste automático de cor e ícones. |
| `exemplo.js` | Dados de exemplo. Mostra o **formato** dos dados; os cálculos dele não são regra do sistema. |
| `geo/fit.js`, `refine.js`, `meta.js` | Scripts que calibraram a projeção. Só servem para reproduzir a calibração. |

## Regras do produto

1. **Nada de empresa fixa no layout.** Logo, cores, foto, textos, contatos, mapa, parceiros, marcas e QR vêm de `proposal_settings`. Só os títulos genéricos das seções são fixos.
2. **Seção sem dado não aparece.** Isso vale para números, diferenciais, mapa, parceiros, marcas, imagem do kit e fatura média. Não pode sobrar caixa vazia nem espaço reservado.
3. **Nenhum número inventado.** Toda estimativa (geração, cobertura, economia, retorno) sai com `*` e com a premissa no rodapé da página. Uma forma de pagamento só aparece se a empresa a configurou.
4. **Cor do texto automática.** Use `onColor()` para decidir texto branco ou escuro sobre a cor principal e a de destaque. Nas Configurações, avise quando a cor principal for clara demais para texto branco (contraste abaixo de 4.5:1).
5. **Fontes embutidas.** Barlow e Barlow Condensed via `@fontsource`, em base64 dentro do HTML. O Chromium da Vercel não pode depender de rede para carregar fontes.

## Imagens: especificação para impressão em A4

Mostre estes valores ao lado de cada campo de upload e mantenha o aviso no navegador quando a imagem estiver abaixo do mínimo.

| Imagem | Espaço na folha | Recomendado | Mínimo | Proporção | Formato |
|---|---|---|---|---|---|
| Capa | 210 × 178 mm | 2480 × 2100 px | 1650 × 1400 px | 6:5 | JPG |
| Logo | até 20 mm de altura | 1000 × 300 px | 600 × 180 px | 10:3 | PNG transparente, para fundo claro |
| Imagem do kit | 55 × 30 mm | 1200 × 800 px | 650 × 430 px | 3:2 | PNG transparente |
| Parceiros / marcas | 35 × 10 mm | 600 × 300 px | 400 × 200 px | 2:1 | PNG transparente |

- **Reduzir no navegador antes do upload.** A Vercel recusa corpo de requisição acima de ~4,5 MB, e foto de celular passa disso. Redimensione no navegador com canvas até o tamanho recomendado e só então envie. O limite no servidor pode subir para 4 MB.
- **Otimizador.** Ajuste o tipo `cover` do `ImageOptimizerService` para 2480 × 2100, qualidade 85. Os limites de segurança atuais continuam (`limitInputPixels`, apenas PNG/JPEG/WebP).
- **Enquadramento.** A capa usa `object-fit: cover`. Ofereça o campo `coverFocus` (`top` | `center` | `bottom`), que vira `object-position`.
- **Sem foto.** A capa sai na cor principal com textura diagonal sutil. Já está implementado em `moderno.js` (`.cv-noimg`).

## Área de atuação (mapa)

- A empresa marca **estados** (multiseleção das 27 UFs) e adiciona **cidades** por autocomplete sobre `municipios.csv`. Salve `{ ibge, name, uf, lat, lon }`; o nome sozinho não basta, porque existem cidades homônimas em UFs diferentes.
- `serviceArea.style`: `brasil` | `zoom` | `estados`. Quando não houver escolha, use `zoom` se forem até 4 estados e `brasil` acima disso.
- `map.js` gera o SVG no servidor, sem imagem e sem rede. Atribuição exigida pela licença CC BY 4.0 do mapa (`@svg-maps/brazil`, Victor Cazanave): mostre o crédito na tela de Configurações, não na proposta.
- O campo antigo `serviceAreaText` pode continuar como texto livre opcional.

## QR code da capa (sempre rastreado)

- O QR **sempre** aponta para o link rastreado da proposta: `GET {API}/q/:publicToken`.
- Esse endpoint é público e tem rate limit. Ele:
  1. busca a proposta pelo token;
  2. registra o evento `qr_scan` no módulo de tracking existente, com `metadata.destination` = tipo do destino;
  3. responde **302** para o destino calculado no servidor.
- **O destino nunca vem da URL.** Ele vem de `proposal_settings.qr`, validado por `resolveDestination()`. Isso evita open redirect.
- Tipos de destino: `proposal` (página pública `/proposta/:token?src=qr`), `consultant` (WhatsApp do consultor da proposta), `whatsapp` (número fixo), `site`, `instagram`, `custom`. Só aceita `https`; número de WhatsApp inválido ou URL perigosa faz o QR não aparecer.
- `message` aceita `{cliente}`. O `label` é editável, com até 40 caracteres e sugestão automática.
- Token inexistente responde 404 sem detalhes. Não registre IP em claro: use hash ou deixe de fora.
- Na página pública `/proposta/:token`, registre o evento `view` com `metadata.source = 'qr'` quando houver `?src=qr`.

## Opções de kit e pagamento (fase 2)

- Cada proposta passa a ter de 1 a 3 opções (`proposal_options`). Cada opção tem nome, `recommended`, potência, módulos, inversor, estrutura, geração estimada, preço e imagem opcional.
- A página Investimento já trata de 1 a 3 colunas. Com 1 opção, mostre um card único mais largo e sem o selo "Recomendado".
- Pagamento por empresa: desconto à vista (%); cartão com parcelas e acréscimo total (%); financiamento com **lista** de prazos `{ n, acrescimoTotalPct }`; parcelamento próprio `{ entradaPct, boletos }`. A parcela é `preço × (1 + acréscimo) / n`. Essa regra é a mesma já usada hoje (acréscimo total, sem juros compostos).
- No aceite, o cliente marca a opção escolhida. O aceite online fica para um PR futuro.

## Cores e imagem do kit (atualização)

- **Cores só em variáveis CSS.** Todas as cores do layout vêm de `--sec`, `--pri`, `--on-sec` e `--on-pri`, definidas uma única vez a partir de `proposal_settings`. Isso inclui o mapa, que usa `style="fill:var(--sec)"`. Não pode haver cor de empresa escrita direto no layout.
- **Cores padrão de empresa nova.** Use cores neutras, **nunca** as de algum cliente.
- **Pré-visualização das cores.** `referencia/demo-cores.html` mostra a troca ao vivo e o aviso de contraste. A tela de Configurações deve funcionar assim: o seletor de cor atualiza a pré-visualização na hora.
- **Imagem padrão do kit.** Sem imagem própria, usa a imagem 3D padrão (kit-art.data.ts) com a legenda 'Imagem ilustrativa'. O kit nunca fica sem imagem.
