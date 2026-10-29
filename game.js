export const CHALLENGES = [
 {title:'Um toque de precisão',label:'Alvos pequenos',scene:'small',question:'Esta tela exige acertar ícones minúsculos e muito próximos. Qual é a principal barreira motora?',options:['A falta de uma foto no perfil.','O tamanho e a proximidade dos botões.','A quantidade de cores da tela.'],correct:'b',barrier:'Botões pequenos e próximos exigem precisão e podem provocar toques involuntários.',solution:'Aumentar as áreas de toque, separar os controles e oferecer outras formas de acionamento.',takeaway:'Mais espaço. Menos precisão exigida.'},
 {title:'Arrastar não é a única saída',label:'Gestos complexos',scene:'drag',question:'Para organizar uma lista, o aplicativo só permite segurar e arrastar. Como tornar essa ação mais acessível?',options:['Adicionar comandos “mover para cima” e “mover para baixo”.','Exigir dois dedos para arrastar.','Esconder as instruções.'],correct:'a',barrier:'Manter um toque enquanto se move o dedo pode ser difícil para algumas pessoas.',solution:'Oferecer botões ou comandos de voz que façam a mesma ação sem exigir o gesto de arrastar.',takeaway:'Uma ação. Diferentes formas de realizar.'},
 {title:'Cada pessoa tem seu ritmo',label:'Limites de tempo',scene:'time',question:'Um formulário apaga tudo se não for confirmado em poucos segundos. Qual mudança remove essa barreira?',options:['Fazer o relógio piscar mais rápido.','Diminuir o tamanho do botão.','Permitir estender ou desativar o limite de tempo.'],correct:'c',barrier:'Um prazo curto pode impedir a conclusão por quem precisa de mais tempo para interagir.',solution:'Permitir ajustar o tempo e preservar o que já foi preenchido, sempre que possível.',takeaway:'O sistema deve respeitar o tempo da pessoa.'}
];
export function createInitialState(){return {phase:'ready',index:0,answer:null};}
export function normalizeCommand(text){
 const value=String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.,!?;:]/g,'').trim().replace(/\s+/g,' ');
 if(/^(comecar|iniciar|inicio)$/.test(value))return 'start';
 if(/^(proximo|proxima|avancar|continuar)$/.test(value))return 'next';
 if(/^(repetir|repete|ajuda)$/.test(value))return 'repeat';
 const match=value.match(/^(?:(?:opcao|letra|alternativa) )?([abc])$/);
 return match?match[1]:'unknown';
}
export function reduceGame(state,command){
 if(state.phase==='ready'&&command==='start')return {...state,phase:'challenge'};
 if(state.phase==='challenge'&&['a','b','c'].includes(command))return {...state,phase:'learning',answer:command};
 if(state.phase==='learning'&&command==='next')return state.index===CHALLENGES.length-1?{...state,phase:'done'}:{phase:'challenge',index:state.index+1,answer:null};
 return state;
}
