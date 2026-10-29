import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSpeechController} from './speech.js';
class Fake {start(){this.started=(this.started||0)+1;} stop(){this.onend?.();} abort(){this.onend?.();}}
test('informa navegador incompatível',()=>{assert.equal(createSpeechController({scope:{}}).supported,false);});
test('entrega transcrição, reinicia e encerra sem reiniciar depois de stop',()=>{
 let instance; class Recognition extends Fake{constructor(){super();instance=this;}}
 const jobs=[];let transcript='';
 const c=createSpeechController({scope:{SpeechRecognition:Recognition},schedule:fn=>{jobs.push(fn);return 1;},cancel:()=>{},onTranscript:t=>transcript=t});
 c.start();instance.onresult({resultIndex:0,results:[Object.assign([{transcript:'opção B'}],{isFinal:true})]});
 assert.equal(transcript,'opção B'); instance.onend(); jobs.pop()();assert.equal(instance.started,2);
 c.stop(); assert.equal(jobs.length,0);
});
test('permissão negada interrompe escuta e reporta erro',()=>{
 let instance,error; class Recognition extends Fake{constructor(){super();instance=this;}}
 const c=createSpeechController({scope:{SpeechRecognition:Recognition},onError:e=>error=e,schedule:()=>{throw Error('não reiniciar');}});
 c.start();instance.onerror({error:'not-allowed'});instance.onend();assert.equal(error,'not-allowed');
});
