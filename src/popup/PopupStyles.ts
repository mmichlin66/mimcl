import * as css from "mimcss"

/**
 * The IPopupStyles interface defines styles used by the Popup class to create the `<dialog>`
 * element. The implementations should provide the class rule for the dialog property and can
 * also define the ::backdrop pseudo element styles, which is used when the popup is shown as a
 * modal dialog.
 */
export interface IPopupStyles
{
    popupEntrance?: css.IAnimationRule;

    popupExit?: css.IAnimationRule;

    popupEntering?: css.IClassRule | css.IClassNameRule;
    popupExiting?: css.IClassRule | css.IClassNameRule;
    popupMoving?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines CSS class to use for the `<dialog>` element.
     */
    popupElement?: css.IClassRule | css.IClassNameRule;
}



/**
 * The IDialogStyles interface defines styles used by the Dialog class to create different elements
 * of the dialog.
 */
export interface IDialogStyles extends IPopupStyles
{
    /**
     * Defines what CSS class to use for the caption section.
     */
    dialogCaption?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines what CSS class to use for the body section.
     */
    dialogBody?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines what CSS class to use for the button bar section.
     */
    dialogButtonBar?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines what CSS class to use for the buttons.
     */
    dialogButton?: css.IClassRule | css.IClassNameRule;
}



/**
 * The IMsgBoxStyles interface defines styles used by the MsgBox class to create different elements
 * of the messg=age box.
 */
export interface IMsgBoxStyles extends IDialogStyles
{
    /**
     * Defines what CSS class to use for the message box container.
     */
    msgBoxContainer?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines what CSS class to use for the message box icon.
     */
    msgBoxIcon?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines what CSS class to use for the message box text.
     */
    msgBoxText?: css.IClassRule | css.IClassNameRule;
}



/**
 * The IMsgBoxStyles interface defines styles used by the MsgBox class to create different elements
 * of the messg=age box.
 */
export interface IProgressStyles extends IDialogStyles
{
    /**
     * Defines what CSS class to use for the message box container.
     */
    progressContainer?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines what CSS class to use for the message box icon.
     */
    progressElm?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines what CSS class to use for the message box text.
     */
    progressText?: css.IClassRule | css.IClassNameRule;
}



/**
 * Default styles that will be used by the different popup components.
 */
export class DefaultPopupStyles extends css.StyleDefinition implements IPopupStyles,
    IDialogStyles, IMsgBoxStyles
{
    popupEntrance = this.$keyframes([
        ["from", {transform: css.scale(0.001)}],
        // ["to", {}]
    ])

    popupExit = this.$keyframes([
        // ["from", {}],
        ["to", {transform: css.scale(0.001)}]
    ])

    popupEntering = this.$class();
    popupExiting = this.$class();
    popupMoving = this.$class();

    /** Styles for the `<dialog>` element. */
    popupElement = this.$class({
        border: "none",
        borderLeft: [1, "solid", "lightgrey"],
        borderTop: [1, "solid", "lightgrey"],
        boxShadow: { x: 4, y: 4, blur: 4, color: "lightgrey" },
        padding: 0,
        maxWidth: "100%",
        maxHeight: "100%",
        "::backdrop": { backgroundColor: "grey", opacity: 0.3 },
        "&": [
            [this.popupEntering, {animation: { name: this.popupEntrance, duration: 150 }}],
            [this.popupExiting, {animation: { name: this.popupExit, duration: 150 }}],
            [this.popupMoving, {transitionProperty: ["left", "top"], transitionDuration: 150}]
        ]
    })

    dialogCaption = this.$class({
        backgroundColor: "dodgerblue",
        color: "white",
        boxShadow: { x: 0, y: 2, blur: 2, color: "lightgrey" },
        padding: 0.4,
    })

    dialogBody = this.$class({
        padding: 0.7,
    })

    dialogButtonBar = this.$class({
        // backgroundColor: "lightgrey",
        padding: [0.7, 1.01],
        display: "flex",
        gap: css.em(1),
        justifyContent: "flex-end",
        alignItems: "center",
    })

    dialogButton = this.$class({
        padding: 0.3,
        minWidth: 5.5,
        border: "none",
        backgroundColor: 0xf2f2f2,
		":hover": {
			backgroundColor: 0xe2e2e2,
		},
		":focus": {
            backgroundColor: 0xe2e2e2,
            outline: [1, "solid", 0xa2a2a2],
		}
    })

    msgBoxContainer = this.$class({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    })

    msgBoxIcon = this.$class({
        padding: css.rem(0.5),
        fontSize: css.em(3),
        fontWeight: 900,
        border: "none",
    })

    msgBoxText = this.$class({
        padding: 0.5,
        minWidth: css.em(15),
        maxWidth: css.em(60),
        // minHeight: css.em(2),
        maxHeight: css.em(20),
        overflow: "auto",
        verticalAlign: "middle",
    })

    progressContainer = this.$class({
        width: css.rem(30),
        height: css.rem(5),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        "&+": [[ this.dialogButtonBar, {justifyContent: "center"}]]
    })

    progressElm = this.$class({
        width: css.rem(20),
        height: css.rem(1),
        margin: css.rem(1)
    })

    progressText = this.$class({
        textAlign: "center",
    })
}


