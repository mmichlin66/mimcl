import * as mim from "mimbl"
import {ScrollAxis, ScrollAxisAction} from "./ScrollAxis"



/**
 * The VTAbleCellData interface represents information about a single cell that is provided
 * by a caller when requesed by VTable.
 */
export interface VTableCellData
{
	/** Content of the cell */
	content: any;

	/** Number of rows this cell should span. The default value is 1. */
	rowSpan?: number;

	/** Number of columns this cell should span. The default value is 1. */
	colSpan?: number;

	/** Style that should be applied to the `<td>` element containing the cell. */
	style?: mim.StylePropType;

	/** Class that should be applied to the `<td>` element containing the cell. */
	class?: string;
}


export interface VTableProps
{
	/** Number of rows in the entire dataset */
	totalRowCount: number;

	/** Number of columns in the entire dataset */
	totalColCount: number;

	/** Minimal, optimal and maximum number of overscan rows */
	rowOverscan?: [number, number, number];

	/** Minimal, optimal and maximum number of overscan columns */
	colOverscan?: [number, number, number];

	/**
	 * Callback through which VTable requests cell data. 
	 */
	getCellCallback: (row: number, col: number) => any;
}


/**
 * "Virtualized" table that renders only a subset of a dataset and changes this subset
 * as the user scrolls back and forth.
 * 
 * VTable uses the following 3 DOM elements:
 *  - frame - the "outer" `<div>` element which displays the scrollbars when necessary
 *  - wall - the "inner" `<div>` element which has the size of the entire possible table. It is
 *    needed to make scrolling more-or-less accurate.
 *  - table - the `<table>` element that contains only rows and columns that fit the frame plus
 *    a certain number for "overscan".
 * 
 * VTable calculates average row height and column width by dividing the size of the table
 * by the number of rows/columns. These average values are recalculated every time rows and
 * columns are added or deleted from the table. Based on these average values the wall element
 * is sized to include the entire dataset, which helps to achieve more-or-less accurate scrolling
 * positioning.
 *
 * VTable uses minimum, optimal and maximum overscan number of rows and columns on all sides of
 * the frame and makes sure that the actual number of rows/columns is within these minimum and
 * maximum values. During scrolling, if the actual overscan number becomes less than the minimum,
 * new cells are added and if it becomes more then the maximum cells are deleted so that the
 * actual overscan number is equal to the average value.
 */
export class VTable extends mim.Component<VTableProps>
{
	// Overscan variables with default values
	private minRowOverscan: number;
	private optRowOverscan: number;
	private maxRowOverscan: number;
	private minColOverscan: number;
	private optColOverscan: number;
	private maxColOverscan: number;

	// Current dataset represented by row components.
	private rows: VRow[];

	// Index of the first row in the current dataset or 0 if the dataset is empty
	private firstRow: number;

	// Index of the last row in the dataset or -1 if the dataset is empty
	private lastRow: number;

	// Index of the first column in the current dataset or 0 if the dataset is empty
	private firstCol: number;

	// Index of the last column in the current dataset or -1 if the dataset is empty
	private lastCol: number;

	// Counts of rows and columns
	private get rowCount(): number { return this.lastRow - this.firstRow + 1 }
	private get colCount(): number { return this.lastCol - this.firstCol + 1 }

	public get Rows(): string { return `${this.firstRow} - ${this.lastRow}`; }
	public get Cols(): string { return `${this.firstCol} - ${this.lastCol}`; }

	// Size of the entire table based on average row height and column width. This becomes the
	// size of the wall.
	private wallHeight: number;
	private wallWidth: number;

	// Latest calculated average row height and column width
	private avgRowHeight: number;
	private avgColWidth: number;

	// Latest scrolling positions
	private latestScrollTop: number;
	private latestScrollLeft: number;

	// Reference to the frame that has the scollbars
	private frame: HTMLDivElement;
	private frameRef = (r: HTMLDivElement) => this.frame = r;

	// Reference to the wall that is big enough to hold entire dataset
	private wall: HTMLDivElement;
	private wallRef = (r: HTMLDivElement) => this.wall = r;

	// Reference to the table that displays the partial dataset
	private table: HTMLTableElement;
	private tableRef = (r: HTMLTableElement) => this.table = r;

	// Objects that deal with vertical and horizontal scrolling
	private vAxis: ScrollAxis;
	private hAxis: ScrollAxis;



