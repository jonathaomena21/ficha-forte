# Ficha Forte

App de musculação que monta o treino da semana conforme os dados da pessoa, mostra cada exercício com um boneco animado e guarda as cargas. Feito para celular. Usado por Jhou e Evelyn, cada um no seu aparelho.

- App publicado: https://jonathaomena21.github.io/ficha-forte/
- Repositório: https://github.com/jonathaomena21/ficha-forte (público, GitHub Pages na branch `main`, pasta raiz)
- Pasta no PC: `C:\Users\Contric\Claude\ficha-forte`

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O app inteiro: estilo, telas e código em um arquivo só. É o único que muda no dia a dia. |
| `sw.js` | Guarda o app no celular para abrir sem internet. Quase nunca muda. |
| `manifest.webmanifest` | Nome, cores e ícones para "adicionar à tela inicial". |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Ícones do app. |
| `LEIA-ME.md` | Este arquivo. |
| `CLAUDE.md` | Aviso curto para o Claude Code ler este arquivo antes de mexer. |

Não tem etapa de build, não tem `npm`, não tem servidor. É abrir o `index.html` no navegador.

## Regras que não podem ser quebradas

1. **Tudo em um arquivo só.** Não separar em vários arquivos nem adicionar bibliotecas. O único recurso de fora é a fonte do Google Fonts. A única exceção é o `sw.js`, que precisa ser um arquivo separado para o app abrir sem internet. Ele não tem nada das telas.
2. **Textos da tela em português simples.** Palavras fáceis, frases curtas, sem termo técnico e **sem travessão**.
3. **Sem perfis.** Cada celular tem um usuário só. Os dados ficam no `localStorage` do aparelho.
4. **A chave API nunca entra no código nem no repositório.** O repositório é público. A pessoa digita a chave em "Meus dados" e ela fica só no aparelho.
5. **Não mudar o formato dos dados salvos sem cuidar de quem já usa.** Se mudar, o app tem que continuar abrindo os dados antigos.
6. **Séries já vêm preenchidas** com a carga e as repetições sugeridas. A pessoa só toca em "Feito" e muda o número se quiser.
7. **Celular primeiro.** Testar em 400 px de largura, sem rolagem para o lado. Tema claro e escuro usam as variáveis de cor do `:root`.
8. **O treino é orientação geral.** Manter o aviso de que não substitui um profissional e as travas do treinador (não dar diagnóstico, não indicar remédio ou anabolizante).

## Como o `index.html` está organizado

O código JavaScript está em blocos marcados com comentários `/* ============ NOME ============ */`, nesta ordem:

1. **BONECO ANIMADO**: poses (`ANIMS`) e a função `figSVG`, que desenha o boneco.
2. **MAPA DE MUSCULOS**: o desenho do corpo de frente e de costas (`SIL`, `BODY`, `muscleMap`).
3. **EXERCICIOS**: a lista `EX`, os dados extras `XTRA` e a montagem do treino (`TPL`, `splitFor`, `buildPlan`, `prescr`).
4. **DADOS NO CELULAR**: o estado `S` e as funções `save`, `today`, `esc`, `num`.
5. **TELAS**: `render`, a navegação (`go`, `goBack`) e uma função por tela (`viewSetup`, `viewHome`, `viewDay`, `viewEx`, `viewFim`, `viewEvo`, `viewPerfil`). Aqui também ficam `suggest` (carga e repetições sugeridas), `startKg` (carga inicial) e `wake` (tela acesa durante o treino).
6. **TREINADOR COM IA**: `callAI`, `aiSystem`, `viewIA`, `sendChat`, `runAnalise`, `cfgCard`.
7. **ACOES**: um único `click` no `#app` que lê `data-act` de cada botão.
8. **DESCANSO**: o cronômetro entre as séries.
9. **LACO DA ANIMACAO**: `frame`, que redesenha os bonecos com a classe `live`. Só roda quando há boneco animado na tela e o app está aberto. `kick()` liga de novo e é chamado no fim de `render`.
10. **SEM INTERNET**: registra o `sw.js` (só no endereço `https` ou em `localhost`).

