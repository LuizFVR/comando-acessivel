import {CHALLENGES,createInitialState,normalizeCommand,reduceGame} from './game.js';
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
function scene(type){
 const contents={small:'<div class="fake-top"><span>Meu espaço</span><div class="tiny-icons"><span>+</span><span>×</span><span>⋮</span></div></div><div class="fake-line"></div><div class="fake-line short"></div>',drag:'<div class="fake-top">Organize suas tarefas</div><div class="list-item"><span>Revisar conteúdo</span><span>⠿</span></div><div class="list-item"><span>Preparar apresentação</span><span>⠿</span></div><div class="drag-hint">Segure e arraste para mudar a ordem</div>',time:'<div class="fake-top">Confirme seu formulário</div><span class="timer">Tempo restante: 00:05</span><div class="fake-line"></div><div class="fake-submit">Confirmar antes que expire</div>'};
 return `<div class="scene" role="img" aria-label="${{small:'Interface ilustrativa com três ícones minúsculos e próximos.',drag:'Lista que só permite reordenar segurando e arrastando.',time:'Formulário com prazo de cinco segundos para confirmar.'}[type]}"><div class="scene-label">INTERFACE ILUSTRATIVA</div><div class="fake-app" aria-hidden="true">${contents[type]}</div></div>`;
}
function render(){
 const c=CHALLENGES[state.index];
 $('step-label').textContent=state.phase==='ready'?'TESTE DE VOZ':state.phase==='done'?'EXPERIÊNCIA CONCLUÍDA':c.label;
 $('progress-text').textContent=state.phase==='ready'?'Antes de começar':state.phase==='done'?'3 de 3 desafios':`Desafio ${state.index+1} de 3`;
 $('progress-fill').style.width=`${state.phase==='done'?100:state.phase==='ready'?0:(state.index+(state.phase==='learning'?1:.3))/3*100}%`;
 if(state.phase==='ready')$('screen').innerHTML='<h2>Vamos abrir um novo caminho?</h2><p class="screen-copy">Apoie o celular onde for confortável. Nos desafios, diga “opção A”, “opção B” ou “opção C”. Você pode repetir quantas vezes precisar.</p><div class="command-call">Diga “começar”</div><p class="choice-note">Não há corrida nem ranking. O objetivo é descobrir e discutir as barreiras.</p>';
 if(state.phase==='challenge')$('screen').innerHTML=`<h2>${c.title}</h2>${scene(c.scene)}<p class="screen-copy">${c.question}</p><ol class="choices">${c.options.map((text,i)=>`<li><span class="choice-letter">${'ABC'[i]}</span><span>${text}</span></li>`).join('')}</ol><p class="choice-note">Diga “opção A”, “opção B” ou “opção C”. Para ver a orientação novamente, diga “repetir”.</p>`;
 if(state.phase==='learning')$('screen').innerHTML=`<p class="result-label">${state.answer===c.correct?'Você identificou a solução.':'Vamos olhar essa situação mais de perto.'} Alternativa ${c.correct.toUpperCase()}.</p><h2>${c.takeaway}</h2><p class="screen-copy">${c.barrier}</p><div class="lesson"><h3>Como remover a barreira</h3><p>${c.solution}</p></div><div class="command-call">Diga “próximo” para continuar</div>`;
 if(state.phase==='done'){
  $('screen').innerHTML='<div class="complete-mark" aria-hidden="true">✓</div><h2>Mais possibilidades de participar.</h2><p class="screen-copy">Você explorou três barreiras de acessibilidade motora:</p><ul class="takeaways"><li>Botões pequenos e muito próximos.</li><li>Gestos que exigem precisão e movimento contínuo.</li><li>Limites de tempo que não respeitam ritmos diferentes.</li></ul><p class="closing">Controle por voz pode ampliar a autonomia de algumas pessoas. Para outras, falar também pode ser uma barreira. Uma interface acessível oferece diferentes formas de realizar a mesma ação.</p><p class="screen-copy">Para conversar com a turma: em qual situação a voz ajudou você? Quando outra forma de acesso seria melhor?</p><button id="restart" class="secondary">Voltar ao início</button>';
  speech.stop();$('status').textContent='Atividade concluída • microfone desligado';$('resume').hidden=true;$('alternative').hidden=true;
  $('restart').addEventListener('click',()=>location.reload());
 }
}
function handleTranscript(text){
 if(state.phase==='done')return;
 const now=Date.now();if(now-lastInput<1000&&!alternative)return;lastInput=now;
 $('heard').textContent=`Você disse: “${String(text).slice(0,160)}”`;
 const command=normalizeCommand(text);
 if(command==='repeat'){$('feedback').textContent=state.phase==='challenge'?'Responda dizendo “opção A”, “opção B” ou “opção C”.':state.phase==='ready'?'Diga “começar” para iniciar.':'Diga “próximo” para continuar.';return;}
 const next=reduceGame(state,command);
 if(next===state){$('feedback').textContent=state.phase==='challenge'?'Não reconheci uma resposta. Diga “opção A”, “opção B” ou “opção C”.':state.phase==='ready'?'Diga “começar”.':'Diga “próximo” para continuar.';return;}
 state=next;$('feedback').textContent='';render();
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
