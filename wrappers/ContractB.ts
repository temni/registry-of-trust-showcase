import {
    Address,
    Cell,
    beginCell,
    Contract,
    ContractProvider,
    Sender,
    SendMode,
    toNano, contractAddress
} from '@ton/core';

/*
  ---------------------------
  Contract B Wrapper
  ---------------------------
*/

export const OP_MINT_NFT = 0x3bf21f20;
export const OP_CONSTRUCTOR = 0xfe6cc865;

export class ContractB implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell }
    ) { }

    static createFromAddress(address: Address): ContractB {
        return new ContractB(address);
    }

    static createFromConfig(owner:Address, code: Cell, workchain = 0) {
        const data = beginCell().storeAddress(owner).endCell()
        const init = { code, data };
        return new ContractB(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, contract_a_address: Address, codeC:Cell, value?: bigint) {
        await provider.internal(via, {
            value: value ?? toNano("0.5"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(OP_CONSTRUCTOR, 32)
                .storeUint(0, 64)
                .storeRef(codeC)
                .storeAddress(contract_a_address)
                .endCell()
        });
    }

    /**
     * Sends a mintNft message.
     * This method deploys a new NFT item.
     * @param provider - ContractProvider.
     * @param via - Sender.
     * @param value - Coins to attach.
     */
    async sendMintNft(
        provider: ContractProvider,
        via: Sender,
        value?: bigint
    ): Promise<void> {

        const body = beginCell()
            .storeUint(OP_MINT_NFT, 32)
            .storeUint(0, 64)
            .endCell();

        // Send the internal message with enough TON for storage + fees
        await provider.internal(via, {
            value: value ?? toNano("0.5"),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body,
        });
    }

    async getNftAddressByIndex(provider: ContractProvider, index: bigint) {
        // Pass the index as an int on the stack
        const { stack } = await provider.get('get_item_address_by_index', [
            { type: 'int', value: index }
        ]);

        // The FunC returns a single slice on the stack, which we parse as an Address
        return stack.readAddress(); // Address
    }
}