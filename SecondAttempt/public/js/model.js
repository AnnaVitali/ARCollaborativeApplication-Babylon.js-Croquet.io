class Hologram{
    constructor() {
        this.position = new BABYLON.Vector3(0, 0, 0);
        this.rotation = new BABYLON.Quaternion(0, 0, 0, 0);
        this.scale = new BABYLON.Vector3(0, 0, 0);
        this.color = new BABYLON.Color3.White();
    }

    setPosition(position) {
        this.position = position;
    }

    setRotation(rotation){
        this.rotation = rotation;
    }

    setScale(scale){
        this.scale = scale;
    }

    setColor(color){
        this.color = color;
    }

}
class RootModel extends Croquet.Model {

    /**
    * Initialize the Model.
    * */
    init() {
        this.linkedViews = [];
        this.isUserManipulating = false;
        this.viewInControl = null;
        this.isHologramEnabled = false;
        this.sphere = new Hologram();

        this.subscribe(this.sessionId, "view-join", this.viewJoin);
        this.subscribe(this.sessionId, "view-exit", this.viewDrop);
        this.subscribe("colorButton", "clicked", this.changeHologramColor);
        this.subscribe("controlButton", "clicked", this.manageUserHologramControl);
        this.subscribe("controlButton", "released", this.manageUserHologramControlReleased);
        this.subscribe("hologram", "positionChanged", this.updatePosition);
        this.subscribe("hologram", "rotationChanged", this.updateRotation);
        this.subscribe("hologram", "scaleChanged", this.updateScale);

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


}

RootModel.register("RootModel");

export { RootModel };