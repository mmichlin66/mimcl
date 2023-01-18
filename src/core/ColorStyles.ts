import * as css from "mimcss"



export interface IColorAspects
{
    bg?: css.IVarRule<"color">;
    fg?: css.IVarRule<"color">;
    border?: css.IVarRule<"border">;
    outline?: css.IVarRule<"outline">;
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
    fgColor = this.$var("color")
    accentColor = this.$var("accentColor")

    btn: IButtonColors = {
        bg: this.$var("color"),
        fg: this.$var("color"),
        border: this.$var("border"),
        outline: this.$var("outline"),
        focus: {
            bg: this.$var("color"),
            fg: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        focusVisible: {
            bg: this.$var("color"),
            fg: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        hover: {
            bg: this.$var("color"),
            fg: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        active: {
            bg: this.$var("color"),
            fg: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        },
        disabled: {
            bg: this.$var("color"),
            fg: this.$var("color"),
            border: this.$var("border"),
            outline: this.$var("outline"),
        }
    }

    captionBgColor = this.$var("color")
    captionFgColor = this.$var("color")

    backdropBgColor = this.$var("color")
    backdropOpacity = this.$var("<percentage>")

    // button = this.$style('button, input[type="button"]', {
    button = this.$style('button', {
        fontSize: "inherit",
        padding: 0.5,
        backgroundColor: this.btn.bg,
        color: this.btn.fg,
        border: this.btn.border,
        outline: this.btn.outline,
        ":focus": {
            backgroundColor: this.btn.focus.bg,
            color: this.btn.focus.fg,
            outline: this.btn.focus.outline,
        },
        ":focus-visible": {
            backgroundColor: this.btn.focusVisible.bg,
            color: this.btn.focusVisible.fg,
            outline: this.btn.focusVisible.outline,
        },
        ":hover": {
            backgroundColor: this.btn.hover.bg,
            color: this.btn.hover.fg,
            outline: this.btn.hover.outline,
            ":focus-visible": {
                outline: this.btn.focusVisible.outline,
            }
        },
        ":active": {
            backgroundColor: this.btn.active.bg,
            color: this.btn.active.fg,
            outline: this.btn.active.outline,
            ":focus-visible": {
                outline: this.btn.focusVisible.outline,
            }
        },
        ":disabled": {
            backgroundColor: this.btn.disabled.bg,
            color: this.btn.disabled.fg,
            outline: this.btn.disabled.outline,
        }
    })
}



/**
 * Light color theme.
 */
export class LightColorTheme extends ColorTheme
{
    bgColor = this.$var("color", "white")
    fgColor = this.$var("color", "black")
    accentColor = this.$var("accentColor", "darkblue")

    btn: IButtonColors = {
        bg: this.$var("color", 0xe2e2e2),
        border: this.$var("border", "none"),
        outline: this.$var("outline", [1, "solid", 0xa2a2a2]),
        focus: {
            bg: this.$var("color", 0xc2c2c2),
            outline: this.$var("outline", [1, "solid", 0x828282])
        },
        focusVisible: {
            bg: this.$var("color", 0xb2b2b2),
            outline: this.$var("outline", [3, "solid", 0x727272])
        },
        hover: {
            bg: this.$var("color", 0xd2d2d2),
            outline: this.$var("outline", [1, "solid", 0x929292])
        },
        active: {
            bg: this.$var("color", 0xa2a2a2),
            outline: this.$var("outline", [1, "solid", 0x626262]),
        },
        disabled: {
            bg: this.$var("color", 0xf2f2f2),
            fg: this.$var("color", 0xa8a8a8),
            outline: this.$var("outline", [1, "solid", 0xa8a8a8])
        },
    }

    captionBgColor = this.$var("color", "dodgerblue")
    captionFgColor = this.$var("color", "white")

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
    fgColor = this.$var("color", "white")
    accentColor = this.$var("accentColor", "orange")

    btn: IButtonColors = {
        bg: this.$var("color", 0x626262),
        outline: this.$var("outline", [1, "solid", 0xb2b2b2]),
        focus: {
            bg: this.$var("color", 0x828282),
            outline: this.$var("outline", [1, "solid", 0xd2d2d2])
        },
        focusVisible: {
            bg: this.$var("color", 0x929292),
            outline: this.$var("outline", [3, "solid", 0xe2e2e2])
        },
        hover: {
            bg: this.$var("color", 0x727272),
            outline: this.$var("outline", [1, "solid", 0xc2c2c2])
        },
        active: {
            bg: this.$var("color", 0xa2a2a2),
            outline: this.$var("outline", [3, "solid", 0xf2f2f2])
        },
        disabled: {
            bg: this.$var("color", 0xf2f2f2),
            fg: this.$var("color", 0xa8a8a8),
            outline: this.$var("outline", [1, "solid", 0xa8a8a8])
        },
    }

    captionBgColor = this.$var("color", "brown")
    captionFgColor = this.$var("color", "yellow")

    backdropBgColor = this.$var("color", "grey")
    backdropOpacity = this.$var("<percentage>", 0.3)
}



// // By default, activate the light theme
// css.activate( LightColorTheme);



