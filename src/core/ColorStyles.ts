import * as css from "mimcss"

/**
 * Theme declaration defining colors.
 */
export class ColorTheme extends css.ThemeDefinition
{
    bgColor = this.$var("color")
    frColor = this.$var("color")

    btnBgColor = this.$var("color")
    btnBgColorHover = this.$var("color")
    btnBgColorFocus = this.$var("color")
    btnFrColor = this.$var("color")
    btnFrColorHover = this.$var("color")
    btnFrColorFocus = this.$var("color")
    btnFocusOutline = this.$var("color")

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

    btnBgColor = this.$var("color", 0xf2f2f2)
    btnBgColorHover = this.$var("color", 0xe2e2e2)
    btnBgColorFocus = this.$var("color", 0xe2e2e2)
    btnFrColor = this.$var("color", "black")
    btnFrColorHover = this.$var("color", "black")
    btnFrColorFocus = this.$var("color", "black")
    btnFocusOutline = this.$var("color", 0xa2a2a2)

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
 * Light color theme.
 */
export class DarkColorTheme extends ColorTheme
{
    bgColor = this.$var("color", "black")
    frColor = this.$var("color", "white")

    btnBgColor = this.$var("color", 0xf2f2f2)
    btnBgColorHover = this.$var("color", 0xe2e2e2)
    btnBgColorFocus = this.$var("color", 0xe2e2e2)
    btnFrColor = this.$var("color", "black")
    btnFrColorHover = this.$var("color", "black")
    btnFrColorFocus = this.$var("color", "black")
    btnFocusOutline = this.$var("color", 0xa2a2a2)

    captionBgColor = this.$var("color", "brown")
    captionFrColor = this.$var("color", "yellow")

    backdropBgColor = this.$var("color", "grey")
    backdropOpacity = this.$var("<percentage>", 0.3)
}



