import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHALLENGES,createInitialState,normalizeCommand,reduceGame} from './game.js';
test('reconhece comandos e rejeita frases ambíguas',()=>{
  for(const [input,out] of [['Opção B.','b'],['começar','start'],['próximo','next'],['letra c','c'],['repete','repeat'],['','unknown'],['a b','unknown']]) assert.equal(normalizeCommand(input),out);
});
test('percorre três desafios sem pular aprendizagem',()=>{
  let s=createInitialState();
  assert.equal(reduceGame(s,'next').phase,'ready');
  s=reduceGame(s,'start');
  for(let i=0;i<3;i++){
    assert.equal(s.index,i); assert.equal(s.phase,'challenge');
    assert.deepEqual(reduceGame(s,'unknown'),s);
    assert.equal(reduceGame(s,'next').phase,'challenge');
    s=reduceGame(s,CHALLENGES[i].correct); assert.equal(s.phase,'learning');
    assert.deepEqual(reduceGame(s,'a'),s);
    s=reduceGame(s,'next');
  }
  assert.equal(s.phase,'practice');
});
test('organiza uma tarefa por voz e só confirma a ordem solicitada',()=>{
 let s={...createInitialState(),phase:'practice'};
 assert.equal(reduceGame(s,'confirm'),s);
 s=reduceGame(s,normalizeCommand('selecionar tarefa dois'));
 s=reduceGame(s,normalizeCommand('mover para cima'));
 assert.deepEqual(s.tasks,['preparar','revisar','apresentar']);
 s=reduceGame(s,'confirm');assert.equal(s.phase,'reflection');
 s=reduceGame(s,'noise');assert.equal(s.reflection,'noise');
 s=reduceGame(s,'next');assert.equal(s.phase,'done');
});
test('desfazer restaura movimento e voltar restaura a etapa anterior',()=>{
 let s={...createInitialState(),phase:'practice'};
 s=reduceGame(s,'select-2');s=reduceGame(s,'up');s=reduceGame(s,'undo');
 assert.deepEqual(s.tasks,['revisar','preparar','apresentar']);assert.equal(s.selected,'preparar');
 s=reduceGame(s,'up');s=reduceGame(s,'confirm');s=reduceGame(s,'back');
 assert.equal(s.phase,'practice');assert.equal(s.tasks[0],'preparar');
});
test('movimento no limite e comando inválido preservam estado',()=>{
 let s={...createInitialState(),phase:'practice'};s=reduceGame(s,'select-1');
 assert.equal(reduceGame(s,'up'),s);assert.equal(reduceGame(s,'select-4'),s);
 for(const [v,c] of [['voltar','back'],['desfazer','undo'],['mover para baixo','down'],['confirmar','confirm'],['barulho','noise'],['reconhecimento','recognition']])assert.equal(normalizeCommand(v),c);
});
test('resposta incorreta também ensina e não cria ranking',()=>{
 const s=reduceGame(reduceGame(createInitialState(),'start'),'a');
 assert.equal(s.phase,'learning'); assert.equal(s.answer,'a'); assert.equal('score' in s,false);
});
