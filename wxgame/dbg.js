const fs = require('fs');
const c = fs.readFileSync('d:/Godot_v4.4.1-stable_win64.exe/Games/staroceancatangler/wxgame/engine/godot-sdk.js', 'utf8');

// playBuffer 函数
const i1 = c.indexOf('playBuffer(e,t,r,s){');
process.stdout.write('=== playBuffer ===\n' + c.slice(i1, i1+400) + '\n\n');

// load_buffer
const i2 = c.indexOf('load_buffer(e){');
process.stdout.write('=== load_buffer ===\n' + c.slice(i2, i2+300) + '\n\n');

// load_PCM
const i3 = c.indexOf('load_PCM(e,t,r,s){');
process.stdout.write('=== load_PCM ===\n' + c.slice(i3, i3+300) + '\n\n');

// WEBAudio.play 完整（含 playBuffer 分支）
const i4 = c.indexOf('play(e,t,r,s){if(!V.audioContext');
process.stdout.write('=== WEBAudio.play full ===\n' + c.slice(i4, i4+500) + '\n\n');

// ce.playBuffer
const i5 = c.indexOf('playBuffer(e,t,r,s){try{if(this.setup');
process.stdout.write('=== ce.playBuffer ===\n' + c.slice(i5, i5+400) + '\n\n');