	constructor( props: VTableProps)
	{
		super( props);

		this.avgRowHeight = 0;
		this.avgColWidth = 0;

		// negative values indicate that we haven't measured any sizes yet.
		this.latestScrollTop = -1;
		this.latestScrollLeft = -1;

		// set initial size of the wall element based on some hard-coded values. It will be
		// changed as soon as we render and start measuring our elements
		this.wallHeight = this.props.totalRowCount * 25;
		this.wallWidth = this.props.totalColCount * 80;

		this.minRowOverscan = this.props.rowOverscan ? this.props.rowOverscan[0] : 3;
		this.optRowOverscan = this.props.rowOverscan ? this.props.rowOverscan[1] : 6;
		this.maxRowOverscan = this.props.rowOverscan ? this.props.rowOverscan[2] : 12;

		this.minColOverscan = this.props.colOverscan ? this.props.colOverscan[0] : 3;
		this.optColOverscan = this.props.colOverscan ? this.props.colOverscan[1] : 6;
		this.maxColOverscan = this.props.colOverscan ? this.props.colOverscan[2] : 12;
	}



	public willMount(): void
	{
		this.rows = [];

		// fill in initial dataset
		let rowCount = this.props.totalRowCount < 10 ? this.props.totalRowCount : 10;
		let colCount = this.props.totalColCount < 10 ? this.props.totalColCount : 10;
		for( let i = 0; i < rowCount; i++)
		{
			let vrow = new VRow();
			for( let j = 0; j < colCount; j++)
				vrow.addCell( this.props.getCellCallback( i, j));

			// add the new row at the start
			this.rows.push( vrow);
		}

		// remember the dataset size
		this.firstRow = 0;
		this.lastRow = rowCount - 1;
		this.firstCol = 0;
		this.lastCol = colCount - 1;

		this.vAxis = new ScrollAxis( this.minRowOverscan, this.optRowOverscan, this.maxRowOverscan)
		this.hAxis = new ScrollAxis( this.minColOverscan, this.optColOverscan, this.maxColOverscan)
	}



	public render(): any
	{
		// during each rendering, we schedule the measuring functionality, which will determing
		// whether we need to add/remove cells. The measuring function will run in the next tick
		// after the render and will schedule update in the same tick if necessary.
		this.callMeBeforeUpdate( this.measureAndUpdate);

		let frameStyle = { width:"100%", height: "100%", overflow:"auto" };
		let wallStyle = {
			// width: `${this.wallWidth}px`,
			// height: `${this.wallHeight}px`,
			overflow:"none",
			position: "relative"
		};
		let tableStyle = {
			position: "absolute",
			borderCollapse: "collapse",
			border: "1px solid black"
		};

		return <div id="frame" ref={this.frameRef} style={frameStyle} scroll={this.onScroll}>
			<div id="wall" ref={this.wallRef} style={wallStyle}>
				<table ref={this.tableRef} style={tableStyle}>
					{this.rows}
				</table>
			</div>
		</div>
	}



