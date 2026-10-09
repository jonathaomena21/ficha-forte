# Ficha Forte

Antes de mexer em qualquer coisa, leia o `LEIA-ME.md` desta pasta. Ele explica como o app está organizado, as regras que não podem ser quebradas, como testar e como publicar.

Resumo das regras:

- O app é um arquivo só (`index.html`), sem build e sem bibliotecas. A única exceção é o `sw.js`, que serve só para abrir sem internet.
- Textos da tela em português simples, sem travessão.
- A chave API nunca entra no código nem no repositório, que é público.
- Não quebrar os dados já salvos no `localStorage` de quem usa.
- Testar no navegador em largura de celular antes de publicar, e só publicar quando o usuário pedir.
- Ao terminar uma mudança, atualizar o `LEIA-ME.md` se algo descrito nele mudou.
