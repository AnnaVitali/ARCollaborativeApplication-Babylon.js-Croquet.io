const canvas = document.getElementById("renderCanvas");

class RootModel extends Croquet.Model {

    /**
    * Initialize the Model.
    * */
    init() {
        this.linkedViews = [];

        this.subscribe(this.sessionId, "view-join", this.viewJoin);
        this.subscribe(this.sessionId, "view-exit", this.viewDrop);

        this.#initializeScene();
        this.#activateRenderLoop();

    }

    /**
     * Handle a new connected view.
     * @param {any} viewId the id of the new view connected.
     */
    viewJoin(viewId){
        console.log("MODEL: received view join");
        this.linkedViews.push(viewId);
        console.log("Is user manipulating " + this.isUserManipulating);
    }

    /**
     * Handle the view left event.
     * @param {any} viewId the id of the outgoing view.
     */
    viewDrop(viewId){
        console.log("MODEL: received view left");
        this.linkedViews.splice(this.linkedViews.indexOf(viewId),1);
        console.log(this.linkedViews);
        if(this.linkedViews.length === 0){
            this.destroy();
        }
    }

    #initializeScene(){
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color3.Black;

        const alpha =  3 * Math.PI/2;
        const beta = Math.PI/50;
        const radius = 220;
        const target = new BABYLON.Vector3(0, 0, 0);

        const camera = new BABYLON.ArcRotateCamera("Camera", alpha, beta, radius, target, this.scene);
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
        light.intensity = 1;

        this.GUIManager = new BABYLON.GUI.GUI3DManager(this.scene);
        this.GUIManager.useRealisticScaling = true;
    }

    async #createWebXRExperience() {
        const supported = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar')
        let xrHelper

        if (supported) {
            console.log("IMMERSIVE AR SUPPORTED");
            xrHelper = await this.scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: 'immersive-ar',
                    referenceSpaceType: "local-floor"
                }
            });
        } else {

            this.#displayMessageError()

        }

        try {
            xrHelper.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
        } catch (err) {
            console.log("Articulated hand tracking not supported in this browser.");
        }

        return this.scene;
    }

    #activateRenderLoop() {
        this.#createWebXRExperience().then(sceneToRender => {
            this.engine.runRenderLoop(() => sceneToRender.render());
        });
    }

    #displayMessageError(){
        //Add GUI for non-AR mode
        const rectangle = new BABYLON.GUI.Rectangle("rect");
        rectangle.background = "black";
        rectangle.color = "blue";
        rectangle.width = "80%";
        rectangle.height = "50%";

        advancedTexture.addControl(rectangle);
        const panel = new BABYLON.GUI.StackPanel();
        rectangle.addControl(panel);

        const message = new BABYLON.GUI.TextBlock("message");
        message.fontFamily = "Helvetica";
        message.textWrapping = true;
        message.text = "AR is not available in your system. \n" +
            "Please make sure you use a supported mobile device such as a modern Android device and a supported browser like Chrome. \n" +
            "Make sure you have Google AR services installed and that you enabled the WebXR incubation flag under chrome://flags\"";
        message.color = "white";
        message.fontSize = "20px";
        message.height = "100px"

        message.paddingLeft = "10px";
        message.paddingRight = "10px";
        panel.addControl(message);
    }

}


RootModel.register("RootModel");


export { RootModel };