	/**
	 * Measures the size occupied by the current data set relative to the size of the container
	 * and determines whether we need to add/remove cells. If we do, we schedule re-rendering.
	 */
	private measureAndUpdate = (): void =>
	{
		if (this.rowCount === 0 || this.colCount === 0)
			return;

		let frameRect = this.frame.getBoundingClientRect();
		let wallRect = this.wall.getBoundingClientRect();
		let tableRect = this.table.getBoundingClientRect();

		if (this.latestScrollTop != this.frame.scrollTop)
		{
			// console.log( `Measuring height: scroll top = ${this.frame.scrollTop}, rows: ${this.rowCount}, ` +
			// 				`wall height = ${wallRect.height}, table height = ${tableRect.height}`);

			let vAxisAction = this.vAxis.measure( this.props.totalRowCount, this.firstRow, this.rowCount,
				this.avgRowHeight, frameRect.height, wallRect.height, tableRect.height, this.frame.scrollTop);

			// console.log( `Estimated: wall height = ${vAxisAction.newWallSize}, row height = ${vAxisAction.newAvgItemSize}`);

			// remember the new average row height and the latest vertical scrolling position
			this.avgRowHeight = vAxisAction.newAvgItemSize;
			this.latestScrollTop = this.frame.scrollTop;

			// add/remove rows if needed
			if (!vAxisAction.noAddRemoveNeeded)
				this.updateRows( vAxisAction);

			// schedule updating of wall height and subset vertical offset if needed
			if (vAxisAction.newWallSize != wallRect.height || vAxisAction.newSubsetOffset != tableRect.top - wallRect.top)
			{
				this.callMeAfterUpdate( () => {
					this.table.style.top = vAxisAction.newSubsetOffset + "px";
					this.wall.style.height = vAxisAction.newWallSize + "px";
				});
			}
		}

		if (this.latestScrollLeft != this.frame.scrollLeft)
		{
			// console.log( `Measuring width: scroll left = ${this.frame.scrollLeft}, cols: ${this.colCount}, ` +
			// 				`wall width = ${wallRect.width}, table width = ${tableRect.width}`);

			let hAxisAction = this.hAxis.measure( this.props.totalColCount, this.firstCol, this.colCount,
				this.avgColWidth, frameRect.width, wallRect.width, tableRect.width, this.frame.scrollLeft);

			// console.log( `Estimated: wall width = ${hAxisAction.newWallSize}, col width = ${hAxisAction.newAvgItemSize}`);

			// remember the new average column width and the latest horizontal scrolling position
			this.avgColWidth = hAxisAction.newAvgItemSize;
			this.latestScrollLeft = this.frame.scrollLeft;

			// add/remove columns if needed
			if (!hAxisAction.noAddRemoveNeeded)
				this.updateCols( hAxisAction);

			// schedule updating of wall width and subset horizontal offset if needed
			if (hAxisAction.newWallSize != wallRect.width || hAxisAction.newSubsetOffset != tableRect.left - wallRect.left)
			{
				this.callMeAfterUpdate( () => {
					this.table.style.left = hAxisAction.newSubsetOffset + "px";
					this.wall.style.width = hAxisAction.newWallSize + "px";
				});
			}
		}
	}



	/**
	 * Adds/removes rows as indicated by the given ScrollAxisAction dealing with the vertical
	 * scrolling.
	 */
	private updateRows( axisAction: ScrollAxisAction): void
	{
		// console.log( `Updating rows from ${this.firstRow} - ${this.lastRow} to ${axisAction.newFirst} - ${axisAction.newLast}`);

		if (axisAction.neeedToRemoveAllItems)
		{
			this.rows = [];

			/// #if DEBUG
				console.log( `Removed all ${this.rowCount} existing rows`);
			/// #endif

			for( let i = axisAction.newFirst; i <= axisAction.newLast; i++)
			{
				let vrow = new VRow();
				for( let j = this.firstCol; j <= this.lastCol; j++)
					vrow.addCell( this.props.getCellCallback( i, j));
	
				// add the new row at the end
				this.rows.push( vrow);
			}

			/// #if DEBUG
				console.log( `Add ${axisAction.newLast - axisAction.newFirst + 1} rows`);
			/// #endif
		}
		else
		{
			if (axisAction.countToRemoveAtEnd > 0)
			{
				this.rows.splice( this.rowCount - axisAction.countToRemoveAtEnd, axisAction.countToRemoveAtEnd);

				/// #if DEBUG
					console.log( `Removed ${axisAction.countToRemoveAtEnd} rows from bottom`);
				/// #endif
			}

			if (axisAction.countToRemoveAtStart > 0)
			{
				this.rows.splice( 0, axisAction.countToRemoveAtStart);

				/// #if DEBUG
					console.log( `Removed ${axisAction.countToRemoveAtStart} rows from top`);
				/// #endif
			}

			if (axisAction.countToAddAtEnd > 0)
			{
				for( let i = this.lastRow + 1; i <= axisAction.newLast; i++)
				{
					let vrow = new VRow();
					for( let j = this.firstCol; j <= this.lastCol; j++)
						vrow.addCell( this.props.getCellCallback( i, j));
		
					// add the new row at the start
					this.rows.push( vrow);
				}

				/// #if DEBUG
					console.log( `Add ${axisAction.countToAddAtEnd} rows to bottom`);
				/// #endif
			}

			if (axisAction.countToAddAtStart > 0)
			{
				for( let i = this.firstRow - 1; i >= axisAction.newFirst; i--)
				{
					let vrow = new VRow();
					for( let j = this.firstCol; j <= this.lastCol; j++)
						vrow.addCell( this.props.getCellCallback( i, j));
		
					// add the new row at the start
					this.rows.splice( 0, 0, vrow);
				}

				/// #if DEBUG
					console.log( `Add ${axisAction.countToAddAtStart} rows to top`);
				/// #endif
			}
		}

		this.firstRow = axisAction.newFirst;
		this.lastRow = axisAction.newLast;

		this.updateMe();
	}



