import { toNano } from '@ton/core';
import { ContractA } from '../wrappers/ContractA';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const contractA = provider.open(
        ContractA.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('ContractA')
        )
    );

    await contractA.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(contractA.address);

    console.log('ID', await contractA.getID());
}
