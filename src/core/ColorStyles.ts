import * as css from "mimcss"
import { IVarRule } from "mimcss"



export interface IColorAspects
{
    bg?: IVarRule<"color">;
    fr?: IVarRule<"color">;
    border?: IVarRule<"border">;
    outline?: IVarRule<"outline">;
}

export interface IButtonColors extends IColorAspects
{
    hover?: IColorAspects;
    focus?: IColorAspects;
    focusVisible?: IColorAspects;
    active?: IColorAspects;
    disabled?: IColorAspects;
}


/**
 * Theme declaration defining colors.
 */
export class ColorTheme extends css.ThemeDefinition
{
    colorScheme = this.$style( ":root", {colorScheme: ["light", "dark"]})

    bgColor = this.$var("color")
    frColor = this.$var("color")
    accentColor = this.$var("accentColor")

    btn: IButtonColors = {
        bg: this.$var("color"),
        fr: this.$var("color"),
        border: this.$var("border"),
        outline: this.$var("outline"),
        hover: {
            bg: this.$var("color"),
            fr: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        focus: {
            bg: this.$var("color"),
            fr: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        focusVisible: {
            bg: this.$var("color"),
            fr: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        active: {
            bg: this.$var("color"),
            fr: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        disabled: {
            bg: this.$var("color"),
            fr: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        }
    }

    captionBgColor = this.$var("color")
    captionFrColor = this.$var("color")

    backdropBgColor = this.$var("color")
    backdropOpacity = this.$var("<percentage>")

    // button = this.$style('button, input[type="button"]', {
    button = this.$style('button', {
        padding: 0.3,
        minWidth: 5.5,
        backgroundColor: this.btn.bg,
        color: this.btn.fr,
        border: this.btn.border,
        outline: this.btn.outline,
        ":hover": {
            backgroundColor: this.btn.hover.bg,
            color: this.btn.hover.fr,
            outline: this.btn.hover.outline,
        },
        ":focus": {
            backgroundColor: this.btn.focus.bg,
            color: this.btn.focus.fr,
            outline: this.btn.focus.outline,
        },
        ":focus-visible": {
            backgroundColor: this.btn.focusVisible.bg,
            color: this.btn.focusVisible.fr,
            outline: this.btn.focusVisible.outline,
        },
        ":active": {
            backgroundColor: this.btn.active.bg,
            color: this.btn.active.fr,
            outline: this.btn.active.outline,
        },
        ":disabled": {
            backgroundColor: css.usevar( this.btn.disabled.bg, this.btn.bg),
            color: css.usevar( this.btn.disabled.fr, "GrayText"),
            outline: css.usevar( this.btn.disabled.outline, this.btn.outline)
        }
    })
}



/**
 * Light color theme.
 */
export class LightColorTheme extends ColorTheme
{
    bgColor = this.$var("color", "white")
    frColor = this.$var("color", "black")
    accentColor = this.$var("accentColor", "darkblue")

    btn: IButtonColors = {
        bg: this.$var("color", 0xf2f2f2),
        hover: {
            bg: this.$var("color", 0xe2e2e2),
        },
        focus: {
            bg: this.$var("color", 0xd2d2d2),
            outline: this.$var("outline", [1, "solid", 0x828282])
        },
        focusVisible: {
            bg: this.$var("color", 0xd2d2d2),
            outline: this.$var("outline", [3, "solid", 0x727272])
        },
        active: {
            bg: this.$var("color", 0xa2a2a2),
            outline: this.$var("outline", [1, "solid", 0x626262])
        }
    }

    captionBgColor = this.$var("color", "dodgerblue")
    captionFrColor = this.$var("color", "white")

    backdropBgColor = this.$var("color", "grey")
    backdropOpacity = this.$var("<percentage>", 0.3)

    backdrop = this.$style( "::backdrop", {
        "--": [
            [this.backdropBgColor, "grey"],
            [this.backdropOpacity, 0.3]
        ]
    })
}



/**
 * Dark color theme.
 */
export class DarkColorTheme extends ColorTheme
{
    bgColor = this.$var("color", "black")
    frColor = this.$var("color", "white")
    accentColor = this.$var("accentColor", "orange")

    btn: IButtonColors = {
        bg: this.$var("color", 0x626262),
        hover: {
            bg: this.$var("color", 0x727272),
        },
        focus: {
            bg: this.$var("color", 0x828282),
            outline: this.$var("outline", [1, "solid", 0xd2d2d2])
        },
        focusVisible: {
            bg: this.$var("color", 0x929292),
            outline: this.$var("outline", [3, "solid", 0xe2e2e2])
        },
        active: {
            bg: this.$var("color", 0xa2a2a2),
            outline: this.$var("outline", [3, "solid", 0xf2f2f2])
        }
    }

    captionBgColor = this.$var("color", "brown")
    captionFrColor = this.$var("color", "yellow")

    backdropBgColor = this.$var("color", "grey")
    backdropOpacity = this.$var("<percentage>", 0.3)
}



// By default, activate the light theme
css.activate( LightColorTheme);



