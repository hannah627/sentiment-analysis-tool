let defaultSettings = {
    soundType: 'OmniOscillator',
    note: 'C4',
    oscillator: {
        sourceType: 'am',
        baseType: 'square',
        partialCount: 8,
        interval: 0.5
    },
    frequency: {
        minimum: 130,
        maximum: 650
    },
    envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8
    },
    volume: -25
};



function makeSynth(Tone, options) {
    synth = new Tone.Envelope({
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8
    }).toDestination();
    synth.frequency.value = options.frequency;
    synth.volume.value = options.volume;
    // synth.type = options.oscillatorType;
    synth.sync();
    synth.triggerAttackRelease(options.frequency, '8n', options.start);

    synth.onstop = function () {
        synth.dispose();
        synth.unsync();
    };

    return synth;
}


function toFrequency(dataPoint, minDataValue, maxDataValue, minFrequency, maxFrequency) {
    return (dataPoint - minDataValue) * (maxFrequency - minFrequency) / (maxDataValue - minDataValue) + minFrequency;
};


function makeSonifier(Tone, data, settings) {
    let start = 0;
    let stop = start + settings.oscillator.interval;
}