As telas são montadas como texto HTML e colocadas em `#app`. Não há framework. Para um botão novo, use `data-act="nome"` e trate o nome no bloco ACOES.

### Navegação e botão voltar

- Cada tela entra no histórico do navegador, para o voltar do celular funcionar. Para abrir uma tela use `go(tela)`. Nunca mude `V` e chame `render` direto para trocar de tela.
- `go(tela,'replace')` troca a tela atual sem empilhar (usado em "Próximo exercício" e no fim do treino). `'tab'` e `'tabr'` são as trocas pela barra de baixo.
- Botões de voltar levam `data-back="1"` e chamam `goBack`, que anda para trás no histórico. A aba Treino volta até o começo, então o voltar seguinte sai do app.
- O histórico guarda onde cada tela estava rolada, e ao voltar a tela abre no mesmo lugar.
- Marcar uma série e os botões de menos e mais mudam só a linha da série, sem montar a tela de novo, para o teclado não fechar e a tela não pular.

### Dados salvos

- `localStorage["ficha-forte-v1"]`: o estado `S`.
  - `profile`: nome, sexo, idade, peso, altura, objetivo, nivel, dias, tempo, local, foco, evita.
  - `plan`: lista de dias, cada um com `nome`, `foco`, `itens` (`ex`, `slot`, `series`, `reps`, `desc`) e `nota`.
  - `next`: índice do próximo treino.
  - `draft`: séries do treino em andamento, por dia e por exercício (`kg`, `reps`, `ok`).
  - `logs`: histórico por exercício (`d` com a data e `sets` com `kg` e `reps`).
  - `done`: treinos concluídos (`d` data, `n` nome; os novos também têm `s` séries e `v` peso total, usados para comparar no resumo). `pesos`: peso anotado por data. `chat`: conversa com o treinador. `analise`: última análise da IA.
  - `start`: hora em que cada treino em andamento começou, para mostrar o tempo no resumo. Os dados antigos não têm esse campo e abrem normalmente.
- `localStorage["ficha-forte-cfg"]`: chave API, Workspace ID e modelo. Não entra no backup.

### Montagem do treino

- `EX` tem 42 exercícios. Campos: `id`, `n` (nome), `g` (grupo), `s` (em quais vagas ele cabe), `a` (animação), `eq` (`bar`, `db`, `hd` ou nada), `w` (onde dá para fazer: `G` academia, `D` casa com halteres, `B` sem equipamento), `av` (dores que ele evita), `min` (nível mínimo), `t` (por tempo), `bw` (sem carga), `tips`.
- `XTRA` completa cada exercício com: texto de pegada e posição, músculos principais, músculos que ajudam e a animação do segundo ângulo.
- `TPL` são os modelos de dia (lista de vagas, como `quad`, `push_h`, `pull_v`). `splitFor` escolhe os dias conforme dias por semana, nível e foco. `buildPlan` preenche cada vaga com um exercício que serve para o local e as dores da pessoa.
- `prescr` define séries, repetições e descanso conforme objetivo, nível e idade.
- `suggest` dá a carga e as repetições do dia. Na primeira vez usa `startKg` (fração do peso do corpo em `START`). Depois usa o histórico: sobe uma repetição por treino e, ao chegar no máximo em todas as séries, sobe a carga.

### Boneco animado

- Cada animação em `ANIMS` tem uma lista `K` de poses. Cada pose tem pontos em uma tela de 200 por 160: `H` (quadril), `S` (ombro), `h` (mão), `f` (tornozelo) e opcionais `h2`, `f2`, `toe`, `al`, `ll`. Uma pose só precisa dizer o que muda em relação à anterior.
- Cotovelo e joelho são calculados pela função `ik`. `eh` e `kh` dizem para que lado eles dobram.
- Braço mede 17 + 17 e perna 24 + 24. Se a mão ou o pé ficarem mais perto que isso, o membro dobra. Para manter esticado em um movimento em arco, ponha o alvo um pouco além do alcance e use mais poses no caminho.
- `front:1` (pelo atalho `...FV`) é vista de frente: só se define o lado esquerdo e o direito é espelhado. `lbl:'De cima'` troca o nome do botão.
- `sc` é o cenário (banco, cabo, barra fixa).
- O boneco é desenhado por partes (pele, short, tênis, cabelo) e os músculos do exercício aparecem em vermelho (principal) e laranja (ajuda).
- 12 exercícios têm segundo ângulo (campo `a2`). Onde a segunda vista confundia, ela foi tirada de propósito: stiff, remada curvada, flexões, desenvolvimento e tríceps na polia.

