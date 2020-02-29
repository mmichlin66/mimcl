import * as mim from "mimbl"
import {tsh} from "mimcss"
import {ITree, ITreeNode, ITreeNodeContainer, ITreeNodeParams} from "./TreeApi"
import {TreeNodeContainer} from "./TreeNodeContainer"
import {TreeNode} from "./TreeNode"



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The Tree class is a general purpose tree control.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class Tree extends mim.ComponentWithLocalStyles implements ITree
{
	constructor()
	{
		super();

		this.tabIndex = 0;
		this.container = new TreeNodeContainer( () => new TreeNode( null, 0, this));
		this.elmRef = new mim.Ref<HTMLDivElement>();

		this.prepareLocalStyles();
	}



	// Tab index of the tree control.
	public get tabIndex(): number { return this.m_tabIndex; }
	public set tabIndex( val: number) { this.m_tabIndex = val; this.updateMe(); }

	// List of sub-nodes.
	public get nodes(): ITreeNode[] { return this.container.nodes; }



	// Creates a new node. If the index parameter is between zero and the current number of nodes,
	// the new node is inserted at this index. If the index parameter is undefined or less than
	// zero or greater then the current number of nodes, it is appended to the end of the list.
	public addNode( params: ITreeNodeParams, index?: number): ITreeNode
	{
		let subNode: TreeNode = this.container.addNode( params, index);
		this.updateMe();
		return subNode;
	}



	// Removes existing node at the given index in the nodes list.
	public removeNode( index: number): void
	{
		this.container.removeNode( index);
		this.updateMe();
	}



	// Removes all nodes.
	public removeAllNodes(): void
	{
		this.container.removeAllNodes();
		this.updateMe();
	}



	// Expands all nodes.
	public expandAll(): void
	{
		this.container.expandAll()
	}


	// Colapses all nodes.
	public collapseAll(): void
	{
		this.container.collapseAll();
	}



	// Returns currently selected node or null if no node is selected.
	public get selectedNode(): ITreeNode { return this.m_selectedNode; }



	public render(): any
	{
		return <div ref={this.elmRef} tabindex={this.tabIndex} class={this.cssClassTree} keydown={this.onKeyDown}>
			{this.container}
		</div>;
	}



	private onKeyDown = (e: KeyboardEvent): void =>
	{
		e.preventDefault();

		if (e.key === "ArrowDown")
			this.selectDown( this.m_selectedNode);
		else if (e.key === "ArrowUp")
			this.selectUp( this.m_selectedNode);
		else if (e.key === "ArrowRight")
			this.expandOrSelectDown( this.m_selectedNode);
		else if (e.key === "ArrowLeft")
			this.collapseOrSelectUp( this.m_selectedNode);
	};



	// Selects the node down from the given node.
	private selectDown( node: TreeNode): void
	{
		let nextNode = this.findDown( node);
		if (nextNode)
		{
			nextNode.select();
			nextNode.scrollIntoView( false);
		}
	}



	// Selects the node up from the given node.
	private selectUp( node: TreeNode): void
	{
		let prevNode = this.findUp( node);
		if (prevNode)
		{
			prevNode.select();
			prevNode.scrollIntoView( true);
		}
	}



	// If the node is collapsed, expands it. If the node is already expanded, selects the first
	// child node. If the node doesn't have children, selects the next node down.
	private expandOrSelectDown( node: TreeNode): void
	{
		if (!node)
			return;

		if (node.container.nodes.length > 0)
		{
			if (node.m_isExpanded)
			{
				let newNode = node.container.nodes[0];
				newNode.select();
				newNode.scrollIntoView( false);
			}
			else
				node.expand();
		}
		else
			this.selectDown( node);
	}



	// If the node is expanded, collapses it; otherwise, selects the node's parent.
	private collapseOrSelectUp( node: TreeNode): void
	{
		if (!node)
			return;

		if (node.m_isExpanded)
			node.collapse();
		else
			this.selectUp( node);
	}



	// Finds node down from the given node.
	private findDown( node: TreeNode, skipExpandedSubNodes: boolean = false): TreeNode
	{
		if (!node)
		{
			if (this.container.nodes.length > 0)
				return this.container.nodes[0];
		}
		else if (skipExpandedSubNodes)
		{
			let container = node.m_parent ? node.m_parent.container : this.container;
			if (node.index < container.nodes.length - 1)
				return container.nodes[node.index + 1];
			else if (node.m_parent)
				return this.findDown( node.m_parent, true);
		}
		else if (node.isExpanded && node.container.nodes.length > 0)
			node.container.nodes[0].select();
		else
			return this.findDown( node, true);

		return null;
	}



	// Finds node up from the given node.
	private findUp( node: TreeNode): TreeNode
	{
		if (!node)
		{
			if (this.container.nodes.length > 0)
				return this.container.nodes[0];
		}
		else if (node.index === 0)
		{
			if (node.m_parent)
				return node.m_parent;
		}
		else
		{
			let container = node.m_parent ? node.m_parent.container : this.container;
			let prevNode = container.nodes[node.index - 1];
			let lastExpandedNode = this.findLastExpandedNode( prevNode);
			return lastExpandedNode ? lastExpandedNode : prevNode;
		}

		return null;
	}



	// Finds node which is the last expanded descendand of the given node.
	private findLastExpandedNode( currNode: TreeNode): TreeNode
	{
		if (!currNode || currNode.container.nodes.length === 0 || !currNode.m_isExpanded)
			return null;

		let lastChild = currNode.container.nodes[currNode.container.nodes.length-1];
		let lastExpandedNode = this.findLastExpandedNode( lastChild);
		return lastExpandedNode ? lastExpandedNode : lastChild;
	}



	private prepareLocalStyles()
	{
		this.cssClassTree = this.decorateName( "tree");
		this.cssRuleTree = this.createStyleRule( "tree", ".tree(*)",
			{
				cursor: "default",
				border: [1, "solid", "dodgerblue"],
				fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
				fontSize: "12px",
				boxSizing: "border-box",
				maxHeight: "100%",
				overflow: "auto",
			}
		);

		this.cssClassNode = this.decorateName( "tree-node");
		this.cssRuleNode = this.createStyleRule( "tree-node", ".tree-node(*)",
			{
				display: "flex",
				alignItems: "center",
			}
		);

		this.cssClassNodeContent = this.decorateName( "tree-node-content");
		this.cssRuleNodeContent = this.createStyleRule( "tree-node-content", ".tree-node-content(*)",
			{
				marginLeft: "2px",
				padding: "1px",
			}
		);

		this.cssRuleNodeContentHover = this.createStyleRule( "tree-node-content:hover", ".tree-node-content(*):hover",
			{
				backgroundColor: "lightcyan",
			}
		);

		this.cssClassNodeContentSelected = this.decorateName( "tree-node-content-selected");
		this.cssRuleNodeContentSelected = this.createStyleRule( "tree-node-content-selected", ".tree-node-content-selected(*)",
			{
				marginLeft: "2px",
				border: [1, "dotted"],
				backgroundColor: "dodgerblue",
				color: "white",
			}
		);

		this.cssClassNodeIcon = this.decorateName( "tree-node-icon");
		this.cssRuleNodeIcon = this.createStyleRule( "tree-node-icon", ".tree-node-icon(*)",
			{
				fontSize: "10px",
				width: tsh.em(1),
				height: tsh.em(1),
			}
		);

		this.cssClassSubnodes = this.decorateName( "tree-subnodes");
		this.cssRuleSubNodes = this.createStyleRule( "tree-subnodes", ".tree-subnodes(*)",
			{
				marginLeft: "16px",
			}
		);
	}



	// Tab index of the tree control.
	private m_tabIndex: number;

	// Container of nodes.
	private container: TreeNodeContainer;

	// Currently selected node or null if no node is selected.
	public m_selectedNode: TreeNode = null;

	// Reference to the element containing the tree.
	public elmRef: mim.Ref<HTMLDivElement>;

	// CSS rules used by the Tree and TreeNode controls
	private cssRuleTree: mim.IMCssStyleRule;
	private cssRuleNode: mim.IMCssStyleRule;
	private cssRuleNodeContent: mim.IMCssStyleRule;
	private cssRuleNodeContentHover: mim.IMCssStyleRule;
	private cssRuleNodeContentSelected: mim.IMCssStyleRule;
	private cssRuleNodeIcon: mim.IMCssStyleRule;
	private cssRuleSubNodes: mim.IMCssStyleRule;

	// CSS local class names
	public cssClassTree: string;
	public cssClassNode: string;
	public cssClassNodeContent: string;
	public cssClassNodeContentSelected: string;
	public cssClassNodeIcon: string;
	public cssClassSubnodes: string;
}



