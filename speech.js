export function createSpeechController({scope=globalThis,onTranscript=()=>{},onStatus=()=>{},onError=()=>{},schedule=setTimeout,cancel=clearTimeout}={}){
 const Recognition=scope.SpeechRecognition||scope.webkitSpeechRecognition;
 let active=false,timer=null,recognition=null,failures=0;
 if(Recognition){
  recognition=new Recognition();recognition.lang='pt-BR';recognition.continuous=false;recognition.interimResults=false;
  recognition.onstart=()=>{onStatus('listening');};
  recognition.onresult=e=>{failures=0;for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)onTranscript(e.results[i][0].transcript);};
  recognition.onerror=e=>{
   if(['not-allowed','service-not-allowed','audio-capture','language-not-supported'].includes(e.error)){active=false;onError(e.error);}
   else if(e.error!=='no-speech'&&e.error!=='aborted'){failures++;if(failures>=3)active=false;onError(e.error);}
  };
  recognition.onend=()=>{if(active){onStatus('reconnecting');timer=schedule(()=>{timer=null;if(active)begin();},500);}else onStatus('stopped');};
 }
 function begin(){try{recognition.start();}catch(e){active=false;onError('start-failed');}}
 return {supported:!!Recognition,start(){if(!recognition||active)return;active=true;failures=0;begin();},stop(){active=false;if(timer!==null){cancel(timer);timer=null;}recognition?.abort();},speak(text){if(scope.speechSynthesis&&scope.SpeechSynthesisUtterance){scope.speechSynthesis.cancel();const u=new scope.SpeechSynthesisUtterance(text);u.lang='pt-BR';scope.speechSynthesis.speak(u);}}};
}
