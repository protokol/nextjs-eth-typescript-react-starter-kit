import chaiModule from "chai";
import chaiAsPromised from "chai-as-promised";
import { chaiEthers } from "chai-ethers";
chaiModule.use(chaiEthers);
chaiModule.use(chaiAsPromised);
export = chaiModule;
