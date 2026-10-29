export const CHALLENGES = [
 {title:'Um toque de precisão',label:'Alvos pequenos',scene:'small',question:'Esta tela exige acertar ícones minúsculos e muito próximos. Qual é a principal barreira motora?',options:['A falta de uma foto no perfil.','O tamanho e a proximidade dos botões.','A quantidade de cores da tela.'],correct:'b',barrier:'Botões pequenos e próximos exigem precisão e podem provocar toques involuntários.',solution:'Aumentar as áreas de toque, separar os controles e oferecer outras formas de acionamento.',takeaway:'Mais espaço. Menos precisão exigida.'},
 {title:'Arrastar não é a única saída',label:'Gestos complexos',scene:'drag',question:'Para organizar uma lista, o aplicativo só permite segurar e arrastar. Como tornar essa ação mais acessível?',options:['Adicionar comandos “mover para cima” e “mover para baixo”.','Exigir dois dedos para arrastar.','Esconder as instruções.'],correct:'a',barrier:'Manter um toque enquanto se move o dedo pode ser difícil para algumas pessoas.',solution:'Oferecer botões ou comandos de voz que façam a mesma ação sem exigir o gesto de arrastar.',takeaway:'Uma ação. Diferentes formas de realizar.'},
 {title:'Cada pessoa tem seu ritmo',label:'Limites de tempo',scene:'time',question:'Um formulário apaga tudo se não for confirmado em poucos segundos. Qual mudança remove essa barreira?',options:['Fazer o relógio piscar mais rápido.','Diminuir o tamanho do botão.','Permitir estender ou desativar o limite de tempo.'],correct:'c',barrier:'Um prazo curto pode impedir a conclusão por quem precisa de mais tempo para interagir.',solution:'Permitir ajustar o tempo e preservar o que já foi preenchido, sempre que possível.',takeaway:'O sistema deve respeitar o tempo da pessoa.'}
];
export const TASKS={revisar:'Revisar conteúdo',preparar:'Preparar apresentação',apresentar:'Apresentar o seminário'};
export const REFLECTIONS={noise:'Barulho na sala',recognition:'Reconhecimento da fala',commands:'Lembrar os comandos',other:'Outro motivo',none:'Não tive dificuldade'};
export function createInitialState(){return {phase:'ready',index:0,answer:null,tasks:Object.keys(TASKS),selected:null,reflection:null,history:[]};}
export function normalizeCommand(text){
 const value=String(text??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.,!?;:]/g,'').trim().replace(/\s+/g,' ');
 if(/^(comecar|iniciar|inicio)$/.test(value))return 'start';
 if(/^(proximo|proxima|avancar|continuar)$/.test(value))return 'next';
 if(/^(repetir|repete|ajuda)$/.test(value))return 'repeat';
 const commands={voltar:'back',desfazer:'undo',confirmar:'confirm','mover para cima':'up','mover para baixo':'down',barulho:'noise',reconhecimento:'recognition',comandos:'commands',outro:'other','outro motivo':'other',nenhuma:'none','sem dificuldade':'none'};
 if(commands[value])return commands[value];
 if(/^(rolar para baixo|descer tela)$/.test(value))return 'scroll-down';
 if(/^(rolar para cima|subir tela)$/.test(value))return 'scroll-up';
 const selection=value.match(/^(?:selecionar )?(?:tarefa|item) (um|uma|dois|duas|tres|1|2|3)$/);
 if(selection)return `select-${({um:1,uma:1,dois:2,duas:2,tres:3})[selection[1]]||selection[1]}`;
 const match=value.match(/^(?:(?:opcao|letra|alternativa) )?([abc])$/);
 return match?match[1]:'unknown';
}
export function reduceGame(state,command){
 const {history=[],...snapshot}=state;
 if(['back','undo'].includes(command))return history.length?{...history.at(-1),history:history.slice(0,-1)}:state;
 let next=state;
 if(state.phase==='ready'&&command==='start')next={...state,phase:'challenge'};
 if(state.phase==='challenge'&&['a','b','c'].includes(command))next={...state,phase:'learning',answer:command};
 if(state.phase==='learning'&&command==='next')next=state.index===CHALLENGES.length-1?{...state,phase:'practice'}:{...state,phase:'challenge',index:state.index+1,answer:null};
 if(state.phase==='practice'){
  if(/^select-[123]$/.test(command)){const selected=state.tasks[Number(command.at(-1))-1];if(selected!==state.selected)next={...state,selected};}
  if(['up','down'].includes(command)&&state.selected){const index=state.tasks.indexOf(state.selected),target=index+(command==='up'?-1:1);if(target>=0&&target<state.tasks.length){const tasks=[...state.tasks];[tasks[index],tasks[target]]=[tasks[target],tasks[index]];next={...state,tasks};}}
  if(command==='confirm'&&state.tasks[0]==='preparar')next={...state,phase:'reflection'};
 }
 if(state.phase==='reflection'){
  if(Object.hasOwn(REFLECTIONS,command)&&command!==state.reflection)next={...state,reflection:command};
  if(command==='next')next={...state,phase:'done'};
 }
 return next===state?state:{...next,history:[...history.slice(-49),snapshot]};
}
