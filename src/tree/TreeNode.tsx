import * as mim from "mimbl"
import {Styleset, CssColor} from "mimcss"
import {ITree, ITreeNode, ITreeNodeContainer, ITreeNodeParams, TreeNodeIconParams} from "./TreeApi"
import {TreeNodeContainer} from "./TreeNodeContainer"
import {Tree} from "./Tree"



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The TreeNode class represents a single node within a tree control.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class TreeNode extends mim.Component implements ITreeNode
{
	constructor( parent: TreeNode, level: number, tree: Tree = null)
	{
		super();

		this.m_parent = parent;
		this.m_tree = parent !== null ? parent.m_tree : tree;
		this.m_level = level;
		this.container = new TreeNodeContainer( this.nodeFactory);
		this.m_isExpanded = false;
		this.m_isSelected = false;
		this.contentElmRef = new mim.Ref<HTMLSpanElement>();
	}



	// Function that creates instances of sub-nodes of this node.
	private nodeFactory = (): TreeNode =>
	{
		return new TreeNode( this, this.m_level + 1);
	}



	// Tree to which this node belongs.
	public get tree(): ITree { return this.m_tree; }

	// Parent tree node or null for top-level (root) nodes.
	public get parent(): ITreeNode { return this.m_parent; }

	// 0-based level of the node in the ancestral hierarchy.
	public get level(): number { return this.m_level; }



	// 0-based index of the node in the list of its parent's sub-nodes.
	public get index(): number { return this.m_index; }

	// 0-based index of the node in the list of its parent's sub-nodes.
	public set index( val: number) { this.m_index = val; }



	// Node parameters.
	public get content(): string { return this.m_content; }
	public set content( val: string) { this.m_content = val; this.updateMe(); }

	public get icon(): TreeNodeIconParams { return this.m_icon; }
	public set icon( val: TreeNodeIconParams) { this.m_icon = val; this.updateMe(); }

	public get textColor(): CssColor { return this.m_textColor; }
	public set textColor( val: CssColor) { this.m_textColor = val; this.updateMe(); }

	public get bgColor(): CssColor { return this.m_bgColor; }
	public set bgColor( val: CssColor) { this.m_bgColor = val; this.updateMe(); }

	public get italic(): boolean { return this.m_italic; }
	public set italic( val: boolean) { this.m_italic = val; this.updateMe(); }

	public get bold(): boolean { return this.m_bold; }
	public set bold( val: boolean) { this.m_bold = val; this.updateMe(); }

	public get customClass(): string { return this.m_customClass; }
	public set customClass( val: string) { this.m_customClass = val; this.updateMe(); }

	public get data(): any { return this.m_data; }
	public set data( val: any) { this.m_data = val; }



	// Flag indicating whether the node is expanded.
	public get isExpanded(): boolean { return this.m_isExpanded; }



	// Expands the node so that its sub-nodes become visible.
	public expand(): void
	{
		if (this.container.nodes.length > 0 && this.m_isExpanded !== true)
		{
			this.m_isExpanded = true;
			this.updateMe()
		}
	}



	// Colapses the node hiding its sub-nodes.
	public collapse(): void
	{
		if (this.container.nodes.length > 0 && this.m_isExpanded !== false)
		{
			this.m_isExpanded = false;
			this.updateMe()
		}
	}



	// Selects the node.
	public select(): void
	{
		if (this.m_isSelected !== true)
		{
			// unselect the currently selected node (if any)
			if (this.m_tree.m_selectedNode != null)
				this.m_tree.m_selectedNode.unselect();

			this.m_tree.m_selectedNode = this;
			this.m_isSelected = true;
			this.updateMe();
		}
	}



	// Unselects the node.
	public unselect(): void
	{
		if (this.m_isSelected !== false)
		{
			this.m_tree.m_selectedNode = null;
			this.m_isSelected = false;
			this.updateMe();
		}
	}



	// List of sub-nodes.
	public get subNodes(): ITreeNode[] { return this.container.nodes; }



	// Creates a new node. If the index parameter is between zero and the current number of nodes,
	// the new node is inserted at this index. If the index parameter is undefined or less than
	// zero or greater then the current number of nodes, it is appended to the end of the list.
	public addNode( params: ITreeNodeParams, index?: number): ITreeNode
	{
		let subNode: TreeNode = this.container.addNode( params, index);

		// update only if this was the first sub-node
		if (this.container.nodes.length === 1)
			this.updateMe();

		return subNode;
	}



	// Removes existing node at the given index in the nodes list.
	public removeNode( index: number): void
	{
		let oldLength = this.container.nodes.length;
		this.container.removeNode( index);

		// update only if this was the last sub-node
		if (oldLength === 1 && this.container.nodes.length === 0)
		{
			this.m_isExpanded = false;
			this.updateMe();
		}
	}



	// Removes all nodes.
	public removeAllNodes(): void
	{
		let oldLength = this.container.nodes.length;
		if (oldLength > 0)
		{
			this.container.removeAllNodes();
			this.m_isExpanded = false;
			this.updateMe();
		}
	}



	// Expands all nodes.
	public expandAll(): void
	{
		this.expand();
		this.container.expandAll();
	}


	// Colapses all nodes.
	public collapseAll(): void
	{
		this.collapse();
		this.container.collapseAll();
	}



	// Check whether the node is not within the viewport and scrolls it into view alinging it
	// with the upper or lower edge of the tree container.
	public scrollIntoView( alignUp: boolean): void
	{
		if (!this.m_tree.elmRef.r || !this.contentElmRef.r)
			return;

		// get tree and node bounding rect
		let rcTree: ClientRect = this.m_tree.elmRef.r.getBoundingClientRect();
		let rcNode: ClientRect = this.contentElmRef.r.getBoundingClientRect();
		if (rcNode.bottom <= rcTree.bottom && rcNode.top >= rcTree.top)
			return;

		this.contentElmRef.r.scrollIntoView( alignUp);
	}



	public render(): any
	{
		return <mim.Fragment>
			{this.renderNode()}
			{this.renderSubNodes()}
		</mim.Fragment>;
	}



	public renderNode(): any
	{
		let expanderClassName: string = this.container.nodes.length === 0 ? "" : this.m_isExpanded ? "fa-caret-down" : "fa-caret-right";

		let iconContent: any;
		if (this.m_icon)
		{
			if ("class" in this.m_icon)
				iconContent = <span class={this.m_tree.cssClassNodeIcon + " " + this.m_icon.class}
									click={this.onClick} dblclick={this.onDblClick} />;
			else if ("img" in this.m_icon)
				iconContent = <img class={this.m_tree.cssClassNodeIcon} src={this.m_icon.img}
									click={this.onClick} dblclick={this.onDblClick} />;
		}

		let contentClass: string = this.m_isSelected ? this.m_tree.cssClassNodeContentSelected : this.m_tree.cssClassNodeContent;
		if (this.m_customClass)
			contentClass += " " + this.m_customClass;

		let contentStyle: Styleset = {};
		if (this.m_textColor)
			contentStyle.color = this.m_textColor;
		if (this.m_bgColor)
			contentStyle.backgroundColor = this.m_bgColor;
		if (this.m_italic)
			contentStyle.fontStyle = "italic";
		if (this.m_bold)
			contentStyle.fontWeight = "bold";

		return <div class={this.m_tree.cssClassNode}>
			<i class={"fa fa-fw " + expanderClassName} click={this.onExpanderClicked} />
			{iconContent}
			<span ref={this.contentElmRef} dragSource class={contentClass} style={contentStyle}
					click={this.onClick} dblclick={this.onDblClick}>{this.m_content}</span>
		</div>;
	}



	public renderSubNodes(): any
	{
		if (this.subNodes.length === 0)
			return null;

		return <div class={this.m_tree.cssClassSubnodes} style={{display:this.m_isExpanded ? "block" : "none"}}>
			{this.container}
		</div>;
	}



	// Called when the user clicks on icon or name.
	private onClick = (e: MouseEvent): void =>
	{
		this.select();
	}



	// Called when the user double-clicks on icon or name.
	private onDblClick = (e: MouseEvent): void =>
	{
		e.preventDefault();
		e.stopPropagation();

		if (this.subNodes.length === 0)
			return;

		this.m_isExpanded ? this.collapse() : this.expand();
	}



	// Called when the userclicks on the expander icon
	private onExpanderClicked = (e: MouseEvent): void =>
	{
		this.m_isExpanded ? this.collapse() : this.expand();
	}



	// Tree control to which this node belongs
	public m_tree: Tree;

	// Parent node
	public m_parent: TreeNode;

	// 0-based indentation level of the block
	public m_level: number;

	// 0-based indentation level of the block
	public m_index: number;

	// Container of sub-nodes.
	public container: TreeNodeContainer;

	// Flag indicating whether the node is currently expanded (that is sub-nodes are visible).
	public m_isExpanded: boolean;

	// Flag indicating whether the node is currently selected.
	public m_isSelected: boolean;

	// Reference to the element containing the node's content.
	public contentElmRef: mim.Ref<HTMLSpanElement>;

	// Node parameters
	private m_content: string;
	private m_icon: TreeNodeIconParams;
	private m_textColor: CssColor;
	private m_bgColor: CssColor;
	private m_italic: boolean;
	private m_bold: boolean;
	private m_customClass: string;
	private m_data: any;
}



