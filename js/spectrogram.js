'use strict'
class Spectrogram {
    constructor(canvasElementId, audioElementId) {
        this.canvas = document.getElementById(canvasElementId);
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);

        this.canvas.addEventListener('mouseup', (e) => {
            let coords = this.getCursorPosition(this.canvas, e);
            this.drawRepeatingLines(coords.x, coords.y);
        }, false);

        this.firstX = 0;

        this.data = this.imageData.data;

        this.buf = new ArrayBuffer(this.imageData.data.length);
        this.buf8 = new Uint8ClampedArray(this.buf);
        this.data32 = new Uint32Array(this.buf);

        this.x = 0;
        this.bufferSize = 8192; //4096 8192 16384
        this.dataBuffer = new Float32Array(this.height);
        this.uint8array = new Uint8Array(4);
        this.colorData = new Uint8Array(4 * this.bufferSize / 2);

        this.context = new AudioContext();
        this.sampleRate = this.context.sampleRate;
        var audio = document.getElementById(audioElementId);
        var audioSrc = this.context.createMediaElementSource(audio);
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = this.bufferSize;
        // we have to connect the MediaElementSource with the analyser 

        audioSrc.connect(this.analyser);
        //this.biquadFilter.connect(this.analyser);

        audioSrc.connect(this.context.destination);

        audio.currentTime = 0;
        audio.play();

        this.counter = 0;
        this.animate();
    }

    getCursorPosition(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    drawRepeatingLines(x) {
        if (this.firstX === 0) {
            this.drawCrosshairs(x, 0);
            this.firstX = x;
        } else {
            for (let j = this.firstX; j < this.width; j += x - this.firstX)
                this.drawCrosshairs(j);
        }
    }

    drawCrosshairs(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
        this.ctx.stroke();
    }

    gotStream(stream) {
        this.context = new AudioContext();
        this.sampleRate = this.context.sampleRate;

        var input = this.context.createMediaStreamSource(stream);
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = this.bufferSize;
        input.connect(this.analyser);
        this.animate();
    }

    setPixel(x, y, red, green, blue, alpha) {
        this.data32[y * this.width + x] =
            (alpha << 24) | // alpha
            (blue << 16) | // blue
            (green << 8) | // green
            red; // red
    }

    getPixel(x, y) {
        var value = this.data32[y * this.width + x];
        var channels = this.uint32Touint8(value)
        return channels;
    }

    uint32Touint8(uint32) {
        this.uint8array[3] = uint32 >> 24 & 0xff;
        this.uint8array[2] = uint32 >> 16 & 0xff;
        this.uint8array[1] = uint32 >> 8 & 0xff;
        this.uint8array[0] = uint32 & 0xff;
        return data
    }

    drawColumn() {
        var value = 0;
        for (var y = 0; y < this.height; y++) {
            var x = col;
            this.setPixel(x, y, value, value, value, 255)
        }
    }

    getData() {
        var freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(freqByteData);

        // Reverse the direction, making lower frequencies on the bottom.
        for (var i = this.analyser.frequencyBinCount - 1; i >= 0; i--) {
            this.dataBuffer[i] = freqByteData[(this.analyser.frequencyBinCount - 1) - i] / 255.0;
        }

        return this.dataBuffer
    }

    color(value) {
        var rgb = {
            R: 0,
            G: 0,
            B: 0
        };

        if (0 <= value && value <= 1 / 8) {
            rgb.R = 0;
            rgb.G = 0;
            rgb.B = 4 * value + .5; // .5 - 1 // b = 1/2
        } else if (1 / 8 < value && value <= 3 / 8) {
            rgb.R = 0;
            rgb.G = 4 * value - .5; // 0 - 1 // b = - 1/2
            rgb.B = 0;
        } else if (3 / 8 < value && value <= 5 / 8) {
            rgb.R = 4 * value - 1.5; // 0 - 1 // b = - 3/2
            rgb.G = 1;
            rgb.B = -4 * value + 2.5; // 1 - 0 // b = 5/2
        } else if (5 / 8 < value && value <= 7 / 8) {
            rgb.R = 1;
            rgb.G = -4 * value + 3.5; // 1 - 0 // b = 7/2
            rgb.B = 0;
        } else if (7 / 8 < value && value <= 1) {
            rgb.R = -4 * value + 4.5; // 1 - .5 // b = 9/2
            rgb.G = 0;
            rgb.B = 0;
        } else { // should never happen - value > 1
            rgb.R = .5;
            rgb.G = 0;
            rgb.B = 0;
        }

        return [rgb.R, rgb.G, rgb.B, 1].map(function(d) {
            return parseInt(d * 255, 10)
        })
    }

    colorizeData(data) {
        var d;
        for (var i = 0, n = data.length; i < n; i++) {
            d = this.color(data[i]);
            this.colorData.set(d, i * 4);
        }
        return this.colorData;
    }

    addColumn(colorizeData) {
        for (var y = 0; y < this.height; y++) {
            this.setPixel(this.x, y, colorizeData[4 * y + 0], colorizeData[4 * y + 1], colorizeData[4 * y + 2], colorizeData[4 * y + 3]);
        }
        this.x++;
        this.x %= this.width;
    }

    drawFrame(data) {
        var data = data || this.getData();
        var colorData = this.colorizeData(data)

        this.addColumn(colorData);
        this.imageData.data.set(this.buf8);
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    animate() {
        this.drawFrame();
        if (this.counter <= 320) {
            requestAnimationFrame(() => this.animate());

        }
        this.counter++;
    }
}

module.exports = Spectrogram;