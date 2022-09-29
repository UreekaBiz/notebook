import { Node } from 'prosemirror-model';
import { filter, map, Observable } from 'rxjs';

import { AttributeType, NodeIdentifier, NodeName } from '@ureeka-notebook/service-common';

import { NodeChange, NodeChanges } from './type';

// ********************************************************************************
export const nodeChangesByNodeName$ = <T extends Node = Node>(nodeName: NodeName, changes$: Observable<NodeChanges>): Observable<NodeChange<T>[]> =>
  changes$.pipe(
    map(changes => changes.get(nodeName)),
    filter(changes => changes !== undefined),
    map(changes => changes as NodeChange<T>[])
  );

export const nodeChangeById$ = <T extends Node = Node>(nodeName: NodeName, nodeId: NodeIdentifier, changes$: Observable<NodeChanges>): Observable<NodeChange<T>> => {
  const nodeChange$ = nodeChangesByNodeName$(nodeName, changes$).pipe(
    map(changes => changes.find(change => change.node.attrs[AttributeType.Id] === nodeId)),
    filter(nodeChange => nodeChange !== undefined),
    map(nodeChange => nodeChange as NodeChange<T>/*by definition*/)
  );
  return nodeChange$;
};
