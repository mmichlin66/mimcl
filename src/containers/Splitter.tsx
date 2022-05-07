import * as css from "mimcss"
import * as mim from "mimbl"
import { CssLength, CssLengthOrAuto } from "mimcss";


class SplitterStyles extends css.StyleDefinition
{
    grid = this.$class({
        display: "grid",
        alignItems: "stretch",
        width: "100%", height: "100%"
    })

    divider = this.$class({})
}



export type SplitterDirection = "h" | "v";

export type SplitterProps =
{
    /**
     * Splitter direction determining which direction the divider moves: `"h"` for horizontal and
     * `"v"` for vertical. Default value is `"h"`.
     */
    dir?: SplitterDirection;

    // /**
    //  * Determines what child should be the anchor element; that is, the element whose size is
    //  * set when the splitter moves. The other element occupies the rest of the splitter space.
    //  */
    // anchor?: 1 | 2;

    /**
     * Initial size of the anchor element. Default value is "1fr".
     */
    initSize?: css.CssLength;

    /**
     * Size of the divider element. Default value is "8px".
     */
    barSize?: css.CssLength;

    /**
     * Background of the divider element. Default value is "ButtonFace".
     */
    barBG?: css.Background_StyleType;
}


/**
 * The Splitter component divides the area between two children and allows changing their sizes by
 * dragging a divider.
 */
export class Splitter extends mim.Component<SplitterProps, [any,any]>
{
    constructor(props: SplitterProps)
    {
        super(props);

        this.names = props.dir === "v" ? VerticalNames : HorisontalNames;
        this.ownStyles = new SplitterStyles();
        this.setTemplate(props.initSize ?? "1fr", props.barSize ?? "8px");
        this.ownStyles.divider.setProp( "cursor", this.names.cursor);
        this.ownStyles.divider.setProp( "background", props.barBG ?? "ButtonFace");
    }

    willMount(): void {
        css.activate(this.ownStyles);
    }

    willUnmount(): void {
        css.activate(this.ownStyles);
    }

    render(): any
    {
        return <div ref={this.gridElm} class={this.ownStyles.grid} pointermove={this.onDrag} pointerup={this.onDragEnd}>
            {this.props.children?.[0]}
            <div ref={this.dividerElm} class={this.ownStyles.divider} pointerdown={this.onDragStart} />
            {this.props.children?.[1]}
        </div>
    }

    private onDragStart(e: PointerEvent): void
    {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = true;
        this.gridElm.setPointerCapture(e.pointerId);

        let dividerRect = this.dividerElm.getBoundingClientRect();
        this.dragCoord = e[this.names.client] - dividerRect[this.names.start];
        this.ownStyles.grid.setProp( "cursor", this.names.cursor);
    }

    private onDragEnd(e: PointerEvent): void
    {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = false;
        this.gridElm.releasePointerCapture(e.pointerId);
        this.ownStyles.grid.setProp( "cursor", undefined);
    }

    private onDrag(e: PointerEvent): void
    {
        if (!this.isDragging)
            return;

        e.preventDefault();
        e.stopPropagation();
        // console.log(e.clientX, e.clientY);

        let gridRect = this.gridElm.getBoundingClientRect();
        let dividerRect = this.dividerElm.getBoundingClientRect();

        let newSplitterStart = Math.min(
            Math.max(e[this.names.client] - this.dragCoord, gridRect[this.names.start]),
            gridRect[this.names.end] - dividerRect[this.names.size]
        );

        this.setTemplate( css.px(newSplitterStart - gridRect[this.names.start]), css.px(dividerRect[this.names.size]));
    }

    /** Sets the grid-tempalte-columns/rows style depending on the splitter direction */
    private setTemplate( anchorSize: CssLengthOrAuto, dividerSize: CssLength): void
    {
        this.ownStyles.grid.setProp(this.names.template, [anchorSize, dividerSize, "1fr"]);
    }



    // Style definition, where we change grid definition as the divider moves
    private ownStyles: SplitterStyles;

    @mim.ref private gridElm: HTMLDivElement;
    @mim.ref private dividerElm: HTMLDivElement;

    /** Flag indicating whether the user is currently dragging the splitter */
    private isDragging = false;

    /** Offset of the point where the user started dragging the divider */
    private dragCoord: number;

    // names of properties used for calculations that depend on the divider direction
    private names: CoordNames;
}


/**
 * Names of coordinate properties and some other names that depend on the splitter direction.
 */
type CoordNames = {
    start: "left" | "top";
    end: "right" | "bottom";
    size: "width" | "height";
    client: "clientX" | "clientY";
    cursor: "col-resize" | "row-resize";
    template: "gridTemplateColumns" | "gridTemplateRows";
}

const HorisontalNames: CoordNames = {
    start: "left",
    end: "right",
    size: "width",
    client: "clientX",
    cursor: "col-resize",
    template: "gridTemplateColumns",
}

const VerticalNames: CoordNames = {
    start: "top",
    end: "bottom",
    size: "height",
    client: "clientY",
    cursor: "row-resize",
    template: "gridTemplateRows",
}



