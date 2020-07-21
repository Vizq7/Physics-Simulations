//State vectors
StateE = [0, 0]
StateRK2 = [0, 0]
StateRK4 = [0, 0]

//Access idx for the state vectors 
StateCurrentTime = 0
StateVolume = 1

initTime = 0.0
initVolume = 0.0

WindowWidthHeight = 300
WorldSize = 2.0
PixelsPerMeter = (WindowWidthHeight) / WorldSize
OriginPixelsX = 0.5 * WindowWidthHeight
OriginPixelsY = 0.45 * WindowWidthHeight

//Constants
g = 9.8
Ain = 0.2
Aout = 0.03
Atank = 0.8
deltaT = 1.0 / 60.0

function setup() {
    //Init state vectors
    StateE[StateCurrentTime] = initTime
    StateE[StateVolume] = initVolume

    StateRK2[StateCurrentTime] = initTime
    StateRK2[StateVolume] = initVolume

    StateRK4[StateCurrentTime] = initTime
    StateRK4[StateVolume] = initVolume

    //Canvas config
    colorMode(RGB, 1.0)
    canvas = createCanvas(250, 300)
	canvas.parent('sketchContainer');
    frameRate(1.0 / deltaT)

    //Reload button
    button = createButton('Reload');
    button.position(1120, 410);
    button.mousePressed(reset);
}

function reset() {
    location.reload();
}

function timeStepE(delta_t) {
    Vin = 4 * exp(-0.4 * StateE[StateCurrentTime]) * Ain

    h = StateE[StateVolume] / Atank
    Vout = sqrt(2 * g * h) * Aout

    StateE[StateVolume] += delta_t * (Vin - Vout)

    StateE[StateCurrentTime] += delta_t

    return
}

function timeStepRK2(delta_t) {
    Vin = 4 * exp(-0.4 * StateRK2[StateCurrentTime]) * Ain

    h = StateRK2[StateVolume] / Atank
    Vout = sqrt(2 * g * h) * Aout
    F1 = Vin - Vout


    Vin = 4 * exp(-0.4 * (StateRK2[StateCurrentTime] + delta_t)) * Ain

    h = (StateRK2[StateVolume] + (delta_t * F1)) / Atank
    Vout = sqrt(2 * g * h) * Aout
    F2 = Vin - Vout


    StateRK2[StateVolume] += (delta_t / 2) * (F1 + F2)

    StateRK2[StateCurrentTime] += delta_t

    return
}

function timeStepRK4(delta_t) {
    Vin = 4 * exp(-0.4 * StateRK4[StateCurrentTime]) * Ain

    h = StateRK4[StateVolume] / Atank
    Vout = sqrt(2 * g * h) * Aout
    F1 = Vin - Vout

    Vin = 4 * exp(-0.4 * (StateRK4[StateCurrentTime] + (delta_t / 2))) * Ain

    h = (StateRK4[StateVolume] + delta_t / 2 * F1) / Atank
    Vout = sqrt(2 * g * h) * Aout
    F2 = Vin - Vout

    Vin = 4 * exp(-0.4 * (StateRK4[StateCurrentTime] + delta_t / 2)) * Ain

    h = (StateRK4[StateVolume] + (delta_t / 2 * F2)) / Atank
    Vout = sqrt(2 * g * h) * Aout
    F3 = Vin - Vout


    Vin = 4 * exp(-0.4 * (StateRK4[StateCurrentTime] + delta_t)) * Ain

    h = (StateRK4[StateVolume] + (delta_t * F3)) / Atank
    Vout = sqrt(2 * g * h) * Aout
    F4 = Vin - Vout

    StateRK4[StateVolume] += (delta_t / 6) * (F1 + 2 * F2 + 2 * F3 + F4)

    StateRK4[StateCurrentTime] += delta_t

    return
}

function DrawState() {
    hE = StateE[StateVolume] / Atank
    hRK2 = StateRK2[StateVolume] / Atank
    hRK4 = StateRK4[StateVolume] / Atank

    fill(0.0, 1.0, 0.0)
    rect(-0.5 * PixelsPerMeter, 0.75 * PixelsPerMeter, 1.0 / 4 * PixelsPerMeter, -hE * PixelsPerMeter)
    fill(0.0, 0.0, 1.0)
    rect((-0.5 + 1.0 / 4) * PixelsPerMeter, 0.75 * PixelsPerMeter, 1.0 / 4 * PixelsPerMeter, -hRK2 * PixelsPerMeter)
    fill(1.0, 0.0, 0.0)
    rect((-0.5 + 2.0 / 4) * PixelsPerMeter, 0.75 * PixelsPerMeter, 1.0 / 4 * PixelsPerMeter, -hRK4 * PixelsPerMeter)

    fill(1, 1, 1, 0)
    rect(-0.5 * PixelsPerMeter, -0.75 * PixelsPerMeter, 0.75 * PixelsPerMeter, 1.5 * PixelsPerMeter)

    y = 0
    step = 1.5 / 15
    stroke(0, 0, 0)
    textSize(12)
    fill(0);
    while (y < 1.5 + step) {
        line(-0.55 * PixelsPerMeter, (y - 0.75) * PixelsPerMeter, -0.5 * PixelsPerMeter, (y - 0.75) * PixelsPerMeter)
        text(str(round(y * 10) / 10), -0.7 * PixelsPerMeter, -(y - 0.77) * PixelsPerMeter)
        y += step
    }
    text("Euler", -0.45 * PixelsPerMeter, 0.85 * PixelsPerMeter)
    text("RK2", -0.18 * PixelsPerMeter, 0.85 * PixelsPerMeter)
    text("RK4", 0.05 * PixelsPerMeter, 0.85 * PixelsPerMeter)

    textSize(18)
    text("Time = " + str(round(StateE[StateCurrentTime] * 10) / 10) + "s", -0.4 * PixelsPerMeter, PixelsPerMeter)
}


function draw() {
    timeStepE(deltaT)
    timeStepRK2(deltaT)
    timeStepRK4(deltaT)

    background(0.75)

    translate(OriginPixelsX, OriginPixelsY)

    DrawState()
}