'use strict';
var Vex = require('vexflow');
var _ = require('underscore');
var VexJson = require('./vexJson.js');

class NoteBuilder {
    constructor(element_id) {
        this.element = document.getElementById(element_id);
        this.noteData = {
            clef: "treble",
            notes: [],
        };
        this.render(this.noteData);
    }

    render(data, render_options) {
        var json = new VexJson(data);
        json.render(this.element, render_options);
    }

    pushNote(note, duration) {
        duration = duration || 'q';

        this.noteData.notes.push({
            duration: duration,
            keys: [note]
        });

        this.render(this.noteData);
        return this;
    }
    changeNote(index, note, duration) {
        duration = duration || 'q';
        this.noteData[index] = {
            duration: duration,
            keys: [note]
        };

        this.render(this.noteData);
        return this;
    }
}

module.exports = NoteBuilder;