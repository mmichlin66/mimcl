import * as css from "mimcss"
import {ColorTheme} from "../core/ColorStyles";



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
    popupElm?: css.IClassRule | css.IClassNameRule;

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
     * Defines CSS class to use for the closer button clicking which closes the dialog.
     */
    dialogCloser?: css.IClassRule | css.IClassNameRule;

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
    popupElm = this.$class()
    popupEntering = this.$class()
    popupExiting = this.$class()
    popupMoving = this.$class()

    dialogCaption = this.$class()
    dialogCloser = this.$class()
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

    popupElm = this.$class({
        border: "none",
        boxShadow: { x: 0, y: 0, blur: 4, color: "lightgrey" },
        padding: 0,
        maxWidth: "100%",
        maxHeight: "100%",
        backgroundColor: css.usevar(this.colors.bgColor, "Canvas"),
        color: this.colors.fgColor,
        "::backdrop": {
            backgroundColor: this.colors.backdropBgColor,
            opacity: this.colors.backdropOpacity,
        },
    })

    enterAnmation = this.$keyframes([
        ["from", {transform: css.scale(0.001)}],
        // ["to", {}]
    ])

    exitAnimation = this.$keyframes([
        // ["from", {}],
        ["to", {transform: css.scale(0.001)}]
    ])

    backdropAnimation = this.$keyframes([
        ["from", {opacity: 0}],
        ["to", {opacity: this.colors.backdropOpacity}]
    ])

    animationDuration = this.$var("<time>", 200)

    popupEntering = this.$class({
        animation: { name: this.enterAnmation, duration: this.animationDuration },
        "::backdrop": {
            animation: { name: this.backdropAnimation, duration: this.animationDuration }
        }
    })

    popupExiting = this.$class({
        animation: { name: this.exitAnimation, duration: this.animationDuration },
        "::backdrop": {
            animation: { name: this.backdropAnimation, duration: this.animationDuration, direction: "reverse" }
        }
    })

    popupMoving = this.$class({
        transitionProperty: ["left", "top"], transitionDuration: this.animationDuration
    })

    dialogCaption = this.$class({
        backgroundColor: css.usevar(this.colors.captionBgColor, "Highlight"),
        color: css.usevar(this.colors.captionFgColor, "HighlightText"),
        boxShadow: { x: 0, y: 2, blur: 2, color: "lightgrey" },
        padding: 0.4,
        cursor: "default",
    })

    dialogCloser = this.$class({
        // position: "absolute", right: 2, top: 2,
        width: 1.2, minWidth: 1.2, height: 1.2, padding: 0.1,
        textAlign: "center",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "transparent",
        ":hover": {color: "red"}
    })

    dialogBody = this.$class({
        padding: 0.7,
    })

    dialogButtonBar = this.$class({
        padding: [0.7, 1.01],
        display: "flex",
        gap: "1em",
        justifyContent: "flex-end",
        alignItems: "center",
    })

    msgBoxContainer = this.$class({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    })

    msgBoxIcon = this.$class({
        padding: "0.5rem",
        fontSize: "3em",
        fontWeight: 900,
        border: "none",
    })

    msgBoxText = this.$class({
        padding: 0.5,
        minWidth: "15em",
        maxWidth: "60em",
        // minHeight: "2em",
        maxHeight: "20em",
        overflow: "auto",
        verticalAlign: "middle",
    })

    progressContainer = this.$class({
        minWidth: "10ch",
        maxWidth: "150ch",
        minHeight: "1em",
        maxHeight: "20em",
        margin: 0.7,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        alignItems: "center",
        justifyContent: "space-around",
        "&+": [[ this.dialogButtonBar, {justifyContent: "center"}]]
    })

    progressElm = this.$class({
        accentColor: this.colors.accentColor,
        minWidth: "20ch",
        width: "100%",
        height: css.em(1),
    })

    progressText = this.$class({
        textAlign: "center",
    })
}



