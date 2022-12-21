import React, { Component } from 'react';
import { Table, TableData} from '@finos/perspective'; // importing TableData and Table
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
    //changing schema to show ratio and upper & lower bound to trader along with alert trigger
    //we add price of abc stock and def stock to calculate the ratio and timestamp for getting the time & date info
      price_abc: 'float',
      price_def: 'float',
      ratio:'float',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      //Modifying the setAttribute and adding more element as we change the previous schema
      elem.setAttribute('view', 'y_line');// this we need to get the view of graph
      //elem.setAttribute('column-pivots', '["stock"]');  // we don't need it as we change our schema
      elem.setAttribute('row-pivots', '["timestamp"]'); // we need it to show timestamp on datapoint
      elem.setAttribute('columns', '["ratio","lower_bound","upper_bound","trigger_alert"]'); // instead of top_ask_price we need to ratio, lower&upper bound and trigger_alert datapoint on y-axis
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
        timestamp: 'distinct count',
      }));//setting the aggregates which help to deal with the duplicate data and merge them into one data point (data point is unique if it has a unique timestamp)
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData); //modifying the argument for preserving the consistency
      //(assigning 'DataManipulator.generateRow(this.props.data)' to unknown and 'TableData' to unknown)
    }
  }
}

export default Graph;
