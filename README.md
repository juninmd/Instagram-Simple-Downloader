# Instagram Simple Downloader  

<center>
<img src='icons/logo-48.png' height='100' style='margin: 0 auto;text-align:center'>
<p> Add simple buttons to download and copy links for photos and videos from feed, story, profile, and reels (Manifest V2)</p>
</center>

[Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/instagram-simple-downloader/)

### Download from Profile
<img src='https://i.imgur.com/QMdUmFC.png' height='400'>

### Download from Feed
<img src='https://i.imgur.com/6qD0rT2.png' height='200'>

### Download from Stories
<img src='https://i.imgur.com/pjllbXq.png' height='300'>

[PT-BR]  

É uma extensão para o `Mozilla Firefox`  

Serão adicionados botões para fazer download e copiar links de fotos e vídeos do feed, perfil, reels e do stories (Manifest V2).

## Instalação

- **Firefox:** instale pela [página do Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/instagram-simple-downloader/).
- **Manual (desenvolvimento):** em `about:debugging` → *Este Firefox* → *Carregar complemento temporário* e selecione o arquivo `manifest.json` deste repositório.

## Permissões

| Permissão | Motivo |
|---|---|
| `downloads` | Iniciar o download da foto ou vídeo escolhido. |
| `clipboardWrite` | Copiar o link da mídia pelo botão *Copy Link*. |
| `https://www.instagram.com/*` (content scripts) | Injetar os botões na página do Instagram. |

## Privacidade

A extensão não envia dados para servidores de terceiros: o código não usa `fetch`, `XMLHttpRequest` nem `sendBeacon`. Para conferir:

```bash
grep -rn "fetch(\|XMLHttpRequest\|sendBeacon" *.js   # não deve retornar nada
```

## Uso pessoal e aviso legal

Use apenas para baixar conteúdo que você tem direito de guardar. Respeite os direitos autorais dos criadores e os Termos de Uso do Instagram. Este projeto não é afiliado à Meta.

## Limitações conhecidas

- Vídeos transmitidos por `blob:` (MSE) não podem ser baixados diretamente pela extensão.
- Stories dependem da estrutura atual do site e podem deixar de funcionar após mudanças do Instagram.

## Desenvolvimento

Requisitos: Node.js e [pnpm](https://pnpm.io) (versão definida em `packageManager`, 9.1.0).

```bash
pnpm install
pnpm lint          # ESLint
pnpm test          # instala o Chromium do Playwright (se necessário) e roda tests/
pnpm coverage      # testes com nyc
```

Estrutura principal:

- `manifest.json`: declaração da extensão (Manifest V2).
- `utils.js`: constantes, `el`, `debounce`, estilos e confete.
- `ui-base.js` / `ui.js`: componentes de botão (estados de carregando, sucesso e erro).
- `observer.js`: `MutationObserver` que injeta os botões em feed, perfil, reels e stories.
- `background.js`: valida a requisição e chama `downloads.download`.

## Licença

Distribuído sob a licença indicada no arquivo [LICENSE](LICENSE).
