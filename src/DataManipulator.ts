import { ServerRespond } from './DataStreamer';

export interface Row {
  // as schema in Graph.tsx is modify we have to modify export interface Row for getting raw data from server
  price_abc: number,
  price_def: number,
  ratio: number,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
  timestamp: Date,
  // this changes will help us to get suitable structure as per our schema
}


export class DataManipulator {
// modifying generateRow function so that DataManipulator class process raw server data correctly
  static generateRow(serverResponds: ServerRespond[]): Row {
     const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2; // this has simple meaning as price of stock ABC = average of (top_ask_price(of ABC) & top_bid_price(of ABC));
     const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2; // this has simple meaning as price of stock DEF = average of (top_ask_price(of DEF) & top_bid_price(of DEF));
     const ratio = priceABC / priceDEF; // finding ratio
     const upperBound = 1 + 0.025; // keeping 2.5% margin
     const lowerBound = 1 - 0.025; // keeping 2.5% margin
     return {
        price_abc: priceABC,
        price_def: priceDEF,
        ratio,
        upper_bound: upperBound,
        lower_bound: lowerBound,
        trigger_alert: (ratio>upperBound || ratio<lowerBound) ? ratio : undefined,
        timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ? serverResponds[0].timestamp : serverResponds[1].timestamp,

     };
  }
}
