# Imagem 3D padrão do kit

Cena original em Three.js 0.160 usada como imagem padrão do kit na página Investimento, quando a empresa não envia foto própria (`kitImageUrl` / imagem da opção).

Para regerar:

```bash
npm i three@0.160.0 playwright
node shot.js          # gera kit-3d.png (2000x1500, fundo transparente)
```

Depois recorte ao conteúdo, encaixe em 1200x800 (3:2), quantize para PNG de 256 cores e atualize `backend/src/modules/proposals/templates/kit-art.data.ts`.

Sem marca, logo ou foto de terceiros. Não substitua por imagem de catálogo de fornecedor: o repositório é público.
