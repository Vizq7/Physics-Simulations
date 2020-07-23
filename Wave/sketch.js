// --- CONSTANT DEFINITIONS ---
ConstantC = 0.5 // Velocity constant
WorldSize = 10.0 // Size of the world, in meters
ArraySize = 128 //Number of elements in array
delta_x = WorldSize / ArraySize
delta_t = 1.0 / 24.0


// --- State vectors ---
StateI_J = [0.0, [0.0]]
StateI_J_previous = [0.0, [0.0]]


StateI_GS = [0.0, [0.0]]
StateI_GS_previous = [0.0, [0.0]]

StateCN_J = [0.0, [0.0]]
StateCN_J_previous = [0.0, [0.0]]

StateCN_GS = [0.0, [0.0]]
StateCN_GS_previous = [0.0, [0.0]]

StateTime = 0
Position = 1

function EnforceBoundaryConditions(array) {
    //Apply Neumann boundary conditions
    array[0] = array[1]
    array[ArraySize - 1] = array[ArraySize - 2]
}

//Error function using L2 norm
function ComputeError(array_previous, array_next) {
    sum = 0.0
    sum2 = 0.0
    for (let i = 0; i < ArraySize; i++) {
        sum += sq(array_next[i] - array_previous[i])
        sum2 += sq(array_next[i])
    }

    return sqrt(sum) / sqrt(sum2)
}

function TimeStep(array, array_previous, discretization, solver) {
    //Maximum iterations and error threshold
    maxIterations = 20
	//By default no error threshold is applied for stability reasons
    threshold = -1

    //aii (diagonal)
    //aij (upper and lower diagonal)
    //mu (amalgamation of constants)

    if (discretization == 'Implicit') {
        mu = sq(ConstantC) * sq(delta_t) / (sq(delta_x))
    } else if (discretization == 'Crank-Nicolson') {
        mu = sq(ConstantC) * sq(delta_t) / (2 * sq(delta_x))
    } else {
        print("Discretization not implemented")
    }

    aii = 1.0 + 2.0 * mu
    aij = -mu

    //Data structures initialization for the matrix operation A*x=b
    b = [0.0]
    uCurrent = [0.0]
	uNext = [0.0]
    
	for (let i = 0; i < ArraySize; i++) {
        uCurrent[i] = array[Position][i]
    }    

    //Iterative Solver implementation
    for (let k = 0; k < maxIterations; k++) {
        for (let i = 1; i < ArraySize - 1; i++) {
            if (solver == 'Jacobi') {
                summatory = aij * (uCurrent[i + 1] + uCurrent[i - 1])
            } else if (solver == 'Gauss-Seidel') {
                summatory = aij * (uCurrent[i + 1] + uNext[i - 1])
            } else {
                print("Solver not implemented")
            }

            if (discretization == 'Implicit') {
                b[i] = 2 * array[Position][i] - array_previous[Position][i]
            } else if (discretization == 'Crank-Nicolson') {
                b[i] = mu / 2 * array[Position][i + 1] + 2 * (1 - mu / 2) * array[Position][i] + mu / 2 * array[Position][i - 1] - array_previous[Position][i]
            } else {
                print("Discretization not implemented")
            }

            uNext[i] = (b[i] - summatory) / aii
        }

        error = ComputeError(uCurrent, uNext)

        if (error <= threshold) {
            break
        }

        EnforceBoundaryConditions(uNext)


        for (let j = 0; j < ArraySize; j++) {
            uCurrent[j] = uNext[j]
        }
    }
    // --- Post-solver cleanup ---
    for (let i = 0; i < ArraySize; i++) {
        array_previous[Position][i] = array[Position][i]
    }

    array_previous[StateTime] = array[StateTime]


    for (let j = 0; j < ArraySize; j++) {
        array[Position][j] = uCurrent[j]
    }

    array[StateTime] += delta_t

    EnforceBoundaryConditions(array[Position])
}

function DrawState() {
    //Constants for visualization purposes
    PixelsPerCell = 6
    OffsetX = 716
    OffsetY = 0.8 * 800

    for (let i = 0; i < ArraySize; i++) {
        PixelsX = i * (PixelsPerCell - 1)

        SimY = max(StateI_J[Position][i], 0)
        fill(SimY, 0.0, (1 - SimY))
        rect(OffsetX - PixelsX, 250, PixelsPerCell - 1, -150 * SimY)

        SimY = max(StateI_GS[Position][i], 0)
        fill(SimY, 0.0, (1 - SimY))
        rect(OffsetX - PixelsX, 450, PixelsPerCell - 1, -150 * SimY)

        SimY = max(StateCN_J[Position][i], 0)
        fill(SimY, 0.0, (1 - SimY))
        rect(OffsetX - PixelsX, 650, PixelsPerCell - 1, -150 * SimY)

        SimY = max(StateCN_GS[Position][i], 0)
        fill(SimY, 0.0, (1 - SimY))
        rect(OffsetX - PixelsX, 850, PixelsPerCell - 1, -150 * SimY)
    }

    //Protect the figure's name
    fill(1.0, 1.0, 1.0)
    rect(0.0, 0.0, 900 - 1, 40)
    //Title
    fill(0.0)
    textSize(21)
    text("Wave Equation - Implicit Methods", 10, 30)

    //Labels
    fill(0.0)
    text("Discretization: Implicit,                Solver: Jacobi", 84, 100)
    text("Discretization: Implicit,                Solver: Gauss-Seidel", 84, 300)
    text("Discretization: Crank-Nicholson, Solver: Jacobi", 84, 500)
    text("Discretization: Crank-Nicholson, Solver: Gauss-Seidel", 84, 700)
}

function reset() {
    location.reload();
}

function setup() {
    for (let i = 0; i < ArraySize; i++) {
        
		// --- Get initial height values from Perlin noise function ---
        worldX = 2341.17 + delta_x * i
		rndVal = 0.5 * noise( worldX * 0.0625 ) + 0.4 * noise( worldX * 0.125 ) + 0.3 * noise( worldX * 0.25 ) + 0.2 * noise( worldX * 0.5 );

        StateI_J[Position][i] = rndVal
        StateI_J_previous[Position][i] = rndVal

        StateI_GS[Position][i] = rndVal
        StateI_GS_previous[Position][i] = rndVal

        StateCN_J[Position][i] = rndVal
        StateCN_J_previous[Position][i] = rndVal

        StateCN_GS[Position][i] = rndVal
        StateCN_GS_previous[Position][i] = rndVal
    }
	
	//Reset button
    button = createButton('Reload');
    button.position(1400, 800);
    button.mousePressed(reset);
	
    canvas = createCanvas(800, 900)
	canvas.parent('sketchContainer');
	
    colorMode(RGB, 1.0)
    noStroke()
    textSize(24)
}

function draw() {
    background(0.9)

    TimeStep(StateI_J, StateI_J_previous, 'Implicit', 'Jacobi')
    TimeStep(StateI_GS, StateI_GS_previous, 'Implicit', 'Gauss-Seidel')
    TimeStep(StateCN_J, StateCN_J_previous, 'Crank-Nicolson', 'Jacobi')
    TimeStep(StateCN_GS, StateCN_GS_previous, 'Crank-Nicolson', 'Gauss-Seidel')

    print("")
    DrawState()
}