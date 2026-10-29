# Comando Acessível

Dinâmica para seminários de acessibilidade motora na informática. Três desafios individuais apresentam barreiras em interfaces digitais e alternativas para removê-las.

## Participação

Abra https://LuizFVR.github.io/comando-acessivel/ no navegador do celular. Toque em **Ativar microfone**, permita o acesso e diga **começar**. Responda com **opção A**, **opção B** ou **opção C**. Após a explicação, diga **próximo**. O comando **repetir** mostra as instruções novamente.

A atividade não possui classificação ou cronômetro real. As interfaces problemáticas são ilustrações para discussão. A experiência por voz não representa uma simulação de deficiência.

## Requisitos e alternativa

- Internet e navegador compatível com reconhecimento de fala; teste antes da apresentação no Chrome em Android e no Safari em iPhone. A compatibilidade varia por aparelho.
- Permissão de microfone. O navegador pode solicitar nova ativação depois de uma interrupção.
- Se necessário, escolha **Preciso de outra forma de participar** ou **Usar modo alternativo**. Use o ditado do teclado ou digite os comandos. Esse modo exige toques adicionais.
- Se houver muito ruído, fale perto do aparelho e faça as tentativas em momentos diferentes. Ninguém precisa forçar a voz ou participar por um meio desconfortável.

O site não grava nem armazena áudio, nomes ou respostas. O reconhecimento de fala pode ser processado pelo fornecedor do navegador. Evite ditar informações pessoais.

## Roteiro de 25 minutos

1. Explicação e acesso: 3 minutos.
2. Ativação e teste: 3 minutos.
3. Três desafios: 8 minutos.
4. Discussão: 7 minutos.
5. Conclusão: 4 minutos.

Perguntas para discussão: onde a voz ajudou? O que dificultou? Quem poderia precisar de outra forma de entrada? Que alternativa vocês ofereceriam além do toque e da voz?

## Desenvolvimento e publicação

Site estático sem dependências de produção. Para executar os testes, use Node.js 20 ou superior e `npm test`. Sirva a pasta com um servidor estático para testar os módulos no navegador.

No GitHub, ative **Settings → Pages → Deploy from a branch → main → /(root)**. A conexão HTTPS é necessária para usar o microfone fora de localhost.

## Referências

- [WCAG 2.2 — Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html)
- [WCAG 2.2 — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [WCAG 2.2 — Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.2 — Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
