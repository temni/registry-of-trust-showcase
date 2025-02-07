import {
    Address,
    Cell,
    Contract,
    ContractProvider
} from '@ton/core';

/*
  ---------------------------
  Contract C Wrapper
  ---------------------------
*/

export class ContractC implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) { }

    static createFromAddress(address: Address): ContractC {
        return new ContractC(address);
    }

    /**
     * Retrieves counter value for Contract C.
     */
    async getCounterValue(provider: ContractProvider): Promise<bigint>{
        // Assume a getter "get_data" exists.
        const { stack } = await provider.get('get_counter', []);
        return stack.readBigNumber();
    }

}
