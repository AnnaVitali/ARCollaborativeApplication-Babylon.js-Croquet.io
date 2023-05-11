const canvas = document.getElementById("renderCanvas");

class RootModel extends Croquet.Model {

    /**
     * Initialize the Model.
     * */
    init() {
        this.linkedViews = [];
        this.isUserManipulating = false;
        this.viewInControl = null;

        this.subscribe(this.sessionId, "view-join", this.viewJoin);
        this.subscribe(this.sessionId, "view-exit", this.viewDrop);
        this.subscribe("colorButton", "clicked", this.changeHologramColor);
        this.subscribe("controlButton", "clicked", this.manageUserHologramControl);
        this.subscribe("controlButton", "released", this.manageUserHologramControlReleased);
        this.subscribe("hologram", "positionChanged", this.updatePosition);
        this.subscribe("hologram", "rotationChanged", this.updateRotation);
        this.subscribe("hologram", "scaleChanged", this.updateScale);
        this.subscribe("image", "found", this.showHologram);
        this.subscribe("image", "updated", this.updateHologram);

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


        if(this.viewInControl === viewId){
            this.isUserManipulating = false;
            this.linkedViews.forEach(v => this.publish(v, "showManipulatorMenu"));
        }

        if(this.linkedViews.length === 0){
            this.sphere.setEnabled(false);
            this.destroy();
        }
    }

    showHologram(){
        console.log("MODEL: receive image found")
        this.sphere.setEnabled(true);
        this.publish("interactions", "showMenu");
    }

    updateHologram(data){
        this.sphere.position = new BABYLON.Vector3(data.position_x, data.position_y, data.position_z);
        this.sphere.rotationQuaternion = new BABYLON.Quaternion(data.rotation_x, data.rotation_y, data.rotation_z, data.rotation_w);
        this.sphere.scaling = new BABYLON.Vector3(data.scale_x, data.scale_y, data.scale_z);
        this.sphere.scaling.set(data.realWorldWidth / data.ratio, data.realWorldWidth / data.ratio, data.realWorldWidth / data.ratio);
    }

    /**
     * Update hologram position.
     * @param {any} data object containing the position information.
     */
    updatePosition(data){
        console.log("MODEL: received position changed");
        this.sphere.position = new BABYLON.Vector3(data.position_x, data.position_y, data.position_z);
    }

    /**
     * Update hologram rotation.
     * @param {any} data object containing the rotation information.
     */
    updateRotation(data){
        console.log("MODEL: received rotation changed");
        this.sphere.rotationQuaternion = new BABYLON.Quaternion(data.rotation_x, data.rotation_y, data.rotation_z, data.rotation_w);
    }

    /**
     * Update hologram scale.
     * @param {any} data object containing the scale infromation.
     */
    updateScale(data){
        console.log("MODEL: received scale changed");
        this.sphere.scaling = new BABYLON.Vector3(data.scale_x, data.scale_y, data.scale_z);
    }

    /**
     * Manage the control of the hologram from the user.
     * @param {any} data object that contains the id of the view in control.
     */
    manageUserHologramControl(data){
        console.log("MODEL: received manage user hologram control");
        this.isUserManipulating = true;
        this.viewInControl = data.view;
        this.linkedViews.filter(v => data.view !== v).forEach(v => this.publish(v, "hideManipulatorMenu"));
    }

    /**
     * Manage the relase of the control from the user who had it.
     * @param {any} data object that contains the id of the view where the user released the control.
     */
    manageUserHologramControlReleased(data){
        console.log("MODEL: received manage user hologram control");
        this.isUserManipulating = false;
        this.linkedViews.filter(v => data.view !== v).forEach(v => this.publish(v, "showManipulatorMenu"));
    }

    /**
     * Change the color of the hologram.
     * @param {any} data object containing the color to apply.
     */
    changeHologramColor(data){
        console.log("MODEL: receive color button clicked");
        this.sphere.material.diffuseColor = this.#computeColor(data.color);
    }

    #computeColor(colorName){
        switch (colorName) {
            case "Blue":
                return BABYLON.Color3.Blue();
                break;
            case "Red":
                return BABYLON.Color3.Red();
                break;
            case "Green":
                return BABYLON.Color3.Green();
                break;
            case "Purple":
                return BABYLON.Color3.Purple();
                break;
            case "Yellow":
                return BABYLON.Color3.Yellow();
                break;
            case "Teal":
                return BABYLON.Color3.Teal();
                break;
            default:
                return BABYLON.Color3.White();
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

        if(xrHelper !== undefined){
            const featuresManager = xrHelper.baseExperience.featuresManager;

            this.#enableFeatures(featuresManager);
        }

        return this.scene;
    }

    #activateRenderLoop() {
        this.#createWebXRExperience().then(sceneToRender => {
            this.engine.runRenderLoop(() => sceneToRender.render());
        });
    }

    #displayMessageError(){
        const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
            "FullscreenUI"
        );
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
            "Make sure you have Google AR services installed and that you enabled the WebXR incubation flag under chrome://flags";
        message.color = "white";
        message.fontSize = "20px";
        message.height = "200px"

        message.paddingLeft = "10px";
        message.paddingRight = "10px";
        panel.addControl(message);
    }

    #enableFeatures(featuresManager) {
        this.#enableHandsTrackingFeature(featuresManager);
        this.#enableImageTrackingFeature(featuresManager);
    }

    #enableHandsTrackingFeature(featuresManager){
        try {
            featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", { xrInput: xr.input });
        } catch (err) {
            console.log("Articulated hand tracking not supported in this browser or device.");
        }
    }

    #enableImageTrackingFeature(featuresManager){
        try {
            this.imageTracking = featuresManager.enableFeature(BABYLON.WebXRFeatureName.IMAGE_TRACKING, 'latest', {
                images: [
                    {
                        src: "../img/imageTracking.png",
                        estimatedRealWorldWidth: 0.1
                    }
                ]
            });

            this.sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.2, segments: 32}, this.scene);
            this.sphere.position = new BABYLON.Vector3(0, 1.2, 0.5); //new BABYLON.Vector3(0, 1.3, 1);
            this.sphere.setEnabled(false);

            const material = new BABYLON.StandardMaterial("material", this.scene);
            material.diffuseColor = BABYLON.Color3.White();

            this.sphere.material = material;

        }catch(error){
            console.log("Image tracking not supported in this browser or device.");
        }

    }

}


RootModel.register("RootModel");


export { RootModel };