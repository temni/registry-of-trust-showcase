import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import {beginCell, Cell, fromNano, toNano} from '@ton/core';
import {ContractA} from '../wrappers/ContractA';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import {ContractB} from "../wrappers/ContractB";
import {ContractC} from "../wrappers/ContractC";

describe('Primary workflow test', () => {
    let codeA: Cell;
    let codeB: Cell;
    let codeC: Cell;

    beforeAll(async () => {
        codeA = await compile('ContractA');
        codeB = await compile('ContractB');
        codeC = await compile('ContractC');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let contractA: SandboxContract<ContractA>;
    let contractB: SandboxContract<ContractB>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        contractA = blockchain.openContract(ContractA.createFromConfig(deployer.address, codeA));
        contractB = blockchain.openContract(ContractB.createFromConfig(deployer.address, codeB));

        const deployResultA = await contractA.sendDeploy(deployer.getSender(), contractB.address);
        expect(deployResultA.transactions).toHaveTransaction({
            from: deployer.address,
            to: contractA.address,
            deploy: true,
            success: true,
        });

        const deployResultB = await contractB.sendDeploy(deployer.getSender(), contractA.address, codeC);
        expect(deployResultB.transactions).toHaveTransaction({
            from: deployer.address,
            to: contractB.address,
            deploy: true,
            success: true,
        });
    });

    it('Should mint a new contract_c and mutate it successfully', async () => {
        const mintResult = await contractB.sendMintNft(deployer.getSender());
        expect(mintResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: contractB.address,
            success: true
        });

        const nftIndex = 0n;

        const contractC = blockchain.openContract(ContractC.createFromAddress(await contractB.getNftAddressByIndex(nftIndex)));
        let counterValue = await contractC.getCounterValue();
        expect(counterValue).toEqual(0n);

        const balanceStart = await deployer.getBalance();
        // mutate the first NFT and increase it's counter by 30
        const mutateResult = await contractA.sendMutate(deployer.getSender(), 1150, nftIndex, beginCell().storeUint(1997, 32).endCell());
        // check first transaction is ok
        expect(mutateResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: contractA.address,
            success: true
        });
        // check the last one is ok
        expect(mutateResult.transactions).toHaveTransaction({
            from: contractA.address,
            to: deployer.address,
            success: true,
            op: 1150
        });
        console.log(`Grams spent on transaction: ${fromNano(balanceStart - (await deployer.getBalance()))} TON`)

        // check counter has now this value
        counterValue = await contractC.getCounterValue();
        expect(counterValue).toEqual(1997n);

        // add 3 more
        await contractA.sendMutate(deployer.getSender(), 1150, nftIndex, beginCell().storeUint(4, 32).endCell());

        // check counter has now this value
        counterValue = await contractC.getCounterValue();
        expect(counterValue).toEqual(2001n);

    });
});
