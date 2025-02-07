import {
    Address,
    Cell,
    Slice,
    beginCell,
    Contract,
    ContractProvider,
    Sender,
    SendMode,
    toNano, contractAddress
} from '@ton/core';


/*
  ---------------------------
  Contract A Wrapper
  ---------------------------
*/
export const OP_MUTATE = 0x75408d35;
export const OP_CONSTRUCTOR = 0xfe6cc865;

export class ContractA implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) { }

    static createFromAddress(address: Address): ContractA {
        return new ContractA(address);
    }

    static createFromConfig(owner:Address, code: Cell, workchain = 0) {
        const data = beginCell().storeAddress(owner).endCell()
        const init = { code, data };
        return new ContractA(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, contract_b_address: Address, value?: bigint) {
        await provider.internal(via, {
            value: value ?? toNano("0.5"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(OP_CONSTRUCTOR, 32)
                .storeUint(0, 64)
                .storeAddress(contract_b_address)
                .endCell(),
        });
    }

    /**
     * Sends a mutate message.
     * @param provider - ContractProvider used to send the message.
     * @param via - The sender of the message.
     * @param callbackOp - The callback op code (to be forwarded to Contract C).
     * @param index - The NFT item index (passed in the message).
     * @param data - A cell containing additional data.
     * @param query_id - Query identifier.
     * @param value - Coins to attach.
     */
    async sendMutate(
        provider: ContractProvider,
        via: Sender,
        callbackOp: number,
        index: bigint,
        data: Cell,
        query_id?: bigint,
        value?: bigint
    ): Promise<void> {
        const queryId = query_id ?? BigInt(Date.now());
        // Build the reference cell with all parameters
        const mutateCell = beginCell() // callback_op, index, data
            .storeUint(callbackOp, 32)                  // callback_op
            .storeUint(index, 64)                  // index
            .storeRef(data);                 // data

        // Build the overall message body:
        //   [op (32 bits), query_id (64 bits), ref(deployParamsCell)]
        const body = beginCell()
            .storeUint(OP_MUTATE, 32)      // e.g. op::deployNft() in your contract
            .storeUint(queryId, 64)     // uint64
            .storeBuilder(mutateCell)            // the parameters cell
            .endCell();

        // Send the internal message with enough TON for storage + fees
        await provider.internal(via, {
            value: value ?? toNano("0.5"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body,
        });

    }
}