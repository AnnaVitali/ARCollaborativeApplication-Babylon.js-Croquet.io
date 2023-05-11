class RootView extends Croquet.View {

    /**
     * Constructor for the class.
     * @param {any} model the model of reference
     */
    constructor(model) {
        super(model);
        this.model = model;

        this.subscribe(this.viewId, "hideManipulatorMenu", this.hideManipulatorMenu);
        this.subscribe(this.viewId, "showManipulatorMenu", this.addManipulatorMenu);
        this.subscribe("interactions", "shoeMenu", this.showMenu)


        if(this.model.sphere.isEnabled){
            this.showMenu();
        }

        this.#addImageTrackingObservables();

        console.log("VIEW subscribed ");

    }

    showMenu(){
        console.log("VIEW: received show menu");
        if(!this.model.isUserManipulating) {
            this.addManipulatorMenu();
        }
        this.#addChangeColorMenu();
    }

    /**
     * Hide the manipulator menu.
     * */
    hideManipulatorMenu(){
        console.log("VIEW: received hide manipulator menu");
        this.manipulatorNearMenu.dispose();
    }

    /**
     * Notify that the colored button has been clicked.
     * @param {any} colorName name of the button clicked.
     */
    notifyColorButtonClicked(colorName){
        console.log("VIEW: color button clicked");
        this.publish("colorButton", "clicked", {color: colorName});
    }

    /**
     * Notify that the current user has started manipulating the hologram.
     * */
    notifyUserStartManipulating(){
        console.log("VIEW: user start manipulating");
        this.publish("controlButton", "clicked", {view: this.viewId});
    }

    /**
     * Notify that the current user has finish to manipulate the hologram.
     * */
    notifyCurrentUserReleaseControl(){
        console.log("VIEW: user stop manipulating");
        this.#setDefaultControlButtonBehavior();
        this.#removeElementHologramManipulator();
        this.publish("controlButton", "released", {view: this.viewId});
    }

    /**
     * Notify that the positon of the hologram has been changed.
     * @param {BABYLON.Vector3} position the new position.
     */
    notifyHologramPositionChanged(position){
        console.log("VIEW: hologram position change");
        this.publish("hologram", "positionChanged",
            {
                position_x: position.x,
                position_y: position.y,
                position_z: position.z
            });
    }

    /**
     * Notify that the rotation of the hologram has been changed.
     * @param {BABYLON.Quaternion} rotation the new rotation.
     */
    notifyHologramRotationChanged(rotation){
        console.log("VIEW: hologram rotation change");
        this.publish("hologram", "rotationChanged",
            {
                rotation_x: rotation.x,
                rotation_y: rotation.y,
                rotation_z: rotation.z,
                rotation_w: rotation.w
            });
    }

    /**
     * Notify that the scale of the hologram has been changed.
     * @param {BABYLON.Vector3} scale the new scale.
     */
    notifyHologramScaleChanged(scale){
        console.log("VIEW: hologram scale change");
        this.publish("hologram", "scaleChanged",
            {
                scale_x: scale.x,
                scale_y: scale.y,
                scale_z: scale.z
            });
    }

    /**
     * Add the menu that allow the user to manipulate the hologram.
     * */
    addManipulatorMenu() {
        this.manipulatorNearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        this.manipulatorNearMenu.rows = 1;
        this.model.GUIManager.addControl(this.manipulatorNearMenu);
        this.manipulatorNearMenu.isPinned = true;
        this.manipulatorNearMenu.position = new BABYLON.Vector3(this.model.sphere.position.x + 0.4, this.model.sphere.position.y, this.model.sphere.position.z + 0.5);

        this.controlButton = new BABYLON.GUI.TouchHolographicButton();
        this.#setDefaultControlButtonBehavior()
        this.manipulatorNearMenu.addButton(this.controlButton);
    }

    #addChangeColorMenu(){
        const buttonParams = [
            { name: "Blue", color: BABYLON.Color3.Blue() },
            { name: "Red", color: BABYLON.Color3.Red() },
            { name: "Green", color: BABYLON.Color3.Green() },
            { name: "Purple", color: BABYLON.Color3.Purple() },
            { name: "Yellow", color: BABYLON.Color3.Yellow() },
            { name: "Teal", color: BABYLON.Color3.Teal() },
        ]

        const nearMenu = new BABYLON.GUI.NearMenu("NearMenu");
        nearMenu.rows = 3;
        this.model.GUIManager.addControl(nearMenu);
        nearMenu.isPinned = true;
        nearMenu.position = new BABYLON.Vector3(this.model.sphere.position.x - 0.4, this.model.sphere.position.y, this.model.sphere.position.z + 0.5);

        buttonParams.forEach(input => {
            const button = new BABYLON.GUI.TouchHolographicButton();
            button.text = input.name;
            button.onPointerDownObservable.add(() => {
                this.notifyColorButtonClicked(input.name);
            });

            nearMenu.addButton(button);
        })
    }

    #removeElementHologramManipulator() {
        this.viewSphere.dispose();
        this.boundingBox.dispose();
        this.gizmo.attachedMesh = null;
        this.gizmo.dispose();
    }

    #setDefaultControlButtonBehavior() {
        this.controlButton.text = "Start manipulating";
        this.controlButton.imageUrl = "../img/iconAdjust.png"
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            this.#addHologramManipulator();
            this.notifyUserStartManipulating();
        });
    }

    #addHologramManipulator(){
        //create bounding box and object controls
        this.viewSphere = BABYLON.MeshBuilder.CreateSphere("viewSphere", {diameter: 0.2, segments: 32}, this.model.scene);
        this.viewSphere.position = new BABYLON.Vector3(this.model.sphere.absolutePosition.x, this.model.sphere.absolutePosition.y, this.model.sphere.absolutePosition.z);
        this.viewSphere.rotationQuaternion = new BABYLON.Quaternion(this.model.sphere.absoluteRotationQuaternion.x, this.model.sphere.absoluteRotationQuaternion.y, this.model.sphere.absoluteRotationQuaternion.z, this.model.sphere.absoluteRotationQuaternion.w);
        this.viewSphere.scaling = new BABYLON.Vector3(this.model.sphere.absoluteScaling.x, this.model.sphere.absoluteScaling.y, this.model.sphere.absoluteScaling.z);
        this.viewSphere.isVisible = false;

        this.boundingBox = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(this.viewSphere);
        const utilLayer = new BABYLON.UtilityLayerRenderer(this.model.scene);
        utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
        this.gizmo = new BABYLON.BoundingBoxGizmo(BABYLON.Color3.FromHexString("#0984e3"), utilLayer)
        this.gizmo.rotationSphereSize = 0.03;
        this.gizmo.scaleBoxSize = 0.03;
        this.gizmo.attachedMesh = this.boundingBox;

        // Create behaviors to drag and scale with pointers in VR
        const sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
        sixDofDragBehavior.dragDeltaRatio = 1;
        sixDofDragBehavior.zDragFactor = 1;

        sixDofDragBehavior.onPositionChangedObservable.add(() => {
            this.notifyHologramPositionChanged(this.viewSphere.absolutePosition);
        });
        this.boundingBox.addBehavior(sixDofDragBehavior);

        this.gizmo.onScaleBoxDragObservable.add(() => {
            this.notifyHologramScaleChanged(this.viewSphere.absoluteScaling);
        });

        this.gizmo.onRotationSphereDragObservable.add(() => {
            console.log("rotDrag");
            this.notifyHologramRotationChanged(this.viewSphere.absoluteRotationQuaternion);
        });


        this.controlButton.text = "Stop manipulating";
        this.controlButton.onPointerDownObservable.clear();
        this.controlButton.onPointerDownObservable.add(() => {
            this.notifyCurrentUserReleaseControl();
        });
    }

    #addImageTrackingObservables(){
        if(!this.model.imageTracking.onUntrackableImageFoundObservable.hasObservers()) {
            this.model.imageTracking.onUntrackableImageFoundObservable.add((idx) => {
                console.log("image untrackable", idx);
            });
        }
        if(!this.model.imageTracking.onTrackableImageFoundObservable.hasObservers()) {
            this.model.imageTracking.onTrackableImageFoundObservable.add((image) => {
                console.log("image found", image);
                console.log("VIEW: publish image found");
                this.publish("image", "found")
            });
        }

        if(!this.model.imageTracking.onTrackedImageUpdatedObservable.hasObservers()) {
            this.model.imageTracking.onTrackedImageUpdatedObservable.add((image) => {
                console.log("image updated", image);
                console.log("VIEW: publish image updated");
                const position = image.absolutePosition;
                const rotation = image.absoluteRotationQuaternion;
                const scale = image.absoluteScaling;

                this.publish("image", "updated", {
                    position_x: position.x,
                    position_y: position.y,
                    position_z: position.z,
                    rotation_x: rotation.x,
                    rotation_y: rotation.y,
                    rotation_z: rotation.z,
                    rotation_w: rotation.w,
                    scale_x: scale.x,
                    scale_y: scale.y,
                    scale_z: scale.z,
                    ratio: image.ratio,
                    realWorldWidth: image.realWorldWidth
                })
            });
        }
    }

}



export { RootView };