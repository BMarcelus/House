var SOUNDASSETS='sounds/';
var VOLUME = 0.5;

var AUDIOCONTEXT;
var DESTINATION;
var BUFFERBUFFER = [];
var SOUND_INITIALIZED = false;
function setVolume(val) {
  if(val < 0) val = 0;
  if(val > 1) val = 1;
  VOLUME = val;
  DESTINATION.gain.setValueAtTime(val, 0);  
}
function initializeSound() {
  if(SOUND_INITIALIZED) return false;
  try {
    if('webkitAudioContext' in window) {
      AUDIOCONTEXT = new webkitAudioContext();
    } else {
      AUDIOCONTEXT = new AudioContext();
    }
    AUDIOCONTEXT.resume();
    var GAIN = AUDIOCONTEXT.createGain();
    GAIN.connect(AUDIOCONTEXT.destination);
    DESTINATION = GAIN;
    setVolume(0.5);
    for(var i in BUFFERBUFFER) {
      BUFFERBUFFER[i].beginLoad();
    }
    BUFFERBUFFER = [];
    SOUND_INITIALIZED = true;
    return true;
  }
  catch (error){
    alert(error);
  }
}
function loadBuffer(url, callback) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  // if(OnFile) url = webDomain + url;
  // else url = '.' + url;
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    AUDIOCONTEXT.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        callback(buffer);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function() {
    console.log("BufferLoader: XHR error");
    console.log("Cannot load sounds from File system");
  }

  request.send();
}
class SoundSource {
  constructor(url, playbackRate, volume) {
    url = SOUNDASSETS + url;    
    this.url = url;
    this.loaded = false;
    this.playbackRate = playbackRate || 1;
    this.volume = volume || 1;
    this.loops=false;
    BUFFERBUFFER.push(this);
    this.lastSound = null;
  }
  beginLoad() {
    loadBuffer(this.url, this.onloadBuffer.bind(this));
  }
  onloadBuffer(buffer) {
    this.buffer=buffer;
    this.loaded = true;
  }
  stopSound() {
    if(!this.lastSound) return;
    this.lastSound.stopSound();
    this.lastSound = null;
  }
  pause() {
    this.setVolume(0);
    // if(!this.lastSound)return;
    // this.pauseTime = this.lastSound.getTime();
    // this.stopSound();
  }
  resume() {
    this.setVolume(1);
    // if(!this.lastSound||!this.pauseTime)return;
    // this.lastSound.resume(this.pauseTime);
  }
  setVolume(v) {
    if(!this.lastSound)return;
    this.lastVolume = v;
    v = v*this.volume;
    if(v<0)v=0;
    if(v>1)v=1;
    this.lastSound.myGain.gain.setValueAtTime(v, AUDIOCONTEXT.currentTime);
  }
  play() {
    var audioContext= AUDIOCONTEXT;
    var destination = DESTINATION;
    if(!destination)return;
    var time = audioContext.currentTime;
    var source = audioContext.createBufferSource();
    source.buffer = this.buffer;

    //3 -> -100     
    //0.5 -> 100    
    // source.detune.setValueAtTime(-100, time);
    source.playbackRate.value = this.playbackRate;
    // if(pitchShift != null) {
    //   source.playbackRate.setValueAtTime(pitchShift, time)
    //   // source.detune = pitchShift;
    //   // source.detune.setValueAtTime(pitchShift*100, time);
    // }
    var r = 1;// + (Math.random()-0.5)/10;
    // var pbr = (this.playbackRate)/10+0.9;
    // source.playbackRate.setValueAtTime(pbr,time);
    source.start(time);  
    if(this.loops) source.loop = true;
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(this.volume, time);
    // gain.gain.setValueAtTime(0, time + 1/this.playbackRate);
    gain.connect(destination);
    source.connect(gain);    
    source.stopSound = function() {
      try {
        this.disconnect(gain);
      } catch(e) {
        console.log(e);
      }
    };
    source.myGain = gain;
    this.lastSound = source;
    source.getTime = function() {}
    source.pause = function() {}
    source.resume = function() {}
    return source;
  }
}

class SoundTag {
  constructor(url, playbackRate, volume) {
    url = SOUNDASSETS + url;
    this.url = url;
    this.playbackRate = playbackRate || 1;
    this.volume = volume || 1;
    this.lastVolume = this.volume;
    this.createAudio();
  }
  createAudio() {
    var audioElement = document.createElement("audio");
    // audioElement.mozPreservesPitch = false;
    audioElement.src = this.url;
    this.audioElement = audioElement;
    audioElement.playbackRate = this.playbackRate;
    this.setVolume(1);
  }
  play() {
    this.audioElement.play();
    this.audioElement.currentTime = 0;
    if(this.loops) this.audioElement.loop = true;        
    return this;
  }
  stopSound() {
    this.audioElement.pause();
  }
  pause() {
    this.audioElement.pause();
  }
  resume(time) {
    this.audioElement.play();
    if(time!=undefined) {
      this.audioElement.currentTime = time;
    }
  }
  getTime() {
    return this.audioElement.currentTime;
  }
  setVolume(v) {
    this.lastVolume = v;        
    v = v*VOLUME*this.volume;
    if(v<0)v=0;
    if(v>1)v=1;
    this.audioElement.volume = v;    
  }
  getVolume() {
    return this.lastVolume;
  }
}

class SoundList {
  constructor(sounds) {
    this.sounds = sounds;
    this.index = 0;
  }
  play() {
    this.sounds[this.index].play();
    this.index = (this.index+1)%this.sounds.length;
  }
}

function dup(name, playback ,volume, amount) {
  var sounds = [];
  for(var i=0;i<amount; ++i) {
    sounds[i] = new SoundTag(name, playback, volume);
  }
  return new SoundList(sounds);
}

var OnFile = (window.location.protocol == "file:");
if(!OnFile) SoundTag = SoundSource;

var SOUNDS={};
SOUNDS.start = new SoundTag('houseyeah.wav', 1, 1);
SOUNDS.shoot = dup('House_s3.wav', 1, 1,3);
SOUNDS.footstep = new SoundList([
  new SoundTag('houseReverb_s3.wav', 1, .3),
  new SoundTag('houseReverb_s3.2.wav', 1, .3),
  new SoundTag('houseReverb_s3.wav', 1, .3),
  new SoundTag('houseReverb_s2.8.wav', 1, .3),
])
SOUNDS.hit = dup('enemyDie.wav', 1, 1.5,3);
SOUNDS.die = new SoundTag('houseReverb_s0.4.wav', 0.4, 2);
SOUNDS.playerHit = new SoundTag('House.wav', 1, 3);
SOUNDS.coin = dup('coin1.wav', 1, 2,10);
SOUNDS.coin2 = dup('coin2.wav', 1, 2,10);
SOUNDS.health = dup('houseq_s2.wav', 1, 2,3);
SOUNDS.enemyDie = dup('enemyDie2.wav', 1,2,10);
SOUNDS.bossSpawn = new SoundTag('HOUSUU.wav', 1,1);
// var music = new SoundTag('Adventure.mp3');
// var dieSound = new SoundTag('die.wav', 1, 0.2);
// var hitSound = new SoundTag('hit2.wav', 1, 0.4);
// var playerHitSound = new SoundTag('hit3.wav', 1, 1);
// var coinSound = new SoundTag('coin.wav', 2, 0.3);
// var enemyDieSound = new SoundTag('enemyDie.wav', 0.5, 0.6);