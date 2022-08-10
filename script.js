
const controls = window;
const drawingUtils = window;
const mpFaceMesh = window;
var cnt=0;
const config = { locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@` +
            `${mpFaceMesh.VERSION}/${file}`;
    } };

// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const controlsElement = document.getElementsByClassName('control-panel')[0];
const canvasCtx = canvasElement.getContext('2d');
/**
 * Solution options.
 */
const solutionOptions = {
    enableFaceGeometry: true,
    staticImageMode: true,
    selfieMode: true,
    maxNumFaces: 1,
    refineLandmarks: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
};
// We'll add this to our control panel later, but we'll save it here so we can
// call tick() each time the graph runs.
const fpsControl = new controls.FPS();
// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
    spinner.style.display = 'none';
};


function onResults(results) {
    // Hide the spinner.
    document.body.classList.add('loaded');
    // Update the frame rate.
    fpsControl.tick();
    // Draw the overlays.
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            drawingUtils.drawConnectors(
                canvasCtx, landmarks, mpFaceMesh.FACEMESH_TESSELATION,
                {color: '#C0C0C070', lineWidth: 1});
            drawingUtils.drawConnectors(
                canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_EYE,
                {color: '#FF3030'});
            drawingUtils.drawConnectors(
                canvasCtx, landmarks, mpFaceMesh.FACEMESH_RIGHT_EYEBROW,
                {color: '#FF3030'});
            drawingUtils.drawConnectors(
                canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_EYE,
                {color: '#30FF30'});
            drawingUtils.drawConnectors(
                canvasCtx, landmarks, mpFaceMesh.FACEMESH_LEFT_EYEBROW,
                {color: '#30FF30'});
            drawingUtils.drawConnectors(
                canvasCtx, landmarks, mpFaceMesh.FACEMESH_FACE_OVAL,
                {color: '#E0E0E0'});
            drawingUtils.drawConnectors(
                canvasCtx, landmarks, mpFaceMesh.FACEMESH_LIPS, {color: '#E0E0E0'});
        }
    }
        if (results.multiFaceGeometry.length > 0){
            cnt+=1;
            if(cnt==3){
                cnt=0;
            let mat = results.multiFaceGeometry[0].getPoseTransformMatrix().h[2];
            let Yaw = (Math.atan2(-mat[8],mat[0]) / Math.PI * 180).toFixed(2);
            let Roll = (Math.asin(mat[4]) / Math.PI * 180).toFixed(2);
            let Pitch = (Math.atan2(-mat[6], mat[5]) / Math.PI * 180).toFixed(2);
            let yawA = document.getElementById("Yaw");
            yawA.textContent = String(Yaw)
            let rollA = document.getElementById("Roll");
            rollA.textContent = String(Roll)
            let pitchA = document.getElementById("Pitch");
            pitchA.textContent = String(Pitch)
            }
        }
    canvasCtx.restore();
}
const faceMesh = new mpFaceMesh.FaceMesh(config);
faceMesh.setOptions(solutionOptions);
faceMesh.onResults(onResults);
// Present a control panel through which the user can manipulate the solution
// options.
new controls
    .ControlPanel(controlsElement, solutionOptions)
    .add([
    new controls.StaticText({ title: 'MediaPipe Face Mesh' }),
    fpsControl,
    new controls.Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new controls.SourcePicker({
        onFrame: async (input, size) => {
            const aspect = size.height / size.width;
            let width, height;
            if (window.innerWidth > window.innerHeight) {
                height = window.innerHeight;
                width = height / aspect;
            }
            else {
                width = window.innerWidth;
                height = width * aspect;
            }
            canvasElement.width = width;
            canvasElement.height = height;
            await faceMesh.send({ image: input });
        },
        cameraOptions: {
            height: 1080,
            width: 1920,
        }
    }),
    new controls.Slider({
        title: 'Max Number of Faces',
        field: 'maxNumFaces',
        range: [1, 4],
        step: 1
    }),
    new controls.Slider({
        title: 'Min Detection Confidence',
        field: 'minDetectionConfidence',
        range: [0, 1],
        step: 0.01
    }),
    new controls.Slider({
        title: 'Min Tracking Confidence',
        field: 'minTrackingConfidence',
        range: [0, 1],
        step: 0.01
    }),
])
    .on(x => {
    const options = x;
    videoElement.classList.toggle('selfie', options.selfieMode);
    faceMesh.setOptions(options);
});

console.log(controls)