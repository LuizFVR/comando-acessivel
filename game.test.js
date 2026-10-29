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
  assert.equal(s.phase,'done');
});
test('resposta incorreta também ensina e não cria ranking',()=>{
 const s=reduceGame(reduceGame(createInitialState(),'start'),'a');
 assert.equal(s.phase,'learning'); assert.equal(s.answer,'a'); assert.equal('score' in s,false);
});
