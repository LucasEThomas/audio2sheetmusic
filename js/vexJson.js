//Cred to github.com/rubiety/vexflow-json for making this.
//I couldn't figure out how to make it work with jspm, so I just copied it, and changed it into the class format that I like to use. 
//I don't even know if this is the right way to do it, but I'm a newbie. 
//Tbh, I'm still not entirely sure how dependency injection actually works.

var Vex = require('vexflow');
var _ = require('underscore');

class VexJson {
    constructor(data) {
        this.data = data;
        this.stave_offset = 0;
        this.stave_delta = 60;
        this.staves = {};
        this.interpret_data();
    }

    interpret_data() {
        if (this.data instanceof Array) {
            if (this.data[0] instanceof Array) {
                this.notes = this.interpret_notes(this.data);
            } else if (typeof this.data[0] === "string") {
                this.notes = this.interpret_notes([{
                    keys: this.data
            }]);
            }
        } else if (this.data.keys) {
            this.notes = this.interpret_notes([this.data]);
        } else if (this.data.notes) {
            this.notes = this.interpret_notes(this.data.notes);
        } else if (this.data.voices) {
            this.voices = this.interpret_voices(this.data.voices);
        }
    }

    interpret_notes(data) {
        return _(data).map(function(datum) {
            if (typeof datum === "string") {
                if (datum == "|") {
                    return {
                        barnote: true
                    }
                } else {
                    return {
                        duration: "q",
                        keys: this.interpret_keys([datum])
                    };
                }
            } else if (datum instanceof Array) {
                return {
                    duration: "q",
                    keys: this.interpret_keys(datum)
                };
            } else {
                if (datum.keys) {
                    datum.keys = this.interpret_keys(datum.keys);
                    datum.duration || (datum.duration = "q");
                }
                return datum;
            }
        }, this);
    }

    interpret_voices(data) {
        return _(data).map(function(datum) {
            return {
                time: datum.time,
                notes: this.interpret_notes(datum.notes)
            }
        }, this);
    }

    interpret_keys(data) {
        return _(data).map(function(datum) {
            var note_portion, octave_portion, _ref;
            _ref = datum.split("/"), note_portion = _ref[0], octave_portion = _ref[1];
            octave_portion || (octave_portion = "4");
            return "" + note_portion + "/" + octave_portion;
        });
    }

    draw_canvas(canvas, canvas_options) {
        canvas_options = canvas_options || {};

        this.canvas = canvas;
        var backend = Vex.Flow.Renderer.Backends.CANVAS;
        if (canvas.tagName.toLowerCase() === "svg") {
            backend = Vex.Flow.Renderer.Backends.SVG;
        }
        this.renderer = new Vex.Flow.Renderer(this.canvas, backend);
        this.context = this.renderer.getContext();
        this.context.clearRect(0, 0, canvas.width, canvas.height);

        if (canvas_options.scale) {
            this.context.scale(canvas_options.scale, canvas_options.scale);
        }
    }

    draw_stave(clef, keySignature, options) {
        if (clef == null) clef = "treble";
        if (!(clef instanceof Array)) clef = [clef];
        if (options == null) options = {};

        _(clef).each(function(c) {
            this.staves[c] = new Vex.Flow.Stave(10, this.stave_offset, this.width - 20);
            this.staves[c].addClef(c).addKeySignature(keySignature).setContext(this.context).draw();
            this.stave_offset += this.stave_delta;
        }, this);
    }

    stave_notes(notes) {
        return _(notes).map(function(note) {
            if (note.barnote) {
                return new Vex.Flow.BarNote();
            }

            var stave_note;
            note.duration || (note.duration = "h");
            note.clef = "treble"; // Forcing to treble for now, even though bass may be present (we just line it up properly)
            stave_note = new Vex.Flow.StaveNote(note);

            _(note.keys).each(function(key, i) {
                var accidental, note_portion;
                note_portion = key.split("/")[0];
                accidental = note_portion.slice(1, (note_portion.length + 1) || 9e9);

                if (accidental.length > 0) {
                    stave_note.addAccidental(i, new Vex.Flow.Accidental(accidental));
                }
            });
            return stave_note;
        });
    }

    draw_notes(notes) {
        Vex.Flow.Formatter.FormatAndDraw(this.context, this.staves["treble"], notes);
    }

    stave_voices(voices) {
        return _(this.voices).map(function(voice) {
            var stave_voice = new Vex.Flow.Voice({
                num_beats: voice.time.split("/")[0],
                beat_value: voice.time.split("/")[1],
                resolution: Vex.Flow.RESOLUTION
            });

            stave_voice.setStrict(false);
            stave_voice.addTickables(this.stave_notes(voice.notes));
            return stave_voice;
        }, this);
    }

    draw_voices(voices) {
        var formatter = new Vex.Flow.Formatter().joinVoices(voices).format(voices, this.width - 120);
        _(voices).each(function(voice) {
            voice.draw(this.context, this.staves["treble"]);
        }, this);
    }

    render(element, options) {
        options = (options || {});
        this.width = options.width || (element.width | 0) || 600; // coerce weird SVG values to ints
        this.height = options.height || (element.height | 0) || 120;
        this.clef = options.clef;
        this.scale = options.scale || 1;
        this.keySignature = options.keySignature || 'C';

        this.draw_canvas(element, {
            scale: this.scale
        });

        this.draw_stave(this.clef, this.keySignature);

        if (this.voices) {
            this.draw_voices(this.stave_voices(this.voices));
        } else {
            this.draw_notes(this.stave_notes(this.notes));
        }
    }

}

module.exports = VexJson;