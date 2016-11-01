var NoteBuilder = require('./noteBuilder.js');
var Spectrogram = require('./spectrogram.js');

var noteBuilder = new NoteBuilder('sheetMusic');
var spectrogram = new Spectrogram('spectrogram', 'audio');


noteBuilder.pushNote('C');
noteBuilder.pushNote('C');
noteBuilder.pushNote('C');
