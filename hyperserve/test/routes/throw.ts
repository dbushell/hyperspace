import type {HyperHandle} from 'jsr:@dbushell/hyperserve';

// Purposefully throw an "Internal Server Error"
export const GET: HyperHandle = () => {
  throw new Error('Throw 500');
};
