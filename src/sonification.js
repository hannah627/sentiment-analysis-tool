let settings = {
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


export async function playGraph(xData, yData) {
    console.log("x data")
    console.log(xData)
    console.log("y data")
    console.log(yData);

    console.log(settings)

    await Tone.start()
    console.log("audio is ready")
    // const synth = new Tone.Synth().toDestination();
    // const osc = new Tone.Oscillator().toDestination();
    // osc.frequency.value = "C4"; // start at "C4"
    // osc.frequency.rampTo("C2", 2); // ramp to "C2" over 2 seconds
    // osc.start().stop("+3"); // start the oscillator for 2 seconds

    // let minFrequency = Tone.Frequency("C4");
    // let maxFrequency = Tone.Frequency("C2");
    let minYVal = Math.min(...yData);
    let maxYVal = Math.max(...yData);

    let oscillations = [];
    let start = 0;
    let stop = start + settings.oscillator.interval;

    yData.map((d) => { toFrequency(d, minYVal, maxYVal, settings.frequency.minimum, settings.frequency.maximum) })
        .forEach((d) => {
            let oscillatorType = 'am' + 'square' + 8;
            let options = {
                    envelope: settings.envelope,
                    frequency: d,
                    note: settings.note,
                    oscillatorType: oscillatorType,
                    start: start,
                    stop: stop,
                    volume: settings.volume
                };

            let synth = makeSynth(Tone, settings.soundType, options);
            oscillations.push(synth);
            start = stop;
            stop = stop + settings.oscillator.interval;
        })


    // osc.frequency.value = toFrequency(yData[0], minYVal, maxYVal, settings.frequency.minimum, settings.frequency.maximum)


    // let oscillatorType = 'am' + 'square' + 8; // oscillator.sourceType + .baseType + .partialCount
    console.log("sonifier - playing sonification")
    Tone.Transport.start();
    return oscillations
}




// let settings = {
//     soundType: 'OmniOscillator',
//     oscillator: {
//         sourceType: 'am',
//         baseType: 'square',
//         partialCount: 8,
//     }
// }



function makeSynth(Tone, soundType, options) {
    let synth = new Tone.Envelope({
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 0.8
    }).toDestination();
    synth.frequency.value = options.frequency; // setting value of undefined apparently
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