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
}


/**
 * Theme declaration defining colors.
 */
export class ColorTheme extends css.ThemeDefinition
{
    bgColor = this.$var("color")
    frColor = this.$var("color")

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
        }
    }

    captionBgColor = this.$var("color")
    captionFrColor = this.$var("color")

    backdropBgColor = this.$var("color")
    backdropOpacity = this.$var("<percentage>")
}



/**
 * Light color theme.
 */
export class LightColorTheme extends ColorTheme
{
    bgColor = this.$var("color", "white")
    frColor = this.$var("color", "black")

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
            outline: this.$var("outline", [3, "solid", 0x828282])
        },
        active: {
            bg: this.$var("color", 0xa2a2a2),
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

    btn: IButtonColors = {
        bg: this.$var("color", 0x626262),
        hover: {
            bg: this.$var("color", 0x727272),
        },
        focus: {
            bg: this.$var("color", 0x828282),
            outline: this.$var("outline", [1, "solid", -0xe2e2e2])
        },
        focusVisible: {
            bg: this.$var("color", 0x929292),
            outline: this.$var("outline", [3, "solid", 0xf2f2f2])
        },
        active: {
            bg: this.$var("color", 0xa2a2a2),
        }
    }

    captionBgColor = this.$var("color", "brown")
    captionFrColor = this.$var("color", "yellow")

    backdropBgColor = this.$var("color", "grey")
    backdropOpacity = this.$var("<percentage>", 0.3)
}