### Treinador com IA

- Chama `https://api.anthropic.com/v1/messages` direto do navegador, com a chave do usuário e o cabeçalho `anthropic-dangerous-direct-browser-access`.
- Modelos no seletor: `claude-sonnet-5-5` (padrão), `claude-haiku-4-5-20251001`, `claude-opus-5-5`.
- `aiSystem` monta as instruções e manda junto os dados da pessoa, o treino e o histórico.
- É o mesmo esquema do app Diário Nutri (pasta `..\diario-nutri`).

## Como testar antes de publicar

1. Abrir o `index.html` no navegador, em largura de celular, e passar por: cadastro, tela inicial, um treino, um exercício, botões de menos e mais, marcar série, concluir treino (tela de resumo), Evolução, Treinador e Meus dados.
2. Testar o voltar do navegador em cada tela: ele tem que voltar para a tela anterior, e nunca para uma tela errada.
3. Conferir o console: não pode ter erro.
4. Para testar o modo sem internet, rodar o app em `localhost` (no Claude Code, a configuração `ficha-forte` em `.claude/launch.json` sobe um servidor na porta 8766), abrir uma vez, desligar o servidor e abrir de novo.
5. Se mexeu em animação, olhar o movimento inteiro de cada exercício alterado, nos dois ângulos. Um bom teste é desenhar o boneco em vários momentos (`figSVG(ANIMS.nome, t, exercicio)` com `t` de 0 a 1) e ver se algum ponto dá um pulo de um quadro para o outro. Pulo quer dizer cotovelo ou joelho virando de lado.
6. Se mexeu no treino, gerar planos para várias combinações (local, dias, nível, foco, dores) e conferir que todo dia tem pelo menos 4 exercícios e nenhum repetido.
7. Conferir que não entrou travessão nos textos.

## Como publicar

Enviar o `index.html` novo para a branch `main` do repositório. O GitHub Pages atualiza sozinho em 1 ou 2 minutos. O `sw.js` só precisa ser enviado quando ele mudar (a primeira vez foi junto com a versão que trouxe o modo sem internet).

Com o `sw.js`, o app sempre tenta buscar o `index.html` novo na internet ao abrir. Se a internet não responder em 4 segundos, ele abre a cópia guardada no celular. Então quem estiver sem sinal vê a versão anterior até a próxima vez que abrir com internet. Se mudar a lista de arquivos guardados no `sw.js`, suba o número em `CACHE`.

- Pelo site: abrir o repositório, "Add file", "Upload files", arrastar o arquivo e confirmar.
- Pelo git, se a pasta estiver ligada ao repositório: `git add index.html`, `git commit`, `git push`.

Depois de publicar, abrir o link com `?v=numero` no fim para fugir do cache e conferir. No celular, fechar e abrir o app.

## O que já se sabe que pode melhorar

- O treinador com IA foi testado só com resposta simulada. Falta confirmar com a chave de verdade.
- O histórico da versão antiga (a página de dentro do Claude) não veio para o app publicado.
- Alguns bonecos ainda são simples: mesa flexora, remada baixa, puxada de lado e crucifixo na polia.
- As cargas iniciais são estimativas conservadoras. Vale ajustar a tabela `START` conforme o uso real.
- Não há sincronização entre aparelhos. A saída hoje é o backup em arquivo, em Meus dados.

## Como pedir uma melhoria

Diga o que quer em uma frase e, se for sobre um exercício, o nome dele como aparece no app. Exemplos:

- "No Ficha Forte, a animação da mesa flexora está estranha. Arrume e me mostre antes de publicar."
- "Adicione o exercício cadeira abdutora, com animação, pegada e músculos."
- "Quero poder editar a ordem dos exercícios do dia."
