import {CHALLENGES,TASKS,REFLECTIONS,createInitialState,normalizeCommand,reduceGame} from './game.js';
import {createSpeechController} from './speech.js';
const $=id=>document.getElementById(id);
let state=createInitialState(),alternative=false,started=false,lastInput=0,blocked=false;
const speech=createSpeechController({onTranscript:handleTranscript,onStatus:status=>{
 if(status==='listening')blocked=false;
 if(alternative||blocked||state.phase==='done')return;
 $('status').textContent={listening:'Ouvindo • fale seu comando',reconnecting:'Preparando para ouvir novamente…',stopped:'Microfone pausado'}[status];
 $('resume').hidden=status!=='stopped';
},onError:code=>{
 blocked=true;$('status').textContent=code==='not-allowed'||code==='service-not-allowed'?'Acesso ao microfone não autorizado.':'Não foi possível ouvir. Confira a conexão e o microfone.';
 $('resume').hidden=false;$('help').open=true;
}});
function scene(type,improved=false){
 const contents={small:'<div class="fake-top"><span>Meu espaço</span><div class="tiny-icons"><span>+</span><span>×</span><span>⋮</span></div></div><div class="fake-line"></div><div class="fake-line short"></div>',drag:'<div class="fake-top">Organize suas tarefas</div><div class="list-item"><span>Revisar conteúdo</span><span>⠿</span></div><div class="list-item"><span>Preparar apresentação</span><span>⠿</span></div><div class="drag-hint">Segure e arraste para mudar a ordem</div>',time:'<div class="fake-top">Confirme seu formulário</div><span class="timer">Tempo restante: 00:05</span><div class="fake-line"></div><div class="fake-submit">Confirmar antes que expire</div>'};
 const better={small:'<div class="fake-top">Meu espaço</div><div class="large-targets"><span>Adicionar</span><span>Excluir</span><span>Opções</span></div>',drag:'<div class="fake-top">Organize suas tarefas</div><div class="list-item"><span>Revisar conteúdo</span></div><div class="large-targets"><span>↑ Mover para cima</span><span>↓ Mover para baixo</span></div><p class="drag-hint">Também disponível por comando de voz</p>',time:'<div class="fake-top">Confirme seu formulário</div><span class="timer relaxed">Seu preenchimento está salvo</span><div class="large-targets"><span>Preciso de mais tempo</span><span>Confirmar</span></div>'};
 const descriptions={small:'Ícones pequenos e muito próximos.',drag:'Lista que só permite reordenar arrastando.',time:'Formulário com cinco segundos para confirmar.'};
 const accessible={small:'Ações com áreas grandes e espaçadas.',drag:'Ações nomeadas para mover para cima ou para baixo, também por voz.',time:'Preenchimento preservado e opção de ampliar o tempo.'};
 return `<div class="scene ${improved?'improved':''}" role="img" aria-label="${improved?accessible[type]:descriptions[type]}"><div class="scene-label">${improved?'DEPOIS · COM ALTERNATIVAS':'ANTES · BARREIRA'}</div><div class="fake-app" aria-hidden="true">${improved?better[type]:contents[type]}</div></div>`;
}
function instructions(){return {ready:'Diga “começar” para iniciar.',challenge:'Responda “opção A”, “opção B” ou “opção C”.',learning:'Diga “próximo” para continuar ou “voltar” para rever a pergunta.',practice:'Coloque “Preparar apresentação” em primeiro lugar. Diga “selecionar tarefa dois”, “mover para cima” e “confirmar”. Você também pode dizer “mover para baixo”, “desfazer” ou “voltar”.',reflection:'Diga “barulho”, “reconhecimento”, “comandos”, “outro” ou “sem dificuldade”. Depois diga “próximo”. A reflexão é opcional.'}[state.phase]||'';}
function render(){
 const c=CHALLENGES[state.index];
 $('step-label').textContent=({ready:'TESTE DE VOZ',practice:'AGORA É COM VOCÊ',reflection:'SUA EXPERIÊNCIA',done:'EXPERIÊNCIA CONCLUÍDA'})[state.phase]||c.label;
 $('progress-text').textContent=({ready:'Antes de começar',practice:'Atividade prática',reflection:'Uma pausa para refletir',done:'Percurso concluído'})[state.phase]||`Desafio ${state.index+1} de 3`;
 $('progress-fill').style.width=`${({ready:0,practice:75,reflection:90,done:100})[state.phase]??(state.index+(state.phase==='learning'?1:.3))/3*70}%`;
 if(state.phase==='ready')$('screen').innerHTML='<h2>Vamos abrir um novo caminho?</h2><p class="screen-copy">Apoie o celular onde for confortável. Nos desafios, diga “opção A”, “opção B” ou “opção C”. Você pode repetir quantas vezes precisar.</p><div class="command-call">Diga “começar”</div><p class="choice-note">Não há corrida nem ranking. O objetivo é descobrir e discutir as barreiras.</p>';
 if(state.phase==='challenge')$('screen').innerHTML=`<h2>${c.title}</h2>${scene(c.scene)}<p class="screen-copy">${c.question}</p><ol class="choices">${c.options.map((text,i)=>`<li><span class="choice-letter">${'ABC'[i]}</span><span>${text}</span></li>`).join('')}</ol><p class="choice-note">Diga “opção A”, “opção B” ou “opção C”. Para ver a orientação novamente, diga “repetir”.</p>`;
 if(state.phase==='learning')$('screen').innerHTML=`<p class="result-label">${state.answer===c.correct?'Você identificou a solução.':'Vamos olhar essa situação mais de perto.'} Alternativa ${c.correct.toUpperCase()}.</p><h2>${c.takeaway}</h2><p class="screen-copy">${c.barrier}</p><div class="comparison">${scene(c.scene)}${scene(c.scene,true)}</div><div class="lesson"><h3>Como remover a barreira</h3><p>${c.solution}</p></div><div class="command-call">Diga “próximo” para continuar</div>`;
 if(state.phase==='practice')$('screen').innerHTML=`<h2>Organize com a voz.</h2><p class="screen-copy">Sua missão: colocar <strong>Preparar apresentação</strong> no primeiro lugar da lista, sem arrastar.</p><ol class="task-list">${state.tasks.map((id,i)=>`<li class="${state.selected===id?'selected':''}"><span class="task-number">${i+1}</span><span>${TASKS[id]}</span>${state.selected===id?'<span class="selected-label">Selecionada</span>':''}</li>`).join('')}</ol><div class="command-guide"><span>1. “Selecionar tarefa dois”</span><span>2. “Mover para cima”</span><span>3. “Confirmar”</span></div><p class="choice-note">Os números correspondem às posições atuais. Você também pode mover para baixo e desfazer a última ação.</p>`;
 if(state.phase==='reflection')$('screen').innerHTML=`<div class="complete-mark" aria-hidden="true">✓</div><h2>Você reorganizou sem arrastar.</h2><p class="screen-copy">O que dificultou sua participação? A resposta não é enviada ao apresentador nem salva pelo site. O navegador pode processar sua fala em um serviço externo.</p><ul class="reflection-list">${Object.entries(REFLECTIONS).map(([key,label])=>`<li class="${state.reflection===key?'chosen':''}">${state.reflection===key?'✓ ':''}${label}<span>Diga “${{noise:'barulho',recognition:'reconhecimento',commands:'comandos',other:'outro',none:'sem dificuldade'}[key]}”</span></li>`).join('')}</ul><div class="command-call">Diga “próximo” para concluir</div><p class="choice-note">Responder é opcional. Você pode dizer “voltar” para rever sua ação.</p>`;
 if(state.phase==='done'){
  $('screen').innerHTML='<div class="complete-mark" aria-hidden="true">✓</div><h2>Mais possibilidades de participar.</h2><p class="screen-copy">Você explorou três barreiras de acessibilidade motora:</p><ul class="takeaways"><li>Botões pequenos e muito próximos.</li><li>Gestos que exigem precisão e movimento contínuo.</li><li>Limites de tempo que não respeitam ritmos diferentes.</li></ul><p class="closing">Controle por voz pode ampliar a autonomia de algumas pessoas. Para outras, falar também pode ser uma barreira. Uma interface acessível oferece diferentes formas de realizar a mesma ação.</p><p class="screen-copy">Para conversar com a turma: em qual situação a voz ajudou você? Quando outra forma de acesso seria melhor?</p><button id="restart" class="secondary">Voltar ao início</button>';
  speech.stop();$('status').textContent='Atividade concluída • microfone desligado';$('resume').hidden=true;$('alternative').hidden=true;
  $('restart').addEventListener('click',()=>location.reload());
 }
 $('commands-help').textContent=state.phase==='done'?'Atividade encerrada. Use “Voltar ao início” para recomeçar.':instructions()+' “Voltar” e “desfazer” recuperam a ação anterior. “Repetir” mostra a orientação. “Rolar para baixo” e “rolar para cima” permitem ler a tela sem tocar.';
}
function handleTranscript(text){
 if(state.phase==='done')return;
 const now=Date.now();if(now-lastInput<1000&&!alternative)return;lastInput=now;
 $('heard').textContent=`Você disse: “${String(text).slice(0,160)}”`;
 const command=normalizeCommand(text);
 if(['scroll-down','scroll-up'].includes(command)){window.scrollBy({top:window.innerHeight*.65*(command==='scroll-down'?1:-1),behavior:'instant'});return;}
 if(command==='repeat'){$('feedback').textContent=instructions();return;}
 const next=reduceGame(state,command);
 if(next===state){$('feedback').textContent=state.phase==='practice'&&command==='confirm'?'Primeiro coloque “Preparar apresentação” na posição 1.':state.phase==='practice'&&['up','down'].includes(command)?'Selecione uma tarefa antes de mover e confira se há espaço nessa direção.':instructions();return;}
 const previousPhase=state.phase;state=next;$('feedback').textContent='';render();
 if(previousPhase!==state.phase)$('experience').scrollIntoView({block:'start',behavior:'instant'});
}
function launch(useAlternative=false){
 if(!started){started=true;$('intro').hidden=true;$('experience').hidden=false;render();window.scrollTo({top:0,behavior:'instant'});}
 if(useAlternative||!speech.supported){enableAlternative();return;}
 blocked=false;alternative=false;$('status').textContent='Aguardando autorização do microfone…';$('resume').hidden=true;speech.start();
}
function enableAlternative(){
 alternative=true;speech.stop();$('alternative').hidden=false;$('status').textContent='Modo alternativo • ditado ou texto';$('resume').hidden=true;
 $('feedback').textContent='Use o microfone do teclado ou digite o comando no campo abaixo.';$('command').focus();
}
$('activate').addEventListener('click',()=>launch());$('intro-alternative').addEventListener('click',()=>launch(true));
$('fallback').addEventListener('click',enableAlternative);$('resume').addEventListener('click',()=>launch());
$('alternative').addEventListener('submit',e=>{e.preventDefault();handleTranscript($('command').value);$('command').value='';});
window.addEventListener('pagehide',()=>speech.stop());
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started&&!alternative&&state.phase!=='done'){speech.stop();$('status').textContent='Microfone pausado • reative ao voltar';$('resume').hidden=false;}});