	/**
	 * Adds/removes columns as indicated by the given ScrollAxisAction dealing with the
	 * horizontal scrolling.
	 */
	private updateCols( axisAction: ScrollAxisAction): void
	{
		// console.log( `Updating columns from ${this.firstCol} - ${this.lastCol} to ${axisAction.newFirst} - ${axisAction.newLast}`);

		if (axisAction.neeedToRemoveAllItems)
		{
			for( let i = this.firstRow; i <= this.lastRow; i++)
			{
				let vrow = this.rows[i - this.firstRow];
				vrow.removeAllCells();
				for( let j = axisAction.newFirst; j <= axisAction.newLast; j++)
					vrow.addCell( this.props.getCellCallback( i, j));

				vrow.requestUpdate();
			}

			/// #if DEBUG
				console.log( `Removed all ${this.colCount} existing cols`);
				console.log( `Add ${axisAction.newLast - axisAction.newFirst + 1} cols`);
			/// #endif
		}
		else
		{
			if (axisAction.countToRemoveAtEnd > 0)
			{
				for( let vrow of this.rows)
				{
					vrow.removeCellsAtEnd( axisAction.countToRemoveAtEnd);
					vrow.requestUpdate();
				}

				/// #if DEBUG
					console.log( `Removed ${axisAction.countToRemoveAtEnd} cols from right`);
				/// #endif
			}

			if (axisAction.countToRemoveAtStart > 0)
			{
				for( let vrow of this.rows)
				{
					vrow.removeCellsAtStart( axisAction.countToRemoveAtStart);
					vrow.requestUpdate();
				}

				/// #if DEBUG
					console.log( `Removed ${axisAction.countToRemoveAtStart} cols from left`);
				/// #endif
			}

			if (axisAction.countToAddAtEnd > 0)
			{
				for( let i = this.firstRow; i <= this.lastRow; i++)
				{
					let vrow = this.rows[i - this.firstRow];
					for( let j = this.lastCol + 1; j <= axisAction.newLast; j++)
						vrow.addCell( this.props.getCellCallback( i, j));
		
					vrow.requestUpdate();
				}

				/// #if DEBUG
					console.log( `Add ${axisAction.countToAddAtEnd} cols to right`);
				/// #endif
			}

			if (axisAction.countToAddAtStart > 0)
			{
				for( let i = this.firstRow; i <= this.lastRow; i++)
				{
					let vrow = this.rows[i - this.firstRow];
					for( let j = this.firstCol - 1; j >= axisAction.newFirst; j--)
						vrow.insertCell( this.props.getCellCallback( i, j));
		
					vrow.requestUpdate();
				}

				/// #if DEBUG
					console.log( `Add ${axisAction.countToAddAtStart} cols to left`);
				/// #endif
			}
		}

		this.firstCol = axisAction.newFirst;
		this.lastCol = axisAction.newLast;
	}



	private onScroll( e: Event): void
	{
		this.callMeBeforeUpdate( this.measureAndUpdate);
	}
}



class VRow extends mim.Component
{
	cells: VCell[];

	constructor()
	{
		super();

		this.cells = [];
	}

	public addCell( data: any): void
	{
		this.cells.push( new VCell( data));
	}

	public insertCell( data: any): void
	{
		this.cells.splice( 0, 0, new VCell( data));
	}

	public removeAllCells(): void
	{
		this.cells = [];
	}

	public removeCellsAtStart( count: number): void
	{
		this.cells.splice( 0, count);
	}

	public removeCellsAtEnd( count: number): void
	{
		this.cells.splice( this.cells.length - count, count);
	}

	public requestUpdate(): void
	{
		this.updateMe();
	}

	public render(): any
	{
		return <tr>{this.cells}</tr>;
	}
}



class VCell extends mim.Component
{
	data: VTableCellData;

	constructor( data: any)
	{
		super();
		if (typeof data === "object" && "content" in data)
			this.data = data;
		else
			this.data = { content: data };
	}

	public render(): any
	{
		return <td class={this.data.class} style={this.data.style}
					rowspan={this.data.rowSpan ? this.data.rowSpan : undefined}
					colspan={this.data.colSpan ? this.data.colSpan : undefined}>
			{this.data.content}
		</td>
	}
}



