import * as css from "mimcss"
import { ColorTheme } from "../core/ColorStyles";

/**
 * The IPopupStyles interface defines styles used by the Popup class to create the `<dialog>`
 * element. The implementations should provide the class rule for the dialog property and can
 * also define the ::backdrop pseudo element styles, which is used when the popup is shown as a
 * modal dialog.
 */
export interface IPopupStyles
{
    /**
     * Defines CSS class to use for the `<dialog>` element.
     */
    popupElement?: css.IClassRule | css.IClassNameRule;

    /**
     * Defines CSS class to use for the closer button clicking which closes the popup.
     */
    popupCloser?: css.IClassRule | css.IClassNameRule;

    /**
     * CSS class assigned to the `<dialog>` element upon creation. This class is used to
     * define entrance animation.
     */
    popupEntering?: css.IClassRule | css.IClassNameRule;

    /**
     * CSS class assigned to the `<dialog>` element before destruction. This class is used to
     * define exit animation.
     */
    popupExiting?: css.IClassRule | css.IClassNameRule;

    /**
     * CSS class assigned to the `<dialog>` element before moving as a result of calling the
     * [[moveTo]] method. This class is used to define move animation.
     */
    popupMoving?: css.IClassRule | css.IClassNameRule;
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
 * Theme defining styles for different popup components.
 */
export class PopupTheme extends css.ThemeDefinition implements IPopupStyles,
    IDialogStyles, IMsgBoxStyles
{
    popupElement = this.$class()
    popupCloser = this.$class()
    popupEntering = this.$class()
    popupExiting = this.$class()
    popupMoving = this.$class()

    dialogCaption = this.$class()
    dialogBody = this.$class()
    dialogButtonBar = this.$class()
    dialogButton = this.$class()

    msgBoxContainer = this.$class()
    msgBoxIcon = this.$class()
    msgBoxText = this.$class()

    progressContainer = this.$class()
    progressElm = this.$class()
    progressText = this.$class()
}



/**
 * Default theme for popup components.
 */
export class DefaultPopupTheme extends PopupTheme
{
    colors = this.$use( ColorTheme)

    popupEntrance = this.$keyframes([
        ["from", {transform: css.scale(0.001)}],
        // ["to", {}]
    ])

    popupExit = this.$keyframes([
        // ["from", {}],
        ["to", {transform: css.scale(0.001)}]
    ])

    popupEntering = this.$class({
        animation: { name: this.popupEntrance, duration: 150 }
    })

    popupExiting = this.$class({
        animation: { name: this.popupExit, duration: 150 }
    })

    popupMoving = this.$class({
        transitionProperty: ["left", "top"], transitionDuration: 150
    })


    popupElement = this.$class({
        border: "none",
        boxShadow: { x: 0, y: 0, blur: 4, color: "lightgrey" },
        padding: 0,
        maxWidth: "100%",
        maxHeight: "100%",
        backgroundColor: this.colors.bgColor,
        color: this.colors.frColor,
        "::backdrop": { backgroundColor: this.colors.backdropBgColor, opacity: this.colors.backdropOpacity },
    })

    popupCloser = this.$class({
        position: "absolute", right: 2, top: 2,
        // boxSizing: "border-box",
        width: 1.2, height: 1.2, padding: 0.1,
        textAlign: "center",
        border: "none",
        // borderRadius: "50%",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "transparent",
        ":hover": {
            backgroundColor: this.colors.btnBgColorHover, color: "red"
        },
        ":focus": {
            backgroundColor: this.colors.btnBgColorFocus,
            color: "red",
            outline: [1, "solid", this.colors.btnFocusOutline],
        }
    })

    dialogCaption = this.$class({
        backgroundColor: this.colors.captionBgColor,
        color: this.colors.captionFrColor,
        boxShadow: { x: 0, y: 2, blur: 2, color: "lightgrey" },
        padding: 0.4,
        cursor: "default",
    })

    dialogBody = this.$class({
        padding: 0.7,
    })

    dialogButtonBar = this.$class({
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
        backgroundColor: this.colors.btnBgColor,
        color: this.colors.btnFrColor,
        ":hover": {
            backgroundColor: this.colors.btnBgColorHover,
            color: this.colors.btnFrColorHover,
        },
        ":focus": {
            backgroundColor: this.colors.btnBgColorFocus,
            color: this.colors.btnFrColorFocus,
            outline: [1, "solid", this.colors.btnFocusOutline],
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



// // Activate the popup deafult theme if another theme implmentation is not activated yet.
// if (!css.getActiveTheme( PopupTheme))
//     css.activate( DefaultPopupTheme);



