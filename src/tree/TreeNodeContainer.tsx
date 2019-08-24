import * as mim from "mimbl";
import {ITreeNode, ITreeNodeContainer, ITreeNodeParams} from "./TreeApi";
import {TreeNode} from "./TreeNode";



///////////////////////////////////////////////////////////////////////////////////////////////////
//
// The TreeNodeContainer class represents a collection of tree nodes that are displayed and
// hidden together.
//
///////////////////////////////////////////////////////////////////////////////////////////////////
export class TreeNodeContainer extends mim.Component
{
	constructor( nodeFactory: () => TreeNode)
	{
		super();

		this.nodes = [];
		this.nodeFactory = nodeFactory;
	}



	// Creates a new node. If the index parameter is between zero and the current number of nodes,
	// the new node is inserted at this index. If the index parameter is undefined or less than
	// zero or greater then the current number of nodes, it is appended to the end of the list.
	public addNode( params: ITreeNodeParams, index?: number): TreeNode
	{
		let currLength = this.nodes.length;
		let node: TreeNode = this.nodeFactory();
		if (index === undefined || index === null || index < 0 || index >= currLength)
		{
			node.index = currLength;
			this.nodes.push( node);
		}
		else
		{
			node.index = index;
			this.nodes.splice( index, 0, node);

			// update indexes of the nodes after the inserted one
			for( let i = index + 1; i < currLength; i++)
				this[i].index = i;
		}

		node.content = params.content;
		node.icon = params.icon;
		node.textColor = params.textColor;
		node.bgColor = params.bgColor;
		node.italic = params.italic;
		node.bold = params.bold;
		node.customClass = params.customClass;
		node.data = params.data;

		this.updateMe();
		return node;
	}



	// Removes existing sub-node at the given index in the sub-nodes list.
	public removeNode( index: number): void
	{
		let currLength = this.nodes.length;
		if (index < 0 || index >= currLength)
			throw new Error( "replaceNode: invalid index " + index);

		this.nodes.splice( index, 1);

		// update indexes of the nodes after the removed one
		for( let i = index; i < currLength; i++)
			this[i].index = i;

		this.updateMe();
	}



	// Removes all sub-nodes.
	public removeAllNodes(): void
	{
		let currLength = this.nodes.length;
		if (currLength > 0)
		{
			this.nodes.splice( 0, currLength);
			this.updateMe();
		}
	}



	// Expands all nodes.
	public expandAll(): void
	{
		for( let node of this.nodes)
		{
			node.expandAll()
		}
	}



	// Colapses all nodes.
	public collapseAll(): void
	{
		for( let node of this.nodes)
		{
			node.collapseAll()
		}
	}



	public render(): any
	{
		return this.nodes;
	}



	// Array of TreeNode objects
	public nodes: TreeNode[];

	// Function that creates instance of TreeNode objects
	private nodeFactory: () => TreeNode;
